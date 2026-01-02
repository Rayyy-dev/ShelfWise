import { Router, Response } from 'express';
import { prisma } from '@shelfwise/database';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import PDFDocument from 'pdfkit';

// Helper to generate PDF table
function generatePdfTable(doc: PDFKit.PDFDocument, title: string, headers: string[], rows: string[][]) {
  const pageWidth = doc.page.width - 100;
  const colWidth = pageWidth / headers.length;
  const startX = 50;
  let y = doc.y;

  // Title
  doc.fontSize(18).font('Helvetica-Bold').text(title, startX, 50);
  doc.fontSize(10).font('Helvetica').text(`Generated: ${new Date().toLocaleDateString()}`, startX, 75);
  y = 110;

  // Headers
  doc.fontSize(9).font('Helvetica-Bold');
  headers.forEach((header, i) => {
    doc.text(header, startX + (i * colWidth), y, { width: colWidth - 5, align: 'left' });
  });
  y += 20;
  doc.moveTo(startX, y).lineTo(startX + pageWidth, y).stroke();
  y += 10;

  // Rows
  doc.font('Helvetica').fontSize(8);
  rows.forEach((row) => {
    if (y > doc.page.height - 80) {
      doc.addPage();
      y = 50;
    }
    const rowHeight = 15;
    row.forEach((cell, i) => {
      doc.text(String(cell || ''), startX + (i * colWidth), y, { width: colWidth - 5, align: 'left' });
    });
    y += rowHeight;
  });
}

const router = Router();

// GET /api/reports/books - Export books data
router.get('/books', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { format = 'json' } = req.query;
    const userId = req.user!.id;

    const books = await prisma.book.findMany({
      where: { userId }, // Filter by current user
      include: {
        copies: {
          select: { id: true, barcode: true, status: true, condition: true, shelfLocation: true },
        },
      },
      orderBy: { title: 'asc' },
    });

    const reportData = books.map((book: any) => ({
      id: book.id,
      isbn: book.isbn || 'N/A',
      title: book.title,
      author: book.author,
      category: book.category,
      publishedYear: book.publishedYear || 'N/A',
      totalCopies: book.copies.length,
      availableCopies: book.copies.filter((c: any) => c.status === 'AVAILABLE').length,
      borrowedCopies: book.copies.filter((c: any) => c.status === 'BORROWED').length,
    }));

    const headers = ['ISBN', 'Title', 'Author', 'Category', 'Year', 'Total', 'Available', 'Borrowed'];

    if (format === 'csv') {
      const csvRows = [
        headers.join(','),
        ...reportData.map((row: any) => [
          `"${row.isbn}"`,
          `"${row.title.replace(/"/g, '""')}"`,
          `"${row.author.replace(/"/g, '""')}"`,
          `"${row.category}"`,
          row.publishedYear,
          row.totalCopies,
          row.availableCopies,
          row.borrowedCopies,
        ].join(',')),
      ];

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=books_report.csv');
      return res.send(csvRows.join('\n'));
    }

    if (format === 'pdf') {
      const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=books_report.pdf');
      doc.pipe(res);

      const rows = reportData.map((row: any) => [
        row.isbn, row.title, row.author, row.category,
        String(row.publishedYear), String(row.totalCopies), String(row.availableCopies), String(row.borrowedCopies)
      ]);
      generatePdfTable(doc, 'Books Inventory Report', headers, rows);
      doc.end();
      return;
    }

    res.json({
      generatedAt: new Date().toISOString(),
      totalBooks: books.length,
      data: reportData,
    });
  } catch (error) {
    console.error('Books report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/reports/members - Export members data
router.get('/members', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { format = 'json' } = req.query;
    const userId = req.user!.id;

    const members = await prisma.member.findMany({
      where: { userId }, // Filter by current user
      include: {
        borrowings: {
          where: { status: 'ACTIVE' },
        },
      },
      orderBy: { memberNumber: 'asc' },
    });

    const reportData = members.map((member: any) => ({
      id: member.id,
      memberNumber: member.memberNumber,
      name: `${member.firstName} ${member.lastName}`,
      email: member.email,
      phone: member.phone || 'N/A',
      status: member.status,
      activeLoans: member.borrowings.length,
      maxBooks: member.maxBooks,
      memberSince: member.createdAt.toISOString().split('T')[0],
    }));

    const headers = ['Member #', 'Name', 'Email', 'Phone', 'Status', 'Active Loans', 'Max Books', 'Since'];

    if (format === 'csv') {
      const csvRows = [
        headers.join(','),
        ...reportData.map((row: any) => [
          row.memberNumber,
          `"${row.name}"`,
          row.email,
          row.phone,
          row.status,
          row.activeLoans,
          row.maxBooks,
          row.memberSince,
        ].join(',')),
      ];

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=members_report.csv');
      return res.send(csvRows.join('\n'));
    }

    if (format === 'pdf') {
      const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=members_report.pdf');
      doc.pipe(res);

      const rows = reportData.map((row: any) => [
        row.memberNumber, row.name, row.email, row.phone,
        row.status, String(row.activeLoans), String(row.maxBooks), row.memberSince
      ]);
      generatePdfTable(doc, 'Members Directory Report', headers, rows);
      doc.end();
      return;
    }

    res.json({
      generatedAt: new Date().toISOString(),
      totalMembers: members.length,
      data: reportData,
    });
  } catch (error) {
    console.error('Members report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/reports/borrowings - Export borrowings data
router.get('/borrowings', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { format = 'json', status, startDate, endDate } = req.query;
    const userId = req.user!.id;

    const where: any = {
      member: { userId }, // Filter by current user
    };
    if (status) where.status = status;
    if (startDate || endDate) {
      where.borrowDate = {};
      if (startDate) where.borrowDate.gte = new Date(startDate as string);
      if (endDate) where.borrowDate.lte = new Date(endDate as string);
    }

    const borrowings = await prisma.borrowing.findMany({
      where,
      include: {
        member: { select: { memberNumber: true, firstName: true, lastName: true } },
        bookCopy: {
          include: { book: { select: { title: true, author: true } } },
        },
      },
      orderBy: { borrowDate: 'desc' },
    });

    const reportData = borrowings.map((b: any) => {
      const isOverdue = b.status === 'ACTIVE' && new Date(b.dueDate) < new Date();
      return {
        id: b.id,
        memberNumber: b.member.memberNumber,
        memberName: `${b.member.firstName} ${b.member.lastName}`,
        bookTitle: b.bookCopy.book.title,
        bookAuthor: b.bookCopy.book.author,
        barcode: b.bookCopy.barcode,
        borrowDate: b.borrowDate.toISOString().split('T')[0],
        dueDate: b.dueDate.toISOString().split('T')[0],
        returnDate: b.returnDate ? b.returnDate.toISOString().split('T')[0] : 'N/A',
        status: isOverdue ? 'OVERDUE' : b.status,
      };
    });

    const headers = ['Member #', 'Member', 'Book', 'Author', 'Barcode', 'Borrowed', 'Due', 'Returned', 'Status'];

    if (format === 'csv') {
      const csvRows = [
        headers.join(','),
        ...reportData.map((row: any) => [
          row.memberNumber,
          `"${row.memberName}"`,
          `"${row.bookTitle.replace(/"/g, '""')}"`,
          `"${row.bookAuthor.replace(/"/g, '""')}"`,
          row.barcode,
          row.borrowDate,
          row.dueDate,
          row.returnDate,
          row.status,
        ].join(',')),
      ];

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=borrowings_report.csv');
      return res.send(csvRows.join('\n'));
    }

    if (format === 'pdf') {
      const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=borrowings_report.pdf');
      doc.pipe(res);

      const rows = reportData.map((row: any) => [
        row.memberNumber, row.memberName, row.bookTitle, row.bookAuthor,
        row.barcode, row.borrowDate, row.dueDate, row.returnDate, row.status
      ]);
      generatePdfTable(doc, 'Borrowing History Report', headers, rows);
      doc.end();
      return;
    }

    res.json({
      generatedAt: new Date().toISOString(),
      totalBorrowings: borrowings.length,
      data: reportData,
    });
  } catch (error) {
    console.error('Borrowings report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/reports/fines - Export fines data
router.get('/fines', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { format = 'json', status } = req.query;
    const userId = req.user!.id;

    const where: any = {
      borrowing: { member: { userId } }, // Filter by current user
    };
    if (status) where.status = status;

    const fines = await prisma.fine.findMany({
      where,
      include: {
        borrowing: {
          include: {
            member: { select: { memberNumber: true, firstName: true, lastName: true } },
            bookCopy: { include: { book: { select: { title: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const reportData = fines.map((f: any) => ({
      id: f.id,
      memberNumber: f.borrowing.member.memberNumber,
      memberName: `${f.borrowing.member.firstName} ${f.borrowing.member.lastName}`,
      bookTitle: f.borrowing.bookCopy.book.title,
      amount: f.amount.toFixed(2),
      reason: f.reason,
      status: f.status,
      createdAt: f.createdAt.toISOString().split('T')[0],
      paidAt: f.paidAt ? f.paidAt.toISOString().split('T')[0] : 'N/A',
    }));

    const headers = ['Member #', 'Member', 'Book', 'Amount', 'Reason', 'Status', 'Created', 'Paid At'];

    if (format === 'csv') {
      const csvRows = [
        headers.join(','),
        ...reportData.map((row: any) => [
          row.memberNumber,
          `"${row.memberName}"`,
          `"${row.bookTitle.replace(/"/g, '""')}"`,
          row.amount,
          row.reason,
          row.status,
          row.createdAt,
          row.paidAt,
        ].join(',')),
      ];

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=fines_report.csv');
      return res.send(csvRows.join('\n'));
    }

    if (format === 'pdf') {
      const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=fines_report.pdf');
      doc.pipe(res);

      const rows = reportData.map((row: any) => [
        row.memberNumber, row.memberName, row.bookTitle, `$${row.amount}`,
        row.reason, row.status, row.createdAt, row.paidAt
      ]);
      generatePdfTable(doc, 'Fines Report', headers, rows);
      doc.end();
      return;
    }

    res.json({
      generatedAt: new Date().toISOString(),
      totalFines: fines.length,
      data: reportData,
    });
  } catch (error) {
    console.error('Fines report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/reports/overdue - Export overdue books report
router.get('/overdue', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { format = 'json' } = req.query;
    const userId = req.user!.id;

    const overdue = await prisma.borrowing.findMany({
      where: {
        status: 'ACTIVE',
        dueDate: { lt: new Date() },
        member: { userId }, // Filter by current user
      },
      include: {
        member: { select: { memberNumber: true, firstName: true, lastName: true, email: true, phone: true } },
        bookCopy: { include: { book: { select: { title: true, author: true } } } },
      },
      orderBy: { dueDate: 'asc' },
    });

    const reportData = overdue.map((b: any) => {
      const daysOverdue = Math.ceil((Date.now() - b.dueDate.getTime()) / (1000 * 60 * 60 * 24));
      const estimatedFine = (daysOverdue * 0.5).toFixed(2);
      return {
        id: b.id,
        memberNumber: b.member.memberNumber,
        memberName: `${b.member.firstName} ${b.member.lastName}`,
        memberEmail: b.member.email,
        memberPhone: b.member.phone || 'N/A',
        bookTitle: b.bookCopy.book.title,
        bookAuthor: b.bookCopy.book.author,
        barcode: b.bookCopy.barcode,
        dueDate: b.dueDate.toISOString().split('T')[0],
        daysOverdue,
        estimatedFine,
      };
    });

    const headers = ['Member #', 'Member', 'Email', 'Phone', 'Book', 'Barcode', 'Due Date', 'Days', 'Est. Fine'];

    if (format === 'csv') {
      const csvRows = [
        headers.join(','),
        ...reportData.map((row: any) => [
          row.memberNumber,
          `"${row.memberName}"`,
          row.memberEmail,
          row.memberPhone,
          `"${row.bookTitle.replace(/"/g, '""')}"`,
          row.barcode,
          row.dueDate,
          row.daysOverdue,
          row.estimatedFine,
        ].join(',')),
      ];

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=overdue_report.csv');
      return res.send(csvRows.join('\n'));
    }

    if (format === 'pdf') {
      const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=overdue_report.pdf');
      doc.pipe(res);

      const rows = reportData.map((row: any) => [
        row.memberNumber, row.memberName, row.memberEmail, row.memberPhone,
        row.bookTitle, row.barcode, row.dueDate, String(row.daysOverdue), `$${row.estimatedFine}`
      ]);
      generatePdfTable(doc, 'Overdue Books Report', headers, rows);
      doc.end();
      return;
    }

    res.json({
      generatedAt: new Date().toISOString(),
      totalOverdue: overdue.length,
      data: reportData,
    });
  } catch (error) {
    console.error('Overdue report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/reports/summary - Get overall library summary
router.get('/summary', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const userFilter = { borrowing: { member: { userId } } };

    const [
      totalBooks,
      totalCopies,
      availableCopies,
      borrowedCopies,
      totalMembers,
      activeMembers,
      activeBorrowings,
      overdueBorrowings,
      totalFines,
      pendingFines,
      paidFines,
      categoryStats,
    ] = await Promise.all([
      prisma.book.count({ where: { userId } }),
      prisma.bookCopy.count({ where: { book: { userId } } }),
      prisma.bookCopy.count({ where: { status: 'AVAILABLE', book: { userId } } }),
      prisma.bookCopy.count({ where: { status: 'BORROWED', book: { userId } } }),
      prisma.member.count({ where: { userId } }),
      prisma.member.count({ where: { status: 'ACTIVE', userId } }),
      prisma.borrowing.count({ where: { status: 'ACTIVE', member: { userId } } }),
      prisma.borrowing.count({ where: { status: 'ACTIVE', dueDate: { lt: new Date() }, member: { userId } } }),
      prisma.fine.aggregate({ where: userFilter, _sum: { amount: true }, _count: true }),
      prisma.fine.aggregate({ where: { ...userFilter, status: 'PENDING' }, _sum: { amount: true }, _count: true }),
      prisma.fine.aggregate({ where: { ...userFilter, status: 'PAID' }, _sum: { amount: true }, _count: true }),
      prisma.book.groupBy({ by: ['category'], where: { userId }, _count: true }),
    ]);

    res.json({
      generatedAt: new Date().toISOString(),
      inventory: {
        totalBooks,
        totalCopies,
        availableCopies,
        borrowedCopies,
        utilizationRate: totalCopies > 0 ? ((borrowedCopies / totalCopies) * 100).toFixed(1) + '%' : '0%',
      },
      members: {
        total: totalMembers,
        active: activeMembers,
        activeRate: totalMembers > 0 ? ((activeMembers / totalMembers) * 100).toFixed(1) + '%' : '0%',
      },
      borrowings: {
        active: activeBorrowings,
        overdue: overdueBorrowings,
        overdueRate: activeBorrowings > 0 ? ((overdueBorrowings / activeBorrowings) * 100).toFixed(1) + '%' : '0%',
      },
      finances: {
        totalFinesCount: totalFines._count,
        totalFinesAmount: totalFines._sum.amount || 0,
        pendingFinesCount: pendingFines._count,
        pendingFinesAmount: pendingFines._sum.amount || 0,
        collectedAmount: paidFines._sum.amount || 0,
        collectionRate: totalFines._sum.amount && totalFines._sum.amount > 0
          ? (((paidFines._sum.amount || 0) / totalFines._sum.amount) * 100).toFixed(1) + '%'
          : '0%',
      },
      categoryDistribution: categoryStats.map((c: any) => ({
        category: c.category,
        count: c._count,
      })),
    });
  } catch (error) {
    console.error('Summary report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/reports/insights - Management insights and analytics
router.get('/insights', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Top 10 most borrowed books (all time) - filtered by current user
    const borrowingCounts = await prisma.borrowing.groupBy({
      by: ['bookCopyId'],
      where: { member: { userId } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 50,
    });

    const topBookCopyIds = borrowingCounts.map((b: any) => b.bookCopyId);
    const topBookCopies = await prisma.bookCopy.findMany({
      where: { id: { in: topBookCopyIds }, book: { userId } },
      include: { book: { select: { id: true, title: true, author: true, category: true } } },
    });

    // Aggregate by book (not copy)
    const bookBorrowCounts: Record<string, { book: any; count: number }> = {};
    borrowingCounts.forEach((bc: any) => {
      const copy = topBookCopies.find((c: any) => c.id === bc.bookCopyId);
      if (copy) {
        const bookId = copy.book.id;
        if (!bookBorrowCounts[bookId]) {
          bookBorrowCounts[bookId] = { book: copy.book, count: 0 };
        }
        bookBorrowCounts[bookId].count += bc._count.id;
      }
    });

    const topBorrowedBooks = Object.values(bookBorrowCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((item, index) => ({
        rank: index + 1,
        title: item.book.title,
        author: item.book.author,
        category: item.book.category,
        borrowCount: item.count,
      }));

    // Most active members (by total borrowings) - filtered by current user
    const memberBorrowings = await prisma.borrowing.groupBy({
      by: ['memberId'],
      where: { member: { userId } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    const topMemberIds = memberBorrowings.map((m: any) => m.memberId);
    const topMembers = await prisma.member.findMany({
      where: { id: { in: topMemberIds }, userId },
      select: { id: true, memberNumber: true, firstName: true, lastName: true, status: true },
    });

    const mostActiveMembers = memberBorrowings.map((mb: any, index: number) => {
      const member = topMembers.find((m: any) => m.id === mb.memberId);
      return {
        rank: index + 1,
        memberNumber: member?.memberNumber || 'Unknown',
        name: member ? `${member.firstName} ${member.lastName}` : 'Unknown',
        status: member?.status || 'Unknown',
        totalBorrowings: mb._count.id,
      };
    });

    // Category performance (most popular categories) - filtered by current user
    const categoryBorrowings = await prisma.borrowing.findMany({
      where: { member: { userId } },
      include: {
        bookCopy: {
          include: { book: { select: { category: true } } },
        },
      },
    });

    const categoryPerformance: Record<string, number> = {};
    categoryBorrowings.forEach((b: any) => {
      const cat = b.bookCopy.book.category;
      categoryPerformance[cat] = (categoryPerformance[cat] || 0) + 1;
    });

    const topCategories = Object.entries(categoryPerformance)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, count], index) => ({
        rank: index + 1,
        category,
        borrowCount: count,
      }));

    // Members with most overdue fines - filtered by current user
    const memberFines = await prisma.fine.findMany({
      where: { status: 'PENDING', borrowing: { member: { userId } } },
      include: {
        borrowing: {
          include: {
            member: { select: { id: true, memberNumber: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    const memberFineAggregates: Record<string, { member: any; amount: number; count: number }> = {};
    memberFines.forEach((f: any) => {
      const memberId = f.borrowing.memberId;
      if (!memberFineAggregates[memberId]) {
        memberFineAggregates[memberId] = {
          member: f.borrowing.member,
          amount: 0,
          count: 0,
        };
      }
      memberFineAggregates[memberId].amount += f.amount;
      memberFineAggregates[memberId].count += 1;
    });

    const membersWithHighestFines = Object.values(memberFineAggregates)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map((item, index) => ({
        rank: index + 1,
        memberNumber: item.member.memberNumber,
        name: `${item.member.firstName} ${item.member.lastName}`,
        pendingFines: item.count,
        totalOwed: parseFloat(item.amount.toFixed(2)),
      }));

    // Generate management recommendations - filtered by current user
    const [totalBorrowings, returnedBorrowings, overdueBorrowings] = await Promise.all([
      prisma.borrowing.count({ where: { member: { userId } } }),
      prisma.borrowing.count({ where: { status: 'RETURNED', member: { userId } } }),
      prisma.borrowing.count({ where: { status: 'ACTIVE', dueDate: { lt: new Date() }, member: { userId } } }),
    ]);

    const returnRate = totalBorrowings > 0 ? (returnedBorrowings / totalBorrowings) * 100 : 0;
    const overdueRate = totalBorrowings > 0 ? (overdueBorrowings / totalBorrowings) * 100 : 0;

    const recommendations: string[] = [];

    if (overdueRate > 15) {
      recommendations.push('High overdue rate detected. Consider sending reminder notifications before due dates.');
    }
    if (membersWithHighestFines.length > 0 && membersWithHighestFines[0].totalOwed > 20) {
      recommendations.push('Some members have significant outstanding fines. Consider implementing a payment plan option.');
    }
    if (topCategories.length > 0) {
      recommendations.push(`"${topCategories[0].category}" is your most popular category. Consider expanding inventory in this area.`);
    }
    if (returnRate > 80) {
      recommendations.push('Excellent return rate! Your members are responsibly returning books on time.');
    }

    // Monthly trend (last 6 months) - filtered by current user
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentBorrowings = await prisma.borrowing.findMany({
      where: { borrowDate: { gte: sixMonthsAgo }, member: { userId } },
      select: { borrowDate: true },
    });

    const monthlyTrend: Record<string, number> = {};
    recentBorrowings.forEach((b: any) => {
      const monthKey = b.borrowDate.toISOString().slice(0, 7); // YYYY-MM
      monthlyTrend[monthKey] = (monthlyTrend[monthKey] || 0) + 1;
    });

    const borrowingTrend = Object.entries(monthlyTrend)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, borrowings: count }));

    res.json({
      generatedAt: new Date().toISOString(),
      topBorrowedBooks,
      mostActiveMembers,
      topCategories,
      membersWithHighestFines,
      borrowingTrend,
      recommendations,
      keyMetrics: {
        returnRate: returnRate.toFixed(1) + '%',
        overdueRate: overdueRate.toFixed(1) + '%',
        avgBorrowingsPerMember: topMembers.length > 0
          ? (memberBorrowings.reduce((sum: number, m: any) => sum + m._count.id, 0) / memberBorrowings.length).toFixed(1)
          : '0',
      },
    });
  } catch (error) {
    console.error('Insights report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
