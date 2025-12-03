import { Router, Request, Response } from 'express';
import { prisma } from '@shelfwise/database';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

const DEFAULT_LOAN_DAYS = 14;

// GET /api/borrowings - List borrowings
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { status, memberId, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};

    if (status) {
      if (status === 'OVERDUE') {
        where.status = 'ACTIVE';
        where.dueDate = { lt: new Date() };
      } else {
        where.status = status;
      }
    }

    if (memberId) {
      where.memberId = memberId;
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
        take: parseInt(limit as string),
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
      page: parseInt(page as string),
      totalPages: Math.ceil(total / parseInt(limit as string)),
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

    // Validate member
    const member = await prisma.member.findUnique({
      where: { id: memberId },
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

    // Validate book copy
    const bookCopy = await prisma.bookCopy.findUnique({
      where: { barcode },
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

    const borrowing = await prisma.borrowing.findUnique({
      where: { id },
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

// DELETE /api/borrowings/:id - Delete a borrowing record
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const borrowing = await prisma.borrowing.findUnique({
      where: { id },
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
