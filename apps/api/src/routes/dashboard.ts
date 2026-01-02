import { Router, Response } from 'express';
import { prisma } from '@shelfwise/database';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
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
      // Book stats (filtered by current user)
      prisma.book.count({ where: { userId } }),
      prisma.bookCopy.count({ where: { book: { userId } } }),
      prisma.bookCopy.count({ where: { status: 'AVAILABLE', book: { userId } } }),

      // Member stats (filtered by current user)
      prisma.member.count({ where: { userId } }),
      prisma.member.count({ where: { status: 'ACTIVE', userId } }),

      // Borrowing stats (filtered by current user's members)
      prisma.borrowing.count({ where: { status: 'ACTIVE', member: { userId } } }),
      prisma.borrowing.count({
        where: {
          status: 'ACTIVE',
          dueDate: { lt: now },
          member: { userId },
        },
      }),

      // Today's activity (filtered by current user's members)
      prisma.borrowing.count({
        where: {
          borrowDate: { gte: todayStart },
          member: { userId },
        },
      }),
      prisma.borrowing.count({
        where: {
          returnDate: { gte: todayStart },
          member: { userId },
        },
      }),

      // Recent borrowings (filtered by current user's members)
      prisma.borrowing.findMany({
        where: { member: { userId } },
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

    // Get categories distribution (filtered by current user)
    const categoryStats = await prisma.book.groupBy({
      by: ['category'],
      where: { userId },
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

// POST /api/dashboard/seed-demo - Load demo data for empty libraries
router.post('/seed-demo', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Check if THIS USER's library already has data
    const [bookCount, memberCount] = await Promise.all([
      prisma.book.count({ where: { userId } }),
      prisma.member.count({ where: { userId } }),
    ]);

    if (bookCount > 0 || memberCount > 0) {
      return res.status(400).json({
        error: 'Demo data can only be loaded into an empty library. Please delete existing data first.'
      });
    }

    // Sample books data
    const booksData = [
      { isbn: '978-0-06-112008-4', title: 'To Kill a Mockingbird', author: 'Harper Lee', category: 'Fiction', publishedYear: 1960, description: 'A classic novel about racial injustice in the American South' },
      { isbn: '978-0-452-28423-4', title: '1984', author: 'George Orwell', category: 'Science Fiction', publishedYear: 1949, description: 'Dystopian novel about totalitarianism and surveillance' },
      { isbn: '978-0-7432-7356-5', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', category: 'Fiction', publishedYear: 1925, description: 'A tale of wealth, love, and the American Dream' },
      { isbn: '978-0-14-028329-7', title: 'Pride and Prejudice', author: 'Jane Austen', category: 'Romance', publishedYear: 1813, description: 'A witty romance set in Georgian England' },
      { isbn: '978-0-316-76948-0', title: 'The Catcher in the Rye', author: 'J.D. Salinger', category: 'Fiction', publishedYear: 1951, description: 'Coming-of-age story about teenage alienation' },
      { isbn: '978-0-06-093546-7', title: 'To Kill a Kingdom', author: 'Alexandra Christo', category: 'Fantasy', publishedYear: 2018, description: 'A dark fantasy retelling of The Little Mermaid' },
      { isbn: '978-0-441-78592-8', title: 'Neuromancer', author: 'William Gibson', category: 'Science Fiction', publishedYear: 1984, description: 'The quintessential cyberpunk novel' },
      { isbn: '978-0-7432-7357-2', title: 'The Road', author: 'Cormac McCarthy', category: 'Fiction', publishedYear: 2006, description: 'Post-apocalyptic tale of a father and son' },
      { isbn: '978-0-06-093545-0', title: 'Brave New World', author: 'Aldous Huxley', category: 'Science Fiction', publishedYear: 1932, description: 'A dystopian vision of the future' },
      { isbn: '978-0-14-028330-3', title: 'Jane Eyre', author: 'Charlotte Brontë', category: 'Romance', publishedYear: 1847, description: 'Gothic romance and female independence' },
      { isbn: '978-0-553-21311-5', title: 'Dune', author: 'Frank Herbert', category: 'Science Fiction', publishedYear: 1965, description: 'Epic science fiction about politics and ecology' },
      { isbn: '978-0-7432-7358-9', title: 'The Hobbit', author: 'J.R.R. Tolkien', category: 'Fantasy', publishedYear: 1937, description: 'The adventure of Bilbo Baggins' },
    ];

    // Sample members data
    const membersData = [
      { firstName: 'John', lastName: 'Smith', email: 'john.smith@email.com', phone: '555-0101', address: '123 Main St, Anytown' },
      { firstName: 'Emily', lastName: 'Johnson', email: 'emily.j@email.com', phone: '555-0102', address: '456 Oak Ave, Somewhere' },
      { firstName: 'Michael', lastName: 'Williams', email: 'mwilliams@email.com', phone: '555-0103', address: '789 Pine Rd, Elsewhere' },
      { firstName: 'Sarah', lastName: 'Brown', email: 'sarah.brown@email.com', phone: '555-0104', address: '321 Elm St, Nowhere' },
      { firstName: 'David', lastName: 'Jones', email: 'djones@email.com', phone: '555-0105', address: '654 Maple Dr, Anywhere' },
      { firstName: 'Jessica', lastName: 'Garcia', email: 'jgarcia@email.com', phone: '555-0106', address: '987 Cedar Ln, Someplace' },
      { firstName: 'Robert', lastName: 'Miller', email: 'rmiller@email.com', phone: '555-0107', address: '147 Birch Blvd, Othertown' },
      { firstName: 'Amanda', lastName: 'Davis', email: 'amanda.d@email.com', phone: '555-0108', address: '258 Spruce Way, Thisville' },
    ];

    // Create books with copies (associated with current user)
    // Use short userId suffix for unique barcodes per user
    const userSuffix = userId.slice(-6);
    const createdBooks = [];
    for (const bookData of booksData) {
      const book = await prisma.book.create({
        data: {
          ...bookData,
          userId, // Associate with current user
          copies: {
            create: [
              { barcode: `${bookData.isbn}-${userSuffix}-001`, condition: 'GOOD', shelfLocation: 'A1', status: 'AVAILABLE' },
              { barcode: `${bookData.isbn}-${userSuffix}-002`, condition: 'GOOD', shelfLocation: 'A1', status: 'AVAILABLE' },
            ],
          },
        },
        include: { copies: true },
      });
      createdBooks.push(book);
    }

    // Create members (associated with current user)
    const createdMembers = [];
    let memberCounter = 1;
    for (const memberData of membersData) {
      const member = await prisma.member.create({
        data: {
          ...memberData,
          memberNumber: `LIB-${String(memberCounter++).padStart(3, '0')}`,
          status: 'ACTIVE',
          userId, // Associate with current user
        },
      });
      createdMembers.push(member);
    }

    // Create some active borrowings
    const now = new Date();
    const borrowingsToCreate = [
      { memberIndex: 0, bookIndex: 0, daysAgo: 5, dueDays: 9 }, // Active, not overdue
      { memberIndex: 1, bookIndex: 2, daysAgo: 20, dueDays: -6 }, // Overdue by 6 days
      { memberIndex: 2, bookIndex: 4, daysAgo: 3, dueDays: 11 }, // Active, not overdue
      { memberIndex: 3, bookIndex: 6, daysAgo: 25, dueDays: -11 }, // Overdue by 11 days
      { memberIndex: 4, bookIndex: 8, daysAgo: 7, dueDays: 7 }, // Active, due today
    ];

    for (const b of borrowingsToCreate) {
      const borrowDate = new Date(now);
      borrowDate.setDate(borrowDate.getDate() - b.daysAgo);
      const dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() + b.dueDays);

      const copy = createdBooks[b.bookIndex].copies[0];

      await prisma.borrowing.create({
        data: {
          memberId: createdMembers[b.memberIndex].id,
          bookCopyId: copy.id,
          borrowDate,
          dueDate,
          status: 'ACTIVE',
        },
      });

      // Mark the copy as borrowed
      await prisma.bookCopy.update({
        where: { id: copy.id },
        data: { status: 'BORROWED' },
      });
    }

    // Create some returned borrowings (history)
    const historyBorrowings = [
      { memberIndex: 5, bookIndex: 1, daysAgo: 30, dueDays: 16, returnedDaysAgo: 18 },
      { memberIndex: 6, bookIndex: 3, daysAgo: 45, dueDays: 31, returnedDaysAgo: 32 },
      { memberIndex: 7, bookIndex: 5, daysAgo: 60, dueDays: 46, returnedDaysAgo: 50 },
    ];

    for (const b of historyBorrowings) {
      const borrowDate = new Date(now);
      borrowDate.setDate(borrowDate.getDate() - b.daysAgo);
      const dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() - b.dueDays);
      const returnDate = new Date(now);
      returnDate.setDate(returnDate.getDate() - b.returnedDaysAgo);

      const copy = createdBooks[b.bookIndex].copies[1]; // Use second copy

      await prisma.borrowing.create({
        data: {
          memberId: createdMembers[b.memberIndex].id,
          bookCopyId: copy.id,
          borrowDate,
          dueDate,
          returnDate,
          status: 'RETURNED',
        },
      });
    }

    res.json({
      message: 'Demo data loaded successfully',
      summary: {
        books: createdBooks.length,
        copies: createdBooks.length * 2,
        members: createdMembers.length,
        activeBorrowings: borrowingsToCreate.length,
        returnedBorrowings: historyBorrowings.length,
      },
    });
  } catch (error) {
    console.error('Seed demo data error:', error);
    res.status(500).json({ error: 'Failed to load demo data' });
  }
});

export default router;
