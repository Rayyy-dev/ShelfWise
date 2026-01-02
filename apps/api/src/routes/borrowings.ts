import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '@shelfwise/database';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/authorize.js';

const router = Router();

const DEFAULT_LOAN_DAYS = 14;

// GET /api/borrowings - List borrowings
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { status, memberId } = req.query;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.BorrowingWhereInput = {
      member: { userId: req.user!.id }, // Filter by current user's members
    };

    if (status) {
      if (status === 'OVERDUE') {
        where.status = 'ACTIVE';
        where.dueDate = { lt: new Date() };
      } else {
        where.status = status as string;
      }
    }

    if (memberId) {
      where.memberId = memberId as string;
    }

    const [borrowings, total] = await Promise.all([
      prisma.borrowing.findMany({
        where,
        include: {
          member: {
            select: { id: true, firstName: true, lastName: true, memberNumber: true },
          },
          bookCopy: {
            include: {
              book: {
                select: { id: true, title: true, author: true },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { borrowDate: 'desc' },
      }),
      prisma.borrowing.count({ where }),
    ]);

    // Mark overdue status
    const borrowingsWithOverdue = borrowings.map((b) => ({
      ...b,
      isOverdue: b.status === 'ACTIVE' && new Date(b.dueDate) < new Date(),
    }));

    res.json({
      borrowings: borrowingsWithOverdue,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get borrowings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/borrowings/checkout - Checkout a book
router.post('/checkout', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { memberId, barcode, dueDate } = req.body;

    if (!memberId || !barcode) {
      return res.status(400).json({ error: 'Member ID and barcode are required' });
    }

    // Validate member (must belong to current user)
    const member = await prisma.member.findFirst({
      where: { id: memberId, userId: req.user!.id },
      include: {
        borrowings: { where: { status: 'ACTIVE' } },
      },
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    if (member.status !== 'ACTIVE') {
      return res.status(400).json({ error: `Member account is ${member.status.toLowerCase()}` });
    }

    if (member.borrowings.length >= member.maxBooks) {
      return res.status(400).json({
        error: `Member has reached borrowing limit (${member.maxBooks} books)`,
      });
    }

    // Validate book copy (must belong to current user's books)
    const bookCopy = await prisma.bookCopy.findFirst({
      where: { barcode, book: { userId: req.user!.id } },
      include: { book: true },
    });

    if (!bookCopy) {
      return res.status(404).json({ error: 'Book copy not found' });
    }

    if (bookCopy.status !== 'AVAILABLE') {
      return res.status(400).json({ error: `Book is currently ${bookCopy.status.toLowerCase()}` });
    }

    // Calculate due date
    const calculatedDueDate = dueDate
      ? new Date(dueDate)
      : new Date(Date.now() + DEFAULT_LOAN_DAYS * 24 * 60 * 60 * 1000);

    // Create borrowing in transaction
    const borrowing = await prisma.$transaction(async (tx) => {
      // Update book copy status
      await tx.bookCopy.update({
        where: { id: bookCopy.id },
        data: { status: 'BORROWED' },
      });

      // Create borrowing record
      return tx.borrowing.create({
        data: {
          memberId: member.id,
          bookCopyId: bookCopy.id,
          dueDate: calculatedDueDate,
        },
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
      });
    });

    res.status(201).json(borrowing);
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/borrowings/:id/return - Return a book
router.post('/:id/return', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { condition } = req.body;

    const borrowing = await prisma.borrowing.findFirst({
      where: { id, member: { userId: req.user!.id } }, // Filter by current user
      include: { bookCopy: true },
    });

    if (!borrowing) {
      return res.status(404).json({ error: 'Borrowing not found' });
    }

    if (borrowing.status === 'RETURNED') {
      return res.status(400).json({ error: 'Book already returned' });
    }

    const now = new Date();
    const isOverdue = borrowing.dueDate < now;
    const daysOverdue = isOverdue
      ? Math.ceil((now.getTime() - borrowing.dueDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Return book in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update borrowing
      const updated = await tx.borrowing.update({
        where: { id },
        data: {
          returnDate: now,
          status: 'RETURNED',
        },
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
      });

      // Update book copy
      await tx.bookCopy.update({
        where: { id: borrowing.bookCopyId },
        data: {
          status: 'AVAILABLE',
          condition: condition || borrowing.bookCopy.condition,
        },
      });

      return updated;
    });

    res.json({
      ...result,
      wasOverdue: isOverdue,
      daysOverdue,
    });
  } catch (error) {
    console.error('Return error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/borrowings/:id - Get single borrowing
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const borrowing = await prisma.borrowing.findFirst({
      where: { id, member: { userId: req.user!.id } }, // Filter by current user
      include: {
        member: {
          select: { id: true, firstName: true, lastName: true, memberNumber: true, email: true, phone: true },
        },
        bookCopy: {
          include: {
            book: { select: { id: true, title: true, author: true, isbn: true, category: true } },
          },
        },
      },
    });

    if (!borrowing) {
      return res.status(404).json({ error: 'Borrowing not found' });
    }

    const isOverdue = borrowing.status === 'ACTIVE' && new Date(borrowing.dueDate) < new Date();
    const daysOverdue = isOverdue
      ? Math.ceil((Date.now() - borrowing.dueDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    res.json({
      ...borrowing,
      isOverdue,
      daysOverdue,
    });
  } catch (error) {
    console.error('Get borrowing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/borrowings/:id - Update borrowing (extend due date, etc.)
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { dueDate, status } = req.body;

    const borrowing = await prisma.borrowing.findFirst({
      where: { id, member: { userId: req.user!.id } }, // Filter by current user
      include: { bookCopy: true },
    });

    if (!borrowing) {
      return res.status(404).json({ error: 'Borrowing not found' });
    }

    const updateData: Prisma.BorrowingUpdateInput = {};

    if (dueDate) {
      updateData.dueDate = new Date(dueDate);
    }

    if (status && status !== borrowing.status) {
      updateData.status = status as 'ACTIVE' | 'RETURNED';

      // If marking as returned, set return date and update book copy
      if (status === 'RETURNED' && borrowing.status === 'ACTIVE') {
        updateData.returnDate = new Date();
        await prisma.bookCopy.update({
          where: { id: borrowing.bookCopyId },
          data: { status: 'AVAILABLE' },
        });
      }

      // If reactivating a returned borrowing
      if (status === 'ACTIVE' && borrowing.status === 'RETURNED') {
        updateData.returnDate = null;
        await prisma.bookCopy.update({
          where: { id: borrowing.bookCopyId },
          data: { status: 'BORROWED' },
        });
      }
    }

    const updated = await prisma.borrowing.update({
      where: { id },
      data: updateData,
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
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Update borrowing error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Borrowing not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/borrowings/:id - Delete a borrowing record (ADMIN only)
router.delete('/:id', authMiddleware, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const borrowing = await prisma.borrowing.findFirst({
      where: { id, member: { userId: req.user!.id } }, // Filter by current user
      include: { bookCopy: true },
    });

    if (!borrowing) {
      return res.status(404).json({ error: 'Borrowing not found' });
    }

    // If the book is still borrowed, mark it as available
    if (borrowing.status === 'ACTIVE') {
      await prisma.$transaction(async (tx) => {
        await tx.bookCopy.update({
          where: { id: borrowing.bookCopyId },
          data: { status: 'AVAILABLE' },
        });
        await tx.borrowing.delete({ where: { id } });
      });
    } else {
      await prisma.borrowing.delete({ where: { id } });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete borrowing error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Borrowing not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/borrowings/overdue - Get overdue books
router.get('/overdue/list', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const overdue = await prisma.borrowing.findMany({
      where: {
        status: 'ACTIVE',
        dueDate: { lt: new Date() },
        member: { userId: req.user!.id }, // Filter by current user
      },
      include: {
        member: {
          select: { id: true, firstName: true, lastName: true, memberNumber: true, email: true },
        },
        bookCopy: {
          include: {
            book: { select: { id: true, title: true, author: true } },
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    const overdueWithDays = overdue.map((b) => ({
      ...b,
      daysOverdue: Math.ceil((Date.now() - b.dueDate.getTime()) / (1000 * 60 * 60 * 24)),
    }));

    res.json(overdueWithDays);
  } catch (error) {
    console.error('Get overdue error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
