import { Router, Response } from 'express';
import { prisma, Prisma } from '@shelfwise/database';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/authorize.js';

const router = Router();

const FINE_RATE_PER_DAY = 0.50; // $0.50 per day overdue

// GET /api/fines - List all fines
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { status, memberId } = req.query;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.FineWhereInput = {};

    if (status) {
      where.status = status as string;
    }

    if (memberId) {
      where.borrowing = { memberId: memberId as string };
    }

    const [fines, total] = await Promise.all([
      prisma.fine.findMany({
        where,
        include: {
          borrowing: {
            include: {
              member: {
                select: { id: true, firstName: true, lastName: true, memberNumber: true },
              },
              bookCopy: {
                include: {
                  book: { select: { id: true, title: true, author: true } },
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.fine.count({ where }),
    ]);

    res.json({
      fines,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get fines error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/fines/stats - Get fine statistics
router.get('/stats', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const [totalFines, pendingFines, paidFines, waivedFines] = await Promise.all([
      prisma.fine.aggregate({ _sum: { amount: true }, _count: true }),
      prisma.fine.aggregate({ where: { status: 'PENDING' }, _sum: { amount: true }, _count: true }),
      prisma.fine.aggregate({ where: { status: 'PAID' }, _sum: { amount: true }, _count: true }),
      prisma.fine.aggregate({ where: { status: 'WAIVED' }, _sum: { amount: true }, _count: true }),
    ]);

    res.json({
      total: {
        count: totalFines._count,
        amount: totalFines._sum.amount || 0,
      },
      pending: {
        count: pendingFines._count,
        amount: pendingFines._sum.amount || 0,
      },
      paid: {
        count: paidFines._count,
        amount: paidFines._sum.amount || 0,
      },
      waived: {
        count: waivedFines._count,
        amount: waivedFines._sum.amount || 0,
      },
    });
  } catch (error) {
    console.error('Get fine stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/fines/calculate - Calculate fines for overdue books (ADMIN only)
router.post('/calculate', authMiddleware, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    // Find all active overdue borrowings without fines
    const overdueBorrowings = await prisma.borrowing.findMany({
      where: {
        status: 'ACTIVE',
        dueDate: { lt: new Date() },
      },
      include: {
        fines: true,
        member: { select: { id: true, firstName: true, lastName: true } },
        bookCopy: { include: { book: { select: { title: true } } } },
      },
    });

    const newFines = [];

    for (const borrowing of overdueBorrowings) {
      // Check if there's already a pending fine for this borrowing
      const existingFine = borrowing.fines.find(f => f.status === 'PENDING');

      const daysOverdue = Math.ceil(
        (Date.now() - borrowing.dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const fineAmount = daysOverdue * FINE_RATE_PER_DAY;

      if (existingFine) {
        // Update existing fine amount
        await prisma.fine.update({
          where: { id: existingFine.id },
          data: { amount: fineAmount },
        });
      } else {
        // Create new fine
        const fine = await prisma.fine.create({
          data: {
            borrowingId: borrowing.id,
            amount: fineAmount,
            reason: 'OVERDUE',
          },
        });
        newFines.push(fine);
      }
    }

    res.json({
      message: `Calculated fines for ${overdueBorrowings.length} overdue borrowings`,
      newFinesCreated: newFines.length,
      fineRate: FINE_RATE_PER_DAY,
    });
  } catch (error) {
    console.error('Calculate fines error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/fines - Create a manual fine (ADMIN only)
router.post('/', authMiddleware, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { borrowingId, amount, reason } = req.body;

    if (!borrowingId || !amount || !reason) {
      return res.status(400).json({ error: 'Borrowing ID, amount, and reason are required' });
    }

    const borrowing = await prisma.borrowing.findUnique({ where: { id: borrowingId } });
    if (!borrowing) {
      return res.status(404).json({ error: 'Borrowing not found' });
    }

    const fine = await prisma.fine.create({
      data: {
        borrowingId,
        amount: parseFloat(amount),
        reason,
      },
      include: {
        borrowing: {
          include: {
            member: { select: { firstName: true, lastName: true, memberNumber: true } },
            bookCopy: { include: { book: { select: { title: true } } } },
          },
        },
      },
    });

    res.status(201).json(fine);
  } catch (error) {
    console.error('Create fine error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/fines/:id/pay - Mark fine as paid
router.put('/:id/pay', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const fine = await prisma.fine.findUnique({ where: { id } });
    if (!fine) {
      return res.status(404).json({ error: 'Fine not found' });
    }

    if (fine.status !== 'PENDING') {
      return res.status(400).json({ error: `Fine is already ${fine.status.toLowerCase()}` });
    }

    const updated = await prisma.fine.update({
      where: { id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
      include: {
        borrowing: {
          include: {
            member: { select: { firstName: true, lastName: true, memberNumber: true } },
          },
        },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Pay fine error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/fines/:id/waive - Waive a fine (ADMIN only)
router.put('/:id/waive', authMiddleware, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const fine = await prisma.fine.findUnique({ where: { id } });
    if (!fine) {
      return res.status(404).json({ error: 'Fine not found' });
    }

    if (fine.status !== 'PENDING') {
      return res.status(400).json({ error: `Fine is already ${fine.status.toLowerCase()}` });
    }

    const updated = await prisma.fine.update({
      where: { id },
      data: { status: 'WAIVED' },
      include: {
        borrowing: {
          include: {
            member: { select: { firstName: true, lastName: true, memberNumber: true } },
          },
        },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Waive fine error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/fines/:id - Get single fine
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const fine = await prisma.fine.findUnique({
      where: { id },
      include: {
        borrowing: {
          include: {
            member: { select: { id: true, firstName: true, lastName: true, memberNumber: true, email: true } },
            bookCopy: { include: { book: { select: { id: true, title: true, author: true } } } },
          },
        },
      },
    });

    if (!fine) {
      return res.status(404).json({ error: 'Fine not found' });
    }

    res.json(fine);
  } catch (error) {
    console.error('Get fine error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/fines/:id - Delete a fine (ADMIN only)
router.delete('/:id', authMiddleware, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.fine.delete({ where: { id } });
    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete fine error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Fine not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
