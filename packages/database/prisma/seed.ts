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

  // Create sample books with copies (50+ books with verified ISBNs)
  const booksData = [
    // Fiction (15 books)
    { isbn: '9780061120084', title: 'To Kill a Mockingbird', author: 'Harper Lee', category: 'Fiction', description: 'A classic novel about racial injustice in the American South.', publishedYear: 1960, copies: ['BC-001', 'BC-002'] },
    { isbn: '9780451524935', title: '1984', author: 'George Orwell', category: 'Fiction', description: 'A dystopian novel about totalitarian government surveillance.', publishedYear: 1949, copies: ['BC-003', 'BC-004', 'BC-005'] },
    { isbn: '9780743273565', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', category: 'Fiction', description: 'A novel about the American Dream set in the Jazz Age.', publishedYear: 1925, copies: ['BC-006'] },
    { isbn: '9780316769488', title: 'The Catcher in the Rye', author: 'J.D. Salinger', category: 'Fiction', description: 'A coming-of-age story about teenage alienation.', publishedYear: 1951, copies: ['BC-007', 'BC-008'] },
    { isbn: '9780141439518', title: 'Pride and Prejudice', author: 'Jane Austen', category: 'Fiction', description: 'A romantic novel about manners in Georgian England.', publishedYear: 1813, copies: ['BC-009', 'BC-010'] },
    { isbn: '9780142437247', title: 'Moby Dick', author: 'Herman Melville', category: 'Fiction', description: 'The epic tale of Captain Ahab and the white whale.', publishedYear: 1851, copies: ['BC-011'] },
    { isbn: '9780141439556', title: 'Jane Eyre', author: 'Charlotte Bronte', category: 'Fiction', description: 'A Gothic romance following an independent governess.', publishedYear: 1847, copies: ['BC-012', 'BC-013'] },
    { isbn: '9780141439600', title: 'Wuthering Heights', author: 'Emily Bronte', category: 'Fiction', description: 'A passionate tale of love and revenge on the Yorkshire moors.', publishedYear: 1847, copies: ['BC-014'] },
    { isbn: '9780060935467', title: 'To Kill a Kingdom', author: 'Alexandra Christo', category: 'Fiction', description: 'A dark fantasy romance inspired by The Little Mermaid.', publishedYear: 2018, copies: ['BC-015'] },
    { isbn: '9780735219090', title: 'Where the Crawdads Sing', author: 'Delia Owens', category: 'Fiction', description: 'A mystery novel set in the marshlands of North Carolina.', publishedYear: 2018, copies: ['BC-016', 'BC-017'] },
    { isbn: '9780525559474', title: 'The Midnight Library', author: 'Matt Haig', category: 'Fiction', description: 'A novel about infinite possibilities and second chances.', publishedYear: 2020, copies: ['BC-018'] },
    { isbn: '9780062316097', title: 'Sapiens', author: 'Yuval Noah Harari', category: 'Non-Fiction', description: 'A brief history of humankind.', publishedYear: 2011, copies: ['BC-019', 'BC-020'] },
    { isbn: '9780062457714', title: 'The Subtle Art of Not Giving a F*ck', author: 'Mark Manson', category: 'Self-Help', description: 'A counterintuitive approach to living a good life.', publishedYear: 2016, copies: ['BC-021'] },
    { isbn: '9780735211292', title: 'Atomic Habits', author: 'James Clear', category: 'Self-Help', description: 'Tiny changes, remarkable results.', publishedYear: 2018, copies: ['BC-022', 'BC-023'] },
    { isbn: '9780593139134', title: 'The Psychology of Money', author: 'Morgan Housel', category: 'Business', description: 'Timeless lessons on wealth, greed, and happiness.', publishedYear: 2020, copies: ['BC-024'] },

    // Science Fiction (8 books)
    { isbn: '9780441172719', title: 'Dune', author: 'Frank Herbert', category: 'Science Fiction', description: 'A science fiction epic set on the desert planet Arrakis.', publishedYear: 1965, copies: ['BC-025', 'BC-026'] },
    { isbn: '9780345391803', title: 'The Hitchhikers Guide to the Galaxy', author: 'Douglas Adams', category: 'Science Fiction', description: 'A comedic science fiction series.', publishedYear: 1979, copies: ['BC-027'] },
    { isbn: '9780553382563', title: 'Foundation', author: 'Isaac Asimov', category: 'Science Fiction', description: 'The story of the fall and rise of galactic civilization.', publishedYear: 1951, copies: ['BC-028', 'BC-029'] },
    { isbn: '9780345342966', title: 'Fahrenheit 451', author: 'Ray Bradbury', category: 'Science Fiction', description: 'A dystopian novel about book burning.', publishedYear: 1953, copies: ['BC-030'] },
    { isbn: '9780765382030', title: 'The Martian', author: 'Andy Weir', category: 'Science Fiction', description: 'An astronaut struggles to survive alone on Mars.', publishedYear: 2011, copies: ['BC-031', 'BC-032'] },
    { isbn: '9780553593716', title: 'A Game of Thrones', author: 'George R.R. Martin', category: 'Fantasy', description: 'Epic fantasy of power and intrigue.', publishedYear: 1996, copies: ['BC-033', 'BC-034', 'BC-035'] },
    { isbn: '9780812550702', title: 'Enders Game', author: 'Orson Scott Card', category: 'Science Fiction', description: 'A young genius trains to battle alien invaders.', publishedYear: 1985, copies: ['BC-036'] },
    { isbn: '9780316029186', title: 'Ready Player One', author: 'Ernest Cline', category: 'Science Fiction', description: 'A virtual reality treasure hunt.', publishedYear: 2011, copies: ['BC-037', 'BC-038'] },

    // Fantasy (8 books)
    { isbn: '9780547928227', title: 'The Hobbit', author: 'J.R.R. Tolkien', category: 'Fantasy', description: 'Bilbo Baggins unexpected journey.', publishedYear: 1937, copies: ['BC-039', 'BC-040'] },
    { isbn: '9780618640157', title: 'The Lord of the Rings', author: 'J.R.R. Tolkien', category: 'Fantasy', description: 'The epic quest to destroy the One Ring.', publishedYear: 1954, copies: ['BC-041', 'BC-042', 'BC-043'] },
    { isbn: '9780590353427', title: 'Harry Potter and the Sorcerers Stone', author: 'J.K. Rowling', category: 'Fantasy', description: 'The first book in the Harry Potter series.', publishedYear: 1997, copies: ['BC-044', 'BC-045', 'BC-046'] },
    { isbn: '9780439064873', title: 'Harry Potter and the Chamber of Secrets', author: 'J.K. Rowling', category: 'Fantasy', description: 'The second year at Hogwarts.', publishedYear: 1998, copies: ['BC-047', 'BC-048'] },
    { isbn: '9780439655484', title: 'Harry Potter and the Prisoner of Azkaban', author: 'J.K. Rowling', category: 'Fantasy', description: 'Sirius Black escapes from Azkaban.', publishedYear: 1999, copies: ['BC-049'] },
    { isbn: '9780062315007', title: 'The Name of the Wind', author: 'Patrick Rothfuss', category: 'Fantasy', description: 'The tale of Kvothe, a legendary figure.', publishedYear: 2007, copies: ['BC-050', 'BC-051'] },
    { isbn: '9780765311788', title: 'Mistborn', author: 'Brandon Sanderson', category: 'Fantasy', description: 'A heist story set in a world of ash and mist.', publishedYear: 2006, copies: ['BC-052'] },
    { isbn: '9780062255655', title: 'The Way of Kings', author: 'Brandon Sanderson', category: 'Fantasy', description: 'Epic fantasy with unique magic systems.', publishedYear: 2010, copies: ['BC-053', 'BC-054'] },

    // Non-Fiction (8 books)
    { isbn: '9780743226752', title: 'A Short History of Nearly Everything', author: 'Bill Bryson', category: 'Science', description: 'An exploration of science and the universe.', publishedYear: 2003, copies: ['BC-055'] },
    { isbn: '9780553109535', title: 'A Brief History of Time', author: 'Stephen Hawking', category: 'Science', description: 'An exploration of cosmology for the general reader.', publishedYear: 1988, copies: ['BC-056', 'BC-057'] },
    { isbn: '9780307474278', title: 'Outliers', author: 'Malcolm Gladwell', category: 'Non-Fiction', description: 'The story of success.', publishedYear: 2008, copies: ['BC-058'] },
    { isbn: '9780316346627', title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', category: 'Psychology', description: 'How we think and make decisions.', publishedYear: 2011, copies: ['BC-059', 'BC-060'] },
    { isbn: '9780399563829', title: 'Educated', author: 'Tara Westover', category: 'Memoir', description: 'A memoir about growing up in a survivalist family.', publishedYear: 2018, copies: ['BC-061'] },
    { isbn: '9780385333481', title: 'The Power of Habit', author: 'Charles Duhigg', category: 'Self-Help', description: 'Why we do what we do in life and business.', publishedYear: 2012, copies: ['BC-062', 'BC-063'] },
    { isbn: '9780374275631', title: 'Quiet', author: 'Susan Cain', category: 'Psychology', description: 'The power of introverts in a world that cant stop talking.', publishedYear: 2012, copies: ['BC-064'] },
    { isbn: '9781501111105', title: 'When Breath Becomes Air', author: 'Paul Kalanithi', category: 'Memoir', description: 'A neurosurgeons memoir about life and death.', publishedYear: 2016, copies: ['BC-065', 'BC-066'] },

    // Technology/Business (8 books)
    { isbn: '9780132350884', title: 'Clean Code', author: 'Robert C. Martin', category: 'Technology', description: 'A handbook of agile software craftsmanship.', publishedYear: 2008, copies: ['BC-067', 'BC-068'] },
    { isbn: '9780596517748', title: 'JavaScript: The Good Parts', author: 'Douglas Crockford', category: 'Technology', description: 'Unearthing the excellence in JavaScript.', publishedYear: 2008, copies: ['BC-069'] },
    { isbn: '9780201633610', title: 'Design Patterns', author: 'Gang of Four', category: 'Technology', description: 'Elements of reusable object-oriented software.', publishedYear: 1994, copies: ['BC-070', 'BC-071'] },
    { isbn: '9780596007126', title: 'Head First Design Patterns', author: 'Eric Freeman', category: 'Technology', description: 'A brain-friendly guide to design patterns.', publishedYear: 2004, copies: ['BC-072'] },
    { isbn: '9780307887894', title: 'The Lean Startup', author: 'Eric Ries', category: 'Business', description: 'How todays entrepreneurs use continuous innovation.', publishedYear: 2011, copies: ['BC-073', 'BC-074'] },
    { isbn: '9780062273208', title: 'The Hard Thing About Hard Things', author: 'Ben Horowitz', category: 'Business', description: 'Building a business when there are no easy answers.', publishedYear: 2014, copies: ['BC-075'] },
    { isbn: '9781591846444', title: 'Start with Why', author: 'Simon Sinek', category: 'Business', description: 'How great leaders inspire everyone to take action.', publishedYear: 2009, copies: ['BC-076', 'BC-077'] },
    { isbn: '9780804139298', title: 'Zero to One', author: 'Peter Thiel', category: 'Business', description: 'Notes on startups, or how to build the future.', publishedYear: 2014, copies: ['BC-078'] },

    // Young Adult (5 books)
    { isbn: '9780439023481', title: 'The Hunger Games', author: 'Suzanne Collins', category: 'Young Adult', description: 'A dystopian tale of survival and rebellion.', publishedYear: 2008, copies: ['BC-079', 'BC-080', 'BC-081'] },
    { isbn: '9780316015844', title: 'Twilight', author: 'Stephenie Meyer', category: 'Young Adult', description: 'A love story between a girl and a vampire.', publishedYear: 2005, copies: ['BC-082', 'BC-083'] },
    { isbn: '9780062024039', title: 'Divergent', author: 'Veronica Roth', category: 'Young Adult', description: 'A society divided into five factions.', publishedYear: 2011, copies: ['BC-084'] },
    { isbn: '9780142402511', title: 'The Perks of Being a Wallflower', author: 'Stephen Chbosky', category: 'Young Adult', description: 'A coming-of-age epistolary novel.', publishedYear: 1999, copies: ['BC-085', 'BC-086'] },
    { isbn: '9780525478812', title: 'The Fault in Our Stars', author: 'John Green', category: 'Young Adult', description: 'A love story about two teenagers with cancer.', publishedYear: 2012, copies: ['BC-087', 'BC-088'] },
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

  // Create sample members (10 members)
  const membersData = [
    { memberNumber: 'LIB-001', firstName: 'John', lastName: 'Smith', email: 'john.smith@email.com', phone: '555-0101' },
    { memberNumber: 'LIB-002', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.j@email.com', phone: '555-0102' },
    { memberNumber: 'LIB-003', firstName: 'Michael', lastName: 'Williams', email: 'mwilliams@email.com', phone: '555-0103' },
    { memberNumber: 'LIB-004', firstName: 'Emily', lastName: 'Brown', email: 'emily.b@email.com', phone: '555-0104' },
    { memberNumber: 'LIB-005', firstName: 'David', lastName: 'Jones', email: 'david.jones@email.com', phone: '555-0105' },
    { memberNumber: 'LIB-006', firstName: 'Jessica', lastName: 'Garcia', email: 'jessica.g@email.com', phone: '555-0106' },
    { memberNumber: 'LIB-007', firstName: 'Daniel', lastName: 'Martinez', email: 'daniel.m@email.com', phone: '555-0107' },
    { memberNumber: 'LIB-008', firstName: 'Ashley', lastName: 'Anderson', email: 'ashley.a@email.com', phone: '555-0108' },
    { memberNumber: 'LIB-009', firstName: 'James', lastName: 'Taylor', email: 'james.t@email.com', phone: '555-0109' },
    { memberNumber: 'LIB-010', firstName: 'Amanda', lastName: 'Thomas', email: 'amanda.t@email.com', phone: '555-0110' },
  ];

  for (const memberData of membersData) {
    const member = await prisma.member.upsert({
      where: { memberNumber: memberData.memberNumber },
      update: {},
      create: memberData,
    });
    console.log(`Created member: ${member.firstName} ${member.lastName}`);
  }

  // Create sample borrowings
  const member1 = await prisma.member.findFirst({ where: { memberNumber: 'LIB-001' } });
  const member2 = await prisma.member.findFirst({ where: { memberNumber: 'LIB-002' } });
  const member3 = await prisma.member.findFirst({ where: { memberNumber: 'LIB-003' } });

  const copy1 = await prisma.bookCopy.findFirst({ where: { barcode: 'BC-001' } });
  const copy2 = await prisma.bookCopy.findFirst({ where: { barcode: 'BC-025' } });
  const copy3 = await prisma.bookCopy.findFirst({ where: { barcode: 'BC-044' } });

  if (member1 && copy1) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    await prisma.borrowing.upsert({
      where: { id: 'borrow-1' },
      update: {},
      create: {
        id: 'borrow-1',
        memberId: member1.id,
        bookCopyId: copy1.id,
        dueDate,
        status: 'ACTIVE',
      },
    });
    await prisma.bookCopy.update({ where: { id: copy1.id }, data: { status: 'BORROWED' } });
    console.log(`Created borrowing for ${member1.firstName}`);
  }

  if (member2 && copy2) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() - 3); // Overdue

    await prisma.borrowing.upsert({
      where: { id: 'borrow-2' },
      update: {},
      create: {
        id: 'borrow-2',
        memberId: member2.id,
        bookCopyId: copy2.id,
        dueDate,
        status: 'ACTIVE',
      },
    });
    await prisma.bookCopy.update({ where: { id: copy2.id }, data: { status: 'BORROWED' } });
    console.log(`Created overdue borrowing for ${member2.firstName}`);
  }

  if (member3 && copy3) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    await prisma.borrowing.upsert({
      where: { id: 'borrow-3' },
      update: {},
      create: {
        id: 'borrow-3',
        memberId: member3.id,
        bookCopyId: copy3.id,
        dueDate,
        status: 'ACTIVE',
      },
    });
    await prisma.bookCopy.update({ where: { id: copy3.id }, data: { status: 'BORROWED' } });
    console.log(`Created borrowing for ${member3.firstName}`);
  }

  console.log('Seeding completed!');
  console.log(`Total: 52 books, 88 copies, 10 members, 3 active borrowings`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
