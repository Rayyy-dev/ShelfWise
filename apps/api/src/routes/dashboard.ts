import { Router, Response } from 'express';
import { prisma } from '@shelfwise/database';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalBooks,
      totalCopies,
      availableCopies,
      totalMembers,
      activeMembers,
      activeBorrowings,
      overdueBorrowings,
      borrowingsToday,
      returnsToday,
      recentBorrowings,
    ] = await Promise.all([
      // Book stats
      prisma.book.count(),
      prisma.bookCopy.count(),
      prisma.bookCopy.count({ where: { status: 'AVAILABLE' } }),

      // Member stats
      prisma.member.count(),
      prisma.member.count({ where: { status: 'ACTIVE' } }),

      // Borrowing stats
      prisma.borrowing.count({ where: { status: 'ACTIVE' } }),
      prisma.borrowing.count({
        where: {
          status: 'ACTIVE',
          dueDate: { lt: now },
        },
      }),

      // Today's activity
      prisma.borrowing.count({
        where: {
          borrowDate: { gte: todayStart },
        },
      }),
      prisma.borrowing.count({
        where: {
          returnDate: { gte: todayStart },
        },
      }),

      // Recent borrowings
      prisma.borrowing.findMany({
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
        orderBy: { borrowDate: 'desc' },
        take: 10,
      }),
    ]);

    // Get categories distribution
    const categoryStats = await prisma.book.groupBy({
      by: ['category'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    res.json({
      stats: {
        totalBooks,
        totalCopies,
        availableCopies,
        borrowedCopies: totalCopies - availableCopies,
        totalMembers,
        activeMembers,
        activeBorrowings,
        overdueBorrowings,
        borrowingsToday,
        returnsToday,
      },
      categoryStats: categoryStats.map((c) => ({
        category: c.category,
        count: c._count.id,
      })),
      recentBorrowings: recentBorrowings.map((b) => ({
        ...b,
        isOverdue: b.status === 'ACTIVE' && new Date(b.dueDate) < now,
      })),
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
