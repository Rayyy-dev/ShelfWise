import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '@shelfwise/database';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/authorize.js';

const router = Router();

// Generate next member number for a specific user
async function getNextMemberNumber(userId: string): Promise<string> {
  const lastMember = await prisma.member.findFirst({
    where: { userId },
    orderBy: { memberNumber: 'desc' },
  });

  if (!lastMember) {
    return 'LIB-001';
  }

  const lastNumber = parseInt(lastMember.memberNumber.split('-')[1]);
  return `LIB-${String(lastNumber + 1).padStart(3, '0')}`;
}

// GET /api/members - List all members
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { search, status } = req.query;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.MemberWhereInput = {
      userId: req.user!.id, // Filter by current user
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search as string }, userId: req.user!.id },
        { lastName: { contains: search as string }, userId: req.user!.id },
        { email: { contains: search as string }, userId: req.user!.id },
        { memberNumber: { contains: search as string }, userId: req.user!.id },
      ];
    }

    if (status) {
      where.status = status as string;
    }

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        include: {
          _count: {
            select: {
              borrowings: { where: { status: 'ACTIVE' } },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.member.count({ where }),
    ]);

    const membersWithActiveLoans = members.map((member: any) => ({
      ...member,
      activeLoans: member._count.borrowings,
    }));

    res.json({
      members: membersWithActiveLoans,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/members/:id - Get single member with borrowing history
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const member = await prisma.member.findFirst({
      where: { id, userId: req.user!.id }, // Filter by current user
      include: {
        borrowings: {
          include: {
            bookCopy: {
              include: {
                book: {
                  select: { id: true, title: true, author: true },
                },
              },
            },
          },
          orderBy: { borrowDate: 'desc' },
          take: 50,
        },
      },
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({
      ...member,
      activeLoans: member.borrowings.filter((b: any) => b.status === 'ACTIVE').length,
    });
  } catch (error) {
    console.error('Get member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/members - Create new member (ADMIN only)
router.post('/', authMiddleware, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { firstName, lastName, email, phone, address, maxBooks } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: 'First name, last name, and email are required' });
    }

    const memberNumber = await getNextMemberNumber(req.user!.id);

    const member = await prisma.member.create({
      data: {
        memberNumber,
        firstName,
        lastName,
        email,
        phone,
        address,
        maxBooks: maxBooks || 5,
        userId: req.user!.id, // Associate with current user
      },
    });

    res.status(201).json(member);
  } catch (error: any) {
    console.error('Create member error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'A member with this email already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/members/:id - Update member (ADMIN only)
router.put('/:id', authMiddleware, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, address, status, maxBooks } = req.body;

    // Verify member belongs to this user
    const existing = await prisma.member.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const member = await prisma.member.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        phone,
        address,
        status,
        maxBooks,
      },
    });

    res.json(member);
  } catch (error: any) {
    console.error('Update member error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Member not found' });
    }
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'A member with this email already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/members/:id - Delete member (ADMIN only, only if no active loans)
router.delete('/:id', authMiddleware, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verify member belongs to this user
    const existing = await prisma.member.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const activeLoans = await prisma.borrowing.count({
      where: { memberId: id, status: 'ACTIVE' },
    });

    if (activeLoans > 0) {
      return res.status(400).json({ error: 'Cannot delete member with active loans' });
    }

    await prisma.member.delete({ where: { id } });
    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete member error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
