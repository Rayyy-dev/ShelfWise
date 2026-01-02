import { Router, Response } from 'express';
import { prisma, Prisma } from '@shelfwise/database';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/authorize.js';

const router = Router();

// GET /api/books - List all books with search/filter
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { search, category } = req.query;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.BookWhereInput = {
      userId: req.user!.id, // Filter by current user
    };

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' }, userId: req.user!.id },
        { author: { contains: search as string, mode: 'insensitive' }, userId: req.user!.id },
        { isbn: { contains: search as string, mode: 'insensitive' }, userId: req.user!.id },
      ];
    }

    if (category) {
      where.category = category as string;
    }

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        include: {
          copies: {
            select: {
              id: true,
              barcode: true,
              status: true,
              condition: true,
              shelfLocation: true,
            },
          },
          _count: {
            select: { copies: true },
          },
        },
        skip,
        take: limit,
        orderBy: { title: 'asc' },
      }),
      prisma.book.count({ where }),
    ]);

    // Add availability counts
    const booksWithAvailability = books.map((book) => ({
      ...book,
      totalCopies: book.copies.length,
      availableCopies: book.copies.filter((c) => c.status === 'AVAILABLE').length,
    }));

    res.json({
      books: booksWithAvailability,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/books/available-copies - Get all available book copies for checkout
router.get('/available-copies', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const copies = await prisma.bookCopy.findMany({
      where: {
        status: 'AVAILABLE',
        book: { userId: req.user!.id }, // Filter by current user's books
      },
      include: {
        book: {
          select: { id: true, title: true, author: true, isbn: true, category: true },
        },
      },
      orderBy: { book: { title: 'asc' } },
    });

    res.json(copies);
  } catch (error) {
    console.error('Get available copies error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/books/categories - Get unique categories
router.get('/categories', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const categories = await prisma.book.findMany({
      where: { userId: req.user!.id }, // Filter by current user
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });

    res.json(categories.map((c) => c.category));
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/books/:id - Get single book with copies
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const book = await prisma.book.findFirst({
      where: { id, userId: req.user!.id }, // Filter by current user
      include: {
        copies: {
          include: {
            borrowings: {
              where: { status: 'ACTIVE' },
              include: {
                member: {
                  select: { id: true, firstName: true, lastName: true, memberNumber: true },
                },
              },
            },
          },
          orderBy: { barcode: 'asc' },
        },
      },
    });

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json({
      ...book,
      totalCopies: book.copies.length,
      availableCopies: book.copies.filter((c) => c.status === 'AVAILABLE').length,
    });
  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/books - Create new book (ADMIN only)
router.post('/', authMiddleware, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { isbn, title, author, category, description, publishedYear, coverImage, copies } = req.body;

    if (!title || !author || !category) {
      return res.status(400).json({ error: 'Title, author, and category are required' });
    }

    const book = await prisma.book.create({
      data: {
        isbn,
        title,
        author,
        category,
        description,
        publishedYear,
        coverImage,
        userId: req.user!.id, // Associate with current user
        copies: copies?.length
          ? {
              create: copies.map((barcode: string) => ({
                barcode,
                status: 'AVAILABLE',
                condition: 'NEW',
              })),
            }
          : undefined,
      },
      include: {
        copies: true,
      },
    });

    res.status(201).json(book);
  } catch (error: any) {
    console.error('Create book error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'A book with this ISBN already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/books/:id - Update book (ADMIN only)
router.put('/:id', authMiddleware, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isbn, title, author, category, description, publishedYear, coverImage } = req.body;

    // First verify the book belongs to this user
    const existing = await prisma.book.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const book = await prisma.book.update({
      where: { id },
      data: {
        isbn,
        title,
        author,
        category,
        description,
        publishedYear,
        coverImage,
      },
      include: {
        copies: true,
      },
    });

    res.json(book);
  } catch (error: any) {
    console.error('Update book error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/books/:id - Delete book (ADMIN only)
router.delete('/:id', authMiddleware, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verify book belongs to this user
    const existing = await prisma.book.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Check if any copies are borrowed
    const borrowedCopies = await prisma.borrowing.count({
      where: {
        bookCopy: { bookId: id },
        status: 'ACTIVE',
      },
    });

    if (borrowedCopies > 0) {
      return res.status(400).json({ error: 'Cannot delete book with active borrowings' });
    }

    await prisma.book.delete({ where: { id } });
    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete book error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/books/:id/copies - Add copy to book (ADMIN only)
router.post('/:id/copies', authMiddleware, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { barcode, condition, shelfLocation } = req.body;

    if (!barcode) {
      return res.status(400).json({ error: 'Barcode is required' });
    }

    // Verify book belongs to this user
    const book = await prisma.book.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const copy = await prisma.bookCopy.create({
      data: {
        bookId: id,
        barcode,
        condition: condition || 'NEW',
        shelfLocation,
        status: 'AVAILABLE',
      },
    });

    res.status(201).json(copy);
  } catch (error: any) {
    console.error('Add copy error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'A copy with this barcode already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/books/copies/:copyId - Update copy (ADMIN only)
router.put('/copies/:copyId', authMiddleware, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { copyId } = req.params;
    const { barcode, status, condition, shelfLocation } = req.body;

    // Verify copy belongs to a book owned by this user
    const existing = await prisma.bookCopy.findFirst({
      where: { id: copyId, book: { userId: req.user!.id } },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Copy not found' });
    }

    const copy = await prisma.bookCopy.update({
      where: { id: copyId },
      data: { barcode, status, condition, shelfLocation },
    });

    res.json(copy);
  } catch (error: any) {
    console.error('Update copy error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Copy not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
