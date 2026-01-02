import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEMO_USER_ID = 'cmjx6134u000112krfaa2k8et';

const books = [
  // Classic Literature
  { title: 'Pride and Prejudice', author: 'Jane Austen', category: 'Classic Literature', year: 1813 },
  { title: 'Jane Eyre', author: 'Charlotte Brontë', category: 'Classic Literature', year: 1847 },
  { title: 'Wuthering Heights', author: 'Emily Brontë', category: 'Classic Literature', year: 1847 },
  { title: 'Great Expectations', author: 'Charles Dickens', category: 'Classic Literature', year: 1861 },
  { title: 'Oliver Twist', author: 'Charles Dickens', category: 'Classic Literature', year: 1838 },
  { title: 'A Tale of Two Cities', author: 'Charles Dickens', category: 'Classic Literature', year: 1859 },
  { title: 'Moby Dick', author: 'Herman Melville', category: 'Classic Literature', year: 1851 },
  { title: 'The Scarlet Letter', author: 'Nathaniel Hawthorne', category: 'Classic Literature', year: 1850 },
  { title: 'Anna Karenina', author: 'Leo Tolstoy', category: 'Classic Literature', year: 1877 },
  { title: 'War and Peace', author: 'Leo Tolstoy', category: 'Classic Literature', year: 1869 },
  { title: 'Crime and Punishment', author: 'Fyodor Dostoevsky', category: 'Classic Literature', year: 1866 },
  { title: 'The Brothers Karamazov', author: 'Fyodor Dostoevsky', category: 'Classic Literature', year: 1880 },
  { title: 'Les Misérables', author: 'Victor Hugo', category: 'Classic Literature', year: 1862 },
  { title: 'The Count of Monte Cristo', author: 'Alexandre Dumas', category: 'Classic Literature', year: 1844 },
  { title: 'Don Quixote', author: 'Miguel de Cervantes', category: 'Classic Literature', year: 1605 },

  // Modern Fiction
  { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', category: 'Modern Fiction', year: 1925 },
  { title: 'To Kill a Mockingbird', author: 'Harper Lee', category: 'Modern Fiction', year: 1960 },
  { title: 'The Catcher in the Rye', author: 'J.D. Salinger', category: 'Modern Fiction', year: 1951 },
  { title: 'Of Mice and Men', author: 'John Steinbeck', category: 'Modern Fiction', year: 1937 },
  { title: 'The Grapes of Wrath', author: 'John Steinbeck', category: 'Modern Fiction', year: 1939 },
  { title: 'East of Eden', author: 'John Steinbeck', category: 'Modern Fiction', year: 1952 },
  { title: 'One Flew Over the Cuckoo\'s Nest', author: 'Ken Kesey', category: 'Modern Fiction', year: 1962 },
  { title: 'Slaughterhouse-Five', author: 'Kurt Vonnegut', category: 'Modern Fiction', year: 1969 },
  { title: 'Catch-22', author: 'Joseph Heller', category: 'Modern Fiction', year: 1961 },
  { title: 'The Bell Jar', author: 'Sylvia Plath', category: 'Modern Fiction', year: 1963 },
  { title: 'Beloved', author: 'Toni Morrison', category: 'Modern Fiction', year: 1987 },
  { title: 'The Color Purple', author: 'Alice Walker', category: 'Modern Fiction', year: 1982 },
  { title: 'The Kite Runner', author: 'Khaled Hosseini', category: 'Modern Fiction', year: 2003 },
  { title: 'Life of Pi', author: 'Yann Martel', category: 'Modern Fiction', year: 2001 },
  { title: 'The Road', author: 'Cormac McCarthy', category: 'Modern Fiction', year: 2006 },

  // Science Fiction
  { title: '1984', author: 'George Orwell', category: 'Science Fiction', year: 1949 },
  { title: 'Brave New World', author: 'Aldous Huxley', category: 'Science Fiction', year: 1932 },
  { title: 'Fahrenheit 451', author: 'Ray Bradbury', category: 'Science Fiction', year: 1953 },
  { title: 'Dune', author: 'Frank Herbert', category: 'Science Fiction', year: 1965 },
  { title: 'Foundation', author: 'Isaac Asimov', category: 'Science Fiction', year: 1951 },
  { title: 'I, Robot', author: 'Isaac Asimov', category: 'Science Fiction', year: 1950 },
  { title: 'Neuromancer', author: 'William Gibson', category: 'Science Fiction', year: 1984 },
  { title: 'Snow Crash', author: 'Neal Stephenson', category: 'Science Fiction', year: 1992 },
  { title: 'Ender\'s Game', author: 'Orson Scott Card', category: 'Science Fiction', year: 1985 },
  { title: 'The Hitchhiker\'s Guide to the Galaxy', author: 'Douglas Adams', category: 'Science Fiction', year: 1979 },
  { title: 'The Martian', author: 'Andy Weir', category: 'Science Fiction', year: 2011 },
  { title: 'Ready Player One', author: 'Ernest Cline', category: 'Science Fiction', year: 2011 },
  { title: 'The Left Hand of Darkness', author: 'Ursula K. Le Guin', category: 'Science Fiction', year: 1969 },
  { title: 'Do Androids Dream of Electric Sheep?', author: 'Philip K. Dick', category: 'Science Fiction', year: 1968 },
  { title: 'The War of the Worlds', author: 'H.G. Wells', category: 'Science Fiction', year: 1898 },

  // Fantasy
  { title: 'The Hobbit', author: 'J.R.R. Tolkien', category: 'Fantasy', year: 1937 },
  { title: 'The Fellowship of the Ring', author: 'J.R.R. Tolkien', category: 'Fantasy', year: 1954 },
  { title: 'The Two Towers', author: 'J.R.R. Tolkien', category: 'Fantasy', year: 1954 },
  { title: 'The Return of the King', author: 'J.R.R. Tolkien', category: 'Fantasy', year: 1955 },
  { title: 'Harry Potter and the Sorcerer\'s Stone', author: 'J.K. Rowling', category: 'Fantasy', year: 1997 },
  { title: 'Harry Potter and the Chamber of Secrets', author: 'J.K. Rowling', category: 'Fantasy', year: 1998 },
  { title: 'Harry Potter and the Prisoner of Azkaban', author: 'J.K. Rowling', category: 'Fantasy', year: 1999 },
  { title: 'A Game of Thrones', author: 'George R.R. Martin', category: 'Fantasy', year: 1996 },
  { title: 'The Name of the Wind', author: 'Patrick Rothfuss', category: 'Fantasy', year: 2007 },
  { title: 'The Way of Kings', author: 'Brandon Sanderson', category: 'Fantasy', year: 2010 },
  { title: 'Mistborn: The Final Empire', author: 'Brandon Sanderson', category: 'Fantasy', year: 2006 },
  { title: 'American Gods', author: 'Neil Gaiman', category: 'Fantasy', year: 2001 },
  { title: 'Good Omens', author: 'Terry Pratchett & Neil Gaiman', category: 'Fantasy', year: 1990 },
  { title: 'The Princess Bride', author: 'William Goldman', category: 'Fantasy', year: 1973 },
  { title: 'The Chronicles of Narnia', author: 'C.S. Lewis', category: 'Fantasy', year: 1950 },

  // Mystery & Thriller
  { title: 'The Girl with the Dragon Tattoo', author: 'Stieg Larsson', category: 'Mystery', year: 2005 },
  { title: 'Gone Girl', author: 'Gillian Flynn', category: 'Mystery', year: 2012 },
  { title: 'The Da Vinci Code', author: 'Dan Brown', category: 'Mystery', year: 2003 },
  { title: 'And Then There Were None', author: 'Agatha Christie', category: 'Mystery', year: 1939 },
  { title: 'Murder on the Orient Express', author: 'Agatha Christie', category: 'Mystery', year: 1934 },
  { title: 'The Hound of the Baskervilles', author: 'Arthur Conan Doyle', category: 'Mystery', year: 1902 },
  { title: 'In Cold Blood', author: 'Truman Capote', category: 'Mystery', year: 1966 },
  { title: 'The Silence of the Lambs', author: 'Thomas Harris', category: 'Mystery', year: 1988 },
  { title: 'Big Little Lies', author: 'Liane Moriarty', category: 'Mystery', year: 2014 },
  { title: 'The Girl on the Train', author: 'Paula Hawkins', category: 'Mystery', year: 2015 },

  // Non-Fiction
  { title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', category: 'Non-Fiction', year: 2011 },
  { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', category: 'Non-Fiction', year: 2011 },
  { title: 'The Power of Habit', author: 'Charles Duhigg', category: 'Non-Fiction', year: 2012 },
  { title: 'Atomic Habits', author: 'James Clear', category: 'Non-Fiction', year: 2018 },
  { title: 'Educated', author: 'Tara Westover', category: 'Non-Fiction', year: 2018 },
  { title: 'Becoming', author: 'Michelle Obama', category: 'Non-Fiction', year: 2018 },
  { title: 'A Brief History of Time', author: 'Stephen Hawking', category: 'Non-Fiction', year: 1988 },
  { title: 'The Immortal Life of Henrietta Lacks', author: 'Rebecca Skloot', category: 'Non-Fiction', year: 2010 },
  { title: 'Outliers', author: 'Malcolm Gladwell', category: 'Non-Fiction', year: 2008 },
  { title: 'Freakonomics', author: 'Steven Levitt & Stephen Dubner', category: 'Non-Fiction', year: 2005 },

  // Biography
  { title: 'Steve Jobs', author: 'Walter Isaacson', category: 'Biography', year: 2011 },
  { title: 'Einstein: His Life and Universe', author: 'Walter Isaacson', category: 'Biography', year: 2007 },
  { title: 'The Diary of a Young Girl', author: 'Anne Frank', category: 'Biography', year: 1947 },
  { title: 'Long Walk to Freedom', author: 'Nelson Mandela', category: 'Biography', year: 1994 },
  { title: 'I Know Why the Caged Bird Sings', author: 'Maya Angelou', category: 'Biography', year: 1969 },

  // Horror
  { title: 'It', author: 'Stephen King', category: 'Horror', year: 1986 },
  { title: 'The Shining', author: 'Stephen King', category: 'Horror', year: 1977 },
  { title: 'Pet Sematary', author: 'Stephen King', category: 'Horror', year: 1983 },
  { title: 'Dracula', author: 'Bram Stoker', category: 'Horror', year: 1897 },
  { title: 'Frankenstein', author: 'Mary Shelley', category: 'Horror', year: 1818 },
  { title: 'The Exorcist', author: 'William Peter Blatty', category: 'Horror', year: 1971 },
  { title: 'House of Leaves', author: 'Mark Z. Danielewski', category: 'Horror', year: 2000 },
  { title: 'Mexican Gothic', author: 'Silvia Moreno-Garcia', category: 'Horror', year: 2020 },

  // Romance
  { title: 'Outlander', author: 'Diana Gabaldon', category: 'Romance', year: 1991 },
  { title: 'The Notebook', author: 'Nicholas Sparks', category: 'Romance', year: 1996 },
  { title: 'Me Before You', author: 'Jojo Moyes', category: 'Romance', year: 2012 },
  { title: 'Beach Read', author: 'Emily Henry', category: 'Romance', year: 2020 },
  { title: 'The Hating Game', author: 'Sally Thorne', category: 'Romance', year: 2016 },

  // Young Adult
  { title: 'The Hunger Games', author: 'Suzanne Collins', category: 'Young Adult', year: 2008 },
  { title: 'Divergent', author: 'Veronica Roth', category: 'Young Adult', year: 2011 },
  { title: 'The Maze Runner', author: 'James Dashner', category: 'Young Adult', year: 2009 },
  { title: 'The Fault in Our Stars', author: 'John Green', category: 'Young Adult', year: 2012 },
  { title: 'Twilight', author: 'Stephenie Meyer', category: 'Young Adult', year: 2005 },
  { title: 'Percy Jackson: The Lightning Thief', author: 'Rick Riordan', category: 'Young Adult', year: 2005 },
  { title: 'The Giver', author: 'Lois Lowry', category: 'Young Adult', year: 1993 },
];

const members = [
  { firstName: 'Emma', lastName: 'Thompson', email: 'emma.t@email.com', phone: '555-1001' },
  { firstName: 'James', lastName: 'Wilson', email: 'james.w@email.com', phone: '555-1002' },
  { firstName: 'Olivia', lastName: 'Martinez', email: 'olivia.m@email.com', phone: '555-1003' },
  { firstName: 'William', lastName: 'Anderson', email: 'william.a@email.com', phone: '555-1004' },
  { firstName: 'Sophia', lastName: 'Taylor', email: 'sophia.t@email.com', phone: '555-1005' },
  { firstName: 'Benjamin', lastName: 'Thomas', email: 'ben.t@email.com', phone: '555-1006' },
  { firstName: 'Isabella', lastName: 'Jackson', email: 'isabella.j@email.com', phone: '555-1007' },
  { firstName: 'Lucas', lastName: 'White', email: 'lucas.w@email.com', phone: '555-1008' },
  { firstName: 'Mia', lastName: 'Harris', email: 'mia.h@email.com', phone: '555-1009' },
  { firstName: 'Henry', lastName: 'Clark', email: 'henry.c@email.com', phone: '555-1010' },
  { firstName: 'Charlotte', lastName: 'Lewis', email: 'charlotte.l@email.com', phone: '555-1011' },
  { firstName: 'Alexander', lastName: 'Robinson', email: 'alex.r@email.com', phone: '555-1012' },
  { firstName: 'Amelia', lastName: 'Walker', email: 'amelia.w@email.com', phone: '555-1013' },
  { firstName: 'Daniel', lastName: 'Young', email: 'daniel.y@email.com', phone: '555-1014' },
  { firstName: 'Harper', lastName: 'King', email: 'harper.k@email.com', phone: '555-1015' },
];

async function main() {
  console.log('Deleting existing demo user data...');

  // Delete in correct order due to foreign keys
  await prisma.fine.deleteMany({
    where: { borrowing: { member: { userId: DEMO_USER_ID } } }
  });
  await prisma.borrowing.deleteMany({
    where: { member: { userId: DEMO_USER_ID } }
  });
  await prisma.bookCopy.deleteMany({
    where: { book: { userId: DEMO_USER_ID } }
  });
  await prisma.book.deleteMany({
    where: { userId: DEMO_USER_ID }
  });
  await prisma.member.deleteMany({
    where: { userId: DEMO_USER_ID }
  });

  console.log('Creating books...');
  const createdBooks: any[] = [];
  for (let i = 0; i < books.length; i++) {
    const b = books[i];
    const isbn = `978-${String(i).padStart(3, '0')}-${Math.floor(Math.random() * 90000) + 10000}`;
    const book = await prisma.book.create({
      data: {
        title: b.title,
        author: b.author,
        category: b.category,
        publishedYear: b.year,
        isbn,
        userId: DEMO_USER_ID,
        copies: {
          create: [
            { barcode: `${isbn}-DEMO-001`, condition: 'GOOD', shelfLocation: `${String.fromCharCode(65 + (i % 10))}${Math.floor(i / 10) + 1}`, status: 'AVAILABLE' },
            { barcode: `${isbn}-DEMO-002`, condition: 'GOOD', shelfLocation: `${String.fromCharCode(65 + (i % 10))}${Math.floor(i / 10) + 1}`, status: 'AVAILABLE' },
          ],
        },
      },
      include: { copies: true },
    });
    createdBooks.push(book);
  }
  console.log(`Created ${createdBooks.length} books with ${createdBooks.length * 2} copies`);

  console.log('Creating members...');
  const createdMembers: any[] = [];
  for (let i = 0; i < members.length; i++) {
    const m = members[i];
    const member = await prisma.member.create({
      data: {
        firstName: m.firstName,
        lastName: m.lastName,
        email: m.email,
        phone: m.phone,
        memberNumber: `MEM-${String(i + 1).padStart(4, '0')}`,
        status: 'ACTIVE',
        userId: DEMO_USER_ID,
      },
    });
    createdMembers.push(member);
  }
  console.log(`Created ${createdMembers.length} members`);

  console.log('Creating borrowings...');
  const now = new Date();

  // Active borrowings (some overdue)
  const activeBorrowings = [
    { memberIdx: 0, bookIdx: 0, daysAgo: 5, dueDays: 9 },
    { memberIdx: 1, bookIdx: 5, daysAgo: 20, dueDays: -6 }, // overdue
    { memberIdx: 2, bookIdx: 10, daysAgo: 3, dueDays: 11 },
    { memberIdx: 3, bookIdx: 15, daysAgo: 25, dueDays: -11 }, // overdue
    { memberIdx: 4, bookIdx: 20, daysAgo: 7, dueDays: 7 },
    { memberIdx: 5, bookIdx: 25, daysAgo: 2, dueDays: 12 },
    { memberIdx: 6, bookIdx: 30, daysAgo: 15, dueDays: -1 }, // overdue
    { memberIdx: 7, bookIdx: 35, daysAgo: 4, dueDays: 10 },
    { memberIdx: 8, bookIdx: 40, daysAgo: 6, dueDays: 8 },
    { memberIdx: 9, bookIdx: 45, daysAgo: 1, dueDays: 13 },
  ];

  for (const b of activeBorrowings) {
    const borrowDate = new Date(now);
    borrowDate.setDate(borrowDate.getDate() - b.daysAgo);
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + b.dueDays);

    const copy = createdBooks[b.bookIdx].copies[0];
    await prisma.borrowing.create({
      data: {
        memberId: createdMembers[b.memberIdx].id,
        bookCopyId: copy.id,
        borrowDate,
        dueDate,
        status: 'ACTIVE',
      },
    });
    await prisma.bookCopy.update({
      where: { id: copy.id },
      data: { status: 'BORROWED' },
    });
  }

  // Returned borrowings (history)
  const returnedBorrowings = [
    { memberIdx: 0, bookIdx: 50, daysAgo: 30, returnedDaysAgo: 20 },
    { memberIdx: 1, bookIdx: 55, daysAgo: 45, returnedDaysAgo: 32 },
    { memberIdx: 2, bookIdx: 60, daysAgo: 60, returnedDaysAgo: 50 },
    { memberIdx: 3, bookIdx: 65, daysAgo: 25, returnedDaysAgo: 15 },
    { memberIdx: 4, bookIdx: 70, daysAgo: 40, returnedDaysAgo: 28 },
    { memberIdx: 10, bookIdx: 75, daysAgo: 35, returnedDaysAgo: 22 },
    { memberIdx: 11, bookIdx: 80, daysAgo: 50, returnedDaysAgo: 40 },
    { memberIdx: 12, bookIdx: 85, daysAgo: 20, returnedDaysAgo: 10 },
  ];

  for (const b of returnedBorrowings) {
    const borrowDate = new Date(now);
    borrowDate.setDate(borrowDate.getDate() - b.daysAgo);
    const dueDate = new Date(borrowDate);
    dueDate.setDate(dueDate.getDate() + 14);
    const returnDate = new Date(now);
    returnDate.setDate(returnDate.getDate() - b.returnedDaysAgo);

    const copy = createdBooks[b.bookIdx].copies[1];
    await prisma.borrowing.create({
      data: {
        memberId: createdMembers[b.memberIdx].id,
        bookCopyId: copy.id,
        borrowDate,
        dueDate,
        returnDate,
        status: 'RETURNED',
      },
    });
  }

  console.log('Created 10 active borrowings (3 overdue) and 8 returned borrowings');
  console.log('Demo data seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
