import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@library.com' },
    update: {},
    create: {
      email: 'admin@library.com',
      passwordHash: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });
  console.log('Created admin user:', admin.email);

  // Create sample books with copies
  const booksData = [
    {
      isbn: '978-0-06-112008-4',
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      category: 'Fiction',
      description: 'A classic novel about racial injustice in the American South.',
      publishedYear: 1960,
      copies: ['BC-001', 'BC-002'],
    },
    {
      isbn: '978-0-452-28423-4',
      title: '1984',
      author: 'George Orwell',
      category: 'Fiction',
      description: 'A dystopian novel about totalitarian government surveillance.',
      publishedYear: 1949,
      copies: ['BC-003', 'BC-004', 'BC-005'],
    },
    {
      isbn: '978-0-7432-7356-5',
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      category: 'Fiction',
      description: 'A novel about the American Dream set in the Jazz Age.',
      publishedYear: 1925,
      copies: ['BC-006'],
    },
    {
      isbn: '978-0-316-76948-0',
      title: 'The Catcher in the Rye',
      author: 'J.D. Salinger',
      category: 'Fiction',
      description: 'A coming-of-age story about teenage alienation.',
      publishedYear: 1951,
      copies: ['BC-007', 'BC-008'],
    },
    {
      isbn: '978-0-14-028329-7',
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      category: 'Romance',
      description: 'A romantic novel about manners in Georgian England.',
      publishedYear: 1813,
      copies: ['BC-009', 'BC-010'],
    },
    {
      isbn: '978-0-06-093546-7',
      title: 'To Kill a Kingdom',
      author: 'Alexandra Christo',
      category: 'Fantasy',
      description: 'A dark fantasy romance inspired by The Little Mermaid.',
      publishedYear: 2018,
      copies: ['BC-011'],
    },
    {
      isbn: '978-0-545-01022-1',
      title: "Harry Potter and the Sorcerer's Stone",
      author: 'J.K. Rowling',
      category: 'Fantasy',
      description: 'The first book in the Harry Potter series.',
      publishedYear: 1997,
      copies: ['BC-012', 'BC-013', 'BC-014'],
    },
    {
      isbn: '978-0-7432-7357-2',
      title: 'A Brief History of Time',
      author: 'Stephen Hawking',
      category: 'Science',
      description: 'An exploration of cosmology for the general reader.',
      publishedYear: 1988,
      copies: ['BC-015'],
    },
    {
      isbn: '978-0-13-468599-1',
      title: 'Clean Code',
      author: 'Robert C. Martin',
      category: 'Technology',
      description: 'A handbook of agile software craftsmanship.',
      publishedYear: 2008,
      copies: ['BC-016', 'BC-017'],
    },
    {
      isbn: '978-0-596-51774-8',
      title: 'JavaScript: The Good Parts',
      author: 'Douglas Crockford',
      category: 'Technology',
      description: 'Unearthing the excellence in JavaScript.',
      publishedYear: 2008,
      copies: ['BC-018'],
    },
  ];

  for (const bookData of booksData) {
    const { copies, ...book } = bookData;
    const createdBook = await prisma.book.upsert({
      where: { isbn: book.isbn! },
      update: {},
      create: book,
    });

    for (const barcode of copies) {
      await prisma.bookCopy.upsert({
        where: { barcode },
        update: {},
        create: {
          bookId: createdBook.id,
          barcode,
          status: 'AVAILABLE',
          condition: 'GOOD',
          shelfLocation: `${book.category.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 10) + 1}`,
        },
      });
    }
    console.log(`Created book: ${createdBook.title} with ${copies.length} copies`);
  }

  // Create sample members
  const membersData = [
    { memberNumber: 'LIB-001', firstName: 'John', lastName: 'Smith', email: 'john.smith@email.com', phone: '555-0101' },
    { memberNumber: 'LIB-002', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.j@email.com', phone: '555-0102' },
    { memberNumber: 'LIB-003', firstName: 'Michael', lastName: 'Williams', email: 'mwilliams@email.com', phone: '555-0103' },
    { memberNumber: 'LIB-004', firstName: 'Emily', lastName: 'Brown', email: 'emily.b@email.com', phone: '555-0104' },
    { memberNumber: 'LIB-005', firstName: 'David', lastName: 'Jones', email: 'david.jones@email.com', phone: '555-0105' },
  ];

  for (const memberData of membersData) {
    const member = await prisma.member.upsert({
      where: { memberNumber: memberData.memberNumber },
      update: {},
      create: memberData,
    });
    console.log(`Created member: ${member.firstName} ${member.lastName}`);
  }

  // Create a sample borrowing
  const member = await prisma.member.findFirst();
  const bookCopy = await prisma.bookCopy.findFirst();

  if (member && bookCopy) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    await prisma.borrowing.create({
      data: {
        memberId: member.id,
        bookCopyId: bookCopy.id,
        dueDate,
        status: 'ACTIVE',
      },
    });

    await prisma.bookCopy.update({
      where: { id: bookCopy.id },
      data: { status: 'BORROWED' },
    });

    console.log(`Created sample borrowing for ${member.firstName}`);
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
