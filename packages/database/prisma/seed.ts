import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to generate random date in past N days
function randomPastDate(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date;
}

// Helper to generate future date
function futureDate(daysAhead: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date;
}

// Helper to generate past date
function pastDate(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
}

async function main() {
  console.log('Seeding database with expanded data for areeha.usman...');

  // Find the target user
  const targetUser = await prisma.user.findUnique({
    where: { email: 'areeha.usman@student.wsb.edu.pl' },
  });

  if (!targetUser) {
    console.error('User areeha.usman@student.wsb.edu.pl not found!');
    process.exit(1);
  }

  const userId = targetUser.id;
  console.log(`Found user: ${targetUser.email} (ID: ${userId})`);

  // Clear existing data for THIS USER ONLY
  await prisma.fine.deleteMany({ where: { borrowing: { member: { userId } } } });
  await prisma.borrowing.deleteMany({ where: { member: { userId } } });
  await prisma.bookCopy.deleteMany({ where: { book: { userId } } });
  await prisma.book.deleteMany({ where: { userId } });
  await prisma.member.deleteMany({ where: { userId } });
  console.log('Cleared existing data for this user');

  // Ensure user is ADMIN
  await prisma.user.update({
    where: { id: userId },
    data: { role: 'ADMIN' },
  });
  console.log('Confirmed ADMIN role');

  // Extended book data - 300+ books
  const categories = ['Fiction', 'Science Fiction', 'Fantasy', 'Mystery', 'Romance', 'Thriller', 'Horror', 'Non-Fiction', 'Biography', 'History', 'Science', 'Technology', 'Business', 'Self-Help', 'Psychology', 'Philosophy', 'Poetry', 'Drama', 'Children', 'Young Adult'];

  const authors = [
    'Stephen King', 'J.K. Rowling', 'George R.R. Martin', 'Brandon Sanderson', 'Neil Gaiman',
    'Agatha Christie', 'Dan Brown', 'James Patterson', 'John Grisham', 'Lee Child',
    'Nora Roberts', 'Nicholas Sparks', 'Danielle Steel', 'Colleen Hoover', 'Sarah J. Maas',
    'Isaac Asimov', 'Arthur C. Clarke', 'Philip K. Dick', 'Ursula K. Le Guin', 'Ray Bradbury',
    'Ernest Hemingway', 'F. Scott Fitzgerald', 'Jane Austen', 'Charles Dickens', 'Mark Twain',
    'Gabriel Garcia Marquez', 'Haruki Murakami', 'Paulo Coelho', 'Khaled Hosseini', 'Chimamanda Ngozi Adichie',
    'Malcolm Gladwell', 'Yuval Noah Harari', 'Bill Gates', 'Walter Isaacson', 'David Attenborough',
    'Michelle Obama', 'Barack Obama', 'Brene Brown', 'Jordan Peterson', 'Simon Sinek'
  ];

  const bookTitles: { title: string; category: string; author: string; isbn?: string }[] = [];

  // All 320 books with real ISBNs for Open Library covers
  const popularBooks = [
    // Fiction (50 books)
    { title: 'To Kill a Mockingbird', category: 'Fiction', author: 'Harper Lee', isbn: '9780061120084' },
    { title: '1984', category: 'Fiction', author: 'George Orwell', isbn: '9780451524935' },
    { title: 'The Great Gatsby', category: 'Fiction', author: 'F. Scott Fitzgerald', isbn: '9780743273565' },
    { title: 'Pride and Prejudice', category: 'Fiction', author: 'Jane Austen', isbn: '9780141439518' },
    { title: 'The Catcher in the Rye', category: 'Fiction', author: 'J.D. Salinger', isbn: '9780316769488' },
    { title: 'The Alchemist', category: 'Fiction', author: 'Paulo Coelho', isbn: '9780062315007' },
    { title: 'One Hundred Years of Solitude', category: 'Fiction', author: 'Gabriel Garcia Marquez', isbn: '9780060883287' },
    { title: 'Norwegian Wood', category: 'Fiction', author: 'Haruki Murakami', isbn: '9780375704024' },
    { title: 'Kafka on the Shore', category: 'Fiction', author: 'Haruki Murakami', isbn: '9781400079278' },
    { title: 'The Kite Runner', category: 'Fiction', author: 'Khaled Hosseini', isbn: '9781594631931' },
    { title: 'Brave New World', category: 'Fiction', author: 'Aldous Huxley', isbn: '9780060850524' },
    { title: 'Animal Farm', category: 'Fiction', author: 'George Orwell', isbn: '9780451526342' },
    { title: 'Lord of the Flies', category: 'Fiction', author: 'William Golding', isbn: '9780399501487' },
    { title: 'The Grapes of Wrath', category: 'Fiction', author: 'John Steinbeck', isbn: '9780143039433' },
    { title: 'Of Mice and Men', category: 'Fiction', author: 'John Steinbeck', isbn: '9780140177398' },
    { title: 'East of Eden', category: 'Fiction', author: 'John Steinbeck', isbn: '9780140186390' },
    { title: 'Wuthering Heights', category: 'Fiction', author: 'Emily Bronte', isbn: '9780141439556' },
    { title: 'Jane Eyre', category: 'Fiction', author: 'Charlotte Bronte', isbn: '9780141441146' },
    { title: 'Great Expectations', category: 'Fiction', author: 'Charles Dickens', isbn: '9780141439563' },
    { title: 'A Tale of Two Cities', category: 'Fiction', author: 'Charles Dickens', isbn: '9780141439600' },
    { title: 'Oliver Twist', category: 'Fiction', author: 'Charles Dickens', isbn: '9780141439747' },
    { title: 'David Copperfield', category: 'Fiction', author: 'Charles Dickens', isbn: '9780140439441' },
    { title: 'The Picture of Dorian Gray', category: 'Fiction', author: 'Oscar Wilde', isbn: '9780141439570' },
    { title: 'Frankenstein', category: 'Fiction', author: 'Mary Shelley', isbn: '9780141439471' },
    { title: 'Dracula', category: 'Fiction', author: 'Bram Stoker', isbn: '9780141439846' },
    { title: 'Crime and Punishment', category: 'Fiction', author: 'Fyodor Dostoevsky', isbn: '9780143058144' },
    { title: 'The Brothers Karamazov', category: 'Fiction', author: 'Fyodor Dostoevsky', isbn: '9780374528379' },
    { title: 'War and Peace', category: 'Fiction', author: 'Leo Tolstoy', isbn: '9781400079988' },
    { title: 'Anna Karenina', category: 'Fiction', author: 'Leo Tolstoy', isbn: '9780143035008' },
    { title: 'The Old Man and the Sea', category: 'Fiction', author: 'Ernest Hemingway', isbn: '9780684801223' },
    { title: 'A Farewell to Arms', category: 'Fiction', author: 'Ernest Hemingway', isbn: '9780684801469' },
    { title: 'For Whom the Bell Tolls', category: 'Fiction', author: 'Ernest Hemingway', isbn: '9780684803357' },
    { title: 'The Sun Also Rises', category: 'Fiction', author: 'Ernest Hemingway', isbn: '9780743297332' },
    { title: 'Moby Dick', category: 'Fiction', author: 'Herman Melville', isbn: '9780142437247' },
    { title: 'The Scarlet Letter', category: 'Fiction', author: 'Nathaniel Hawthorne', isbn: '9780142437261' },
    { title: 'The Adventures of Tom Sawyer', category: 'Fiction', author: 'Mark Twain', isbn: '9780143039563' },
    { title: 'Adventures of Huckleberry Finn', category: 'Fiction', author: 'Mark Twain', isbn: '9780143107323' },
    { title: 'The Count of Monte Cristo', category: 'Fiction', author: 'Alexandre Dumas', isbn: '9780140449266' },
    { title: 'Les Miserables', category: 'Fiction', author: 'Victor Hugo', isbn: '9780451419439' },
    { title: 'The Stranger', category: 'Fiction', author: 'Albert Camus', isbn: '9780679720201' },
    { title: 'The Metamorphosis', category: 'Fiction', author: 'Franz Kafka', isbn: '9780553213690' },
    { title: 'The Trial', category: 'Fiction', author: 'Franz Kafka', isbn: '9780805209990' },
    { title: 'Slaughterhouse-Five', category: 'Fiction', author: 'Kurt Vonnegut', isbn: '9780385333849' },
    { title: 'Catch-22', category: 'Fiction', author: 'Joseph Heller', isbn: '9781451626650' },
    { title: 'On the Road', category: 'Fiction', author: 'Jack Kerouac', isbn: '9780140283297' },
    { title: 'The Bell Jar', category: 'Fiction', author: 'Sylvia Plath', isbn: '9780060837020' },
    { title: 'Beloved', category: 'Fiction', author: 'Toni Morrison', isbn: '9781400033416' },
    { title: 'The Color Purple', category: 'Fiction', author: 'Alice Walker', isbn: '9780156028356' },
    { title: 'Their Eyes Were Watching God', category: 'Fiction', author: 'Zora Neale Hurston', isbn: '9780061120060' },
    { title: 'A Thousand Splendid Suns', category: 'Fiction', author: 'Khaled Hosseini', isbn: '9781594483851' },

    // Fantasy (40 books)
    { title: 'Harry Potter and the Sorcerers Stone', category: 'Fantasy', author: 'J.K. Rowling', isbn: '9780590353427' },
    { title: 'Harry Potter and the Chamber of Secrets', category: 'Fantasy', author: 'J.K. Rowling', isbn: '9780439064873' },
    { title: 'Harry Potter and the Prisoner of Azkaban', category: 'Fantasy', author: 'J.K. Rowling', isbn: '9780439136365' },
    { title: 'Harry Potter and the Goblet of Fire', category: 'Fantasy', author: 'J.K. Rowling', isbn: '9780439139601' },
    { title: 'Harry Potter and the Order of the Phoenix', category: 'Fantasy', author: 'J.K. Rowling', isbn: '9780439358071' },
    { title: 'Harry Potter and the Half-Blood Prince', category: 'Fantasy', author: 'J.K. Rowling', isbn: '9780439784542' },
    { title: 'Harry Potter and the Deathly Hallows', category: 'Fantasy', author: 'J.K. Rowling', isbn: '9780545010221' },
    { title: 'The Lord of the Rings: The Fellowship', category: 'Fantasy', author: 'J.R.R. Tolkien', isbn: '9780547928210' },
    { title: 'The Lord of the Rings: The Two Towers', category: 'Fantasy', author: 'J.R.R. Tolkien', isbn: '9780547928203' },
    { title: 'The Lord of the Rings: Return of the King', category: 'Fantasy', author: 'J.R.R. Tolkien', isbn: '9780547928197' },
    { title: 'The Hobbit', category: 'Fantasy', author: 'J.R.R. Tolkien', isbn: '9780547928227' },
    { title: 'The Silmarillion', category: 'Fantasy', author: 'J.R.R. Tolkien', isbn: '9780618391110' },
    { title: 'A Game of Thrones', category: 'Fantasy', author: 'George R.R. Martin', isbn: '9780553593716' },
    { title: 'A Clash of Kings', category: 'Fantasy', author: 'George R.R. Martin', isbn: '9780553579901' },
    { title: 'A Storm of Swords', category: 'Fantasy', author: 'George R.R. Martin', isbn: '9780553573428' },
    { title: 'A Feast for Crows', category: 'Fantasy', author: 'George R.R. Martin', isbn: '9780553582024' },
    { title: 'A Dance with Dragons', category: 'Fantasy', author: 'George R.R. Martin', isbn: '9780553582017' },
    { title: 'The Name of the Wind', category: 'Fantasy', author: 'Patrick Rothfuss', isbn: '9780756404741' },
    { title: 'The Wise Mans Fear', category: 'Fantasy', author: 'Patrick Rothfuss', isbn: '9780756407919' },
    { title: 'The Way of Kings', category: 'Fantasy', author: 'Brandon Sanderson', isbn: '9780765365279' },
    { title: 'Words of Radiance', category: 'Fantasy', author: 'Brandon Sanderson', isbn: '9780765365286' },
    { title: 'Mistborn: The Final Empire', category: 'Fantasy', author: 'Brandon Sanderson', isbn: '9780765350381' },
    { title: 'The Well of Ascension', category: 'Fantasy', author: 'Brandon Sanderson', isbn: '9780765356130' },
    { title: 'The Hero of Ages', category: 'Fantasy', author: 'Brandon Sanderson', isbn: '9780765356147' },
    { title: 'American Gods', category: 'Fantasy', author: 'Neil Gaiman', isbn: '9780063081918' },
    { title: 'Good Omens', category: 'Fantasy', author: 'Neil Gaiman', isbn: '9780060853983' },
    { title: 'Neverwhere', category: 'Fantasy', author: 'Neil Gaiman', isbn: '9780060557812' },
    { title: 'Stardust', category: 'Fantasy', author: 'Neil Gaiman', isbn: '9780061689246' },
    { title: 'The Ocean at the End of the Lane', category: 'Fantasy', author: 'Neil Gaiman', isbn: '9780062255655' },
    { title: 'The Chronicles of Narnia', category: 'Fantasy', author: 'C.S. Lewis', isbn: '9780066238500' },
    { title: 'The Lion, the Witch and the Wardrobe', category: 'Fantasy', author: 'C.S. Lewis', isbn: '9780064404990' },
    { title: 'A Wizard of Earthsea', category: 'Fantasy', author: 'Ursula K. Le Guin', isbn: '9780547773742' },
    { title: 'The Tombs of Atuan', category: 'Fantasy', author: 'Ursula K. Le Guin', isbn: '9781442459908' },
    { title: 'The Farthest Shore', category: 'Fantasy', author: 'Ursula K. Le Guin', isbn: '9781442459915' },
    { title: 'Eragon', category: 'Fantasy', author: 'Christopher Paolini', isbn: '9780375826696' },
    { title: 'Eldest', category: 'Fantasy', author: 'Christopher Paolini', isbn: '9780375840401' },
    { title: 'The Princess Bride', category: 'Fantasy', author: 'William Goldman', isbn: '9780156035217' },
    { title: 'The Night Circus', category: 'Fantasy', author: 'Erin Morgenstern', isbn: '9780307744432' },
    { title: 'Circe', category: 'Fantasy', author: 'Madeline Miller', isbn: '9780316556347' },
    { title: 'The Song of Achilles', category: 'Fantasy', author: 'Madeline Miller', isbn: '9780062060624' },

    // Science Fiction (35 books)
    { title: 'Dune', category: 'Science Fiction', author: 'Frank Herbert', isbn: '9780441172719' },
    { title: 'Dune Messiah', category: 'Science Fiction', author: 'Frank Herbert', isbn: '9780593098233' },
    { title: 'Children of Dune', category: 'Science Fiction', author: 'Frank Herbert', isbn: '9780593098240' },
    { title: 'Foundation', category: 'Science Fiction', author: 'Isaac Asimov', isbn: '9780553293357' },
    { title: 'Foundation and Empire', category: 'Science Fiction', author: 'Isaac Asimov', isbn: '9780553293371' },
    { title: 'Second Foundation', category: 'Science Fiction', author: 'Isaac Asimov', isbn: '9780553293364' },
    { title: 'I, Robot', category: 'Science Fiction', author: 'Isaac Asimov', isbn: '9780553382563' },
    { title: 'The Martian', category: 'Science Fiction', author: 'Andy Weir', isbn: '9780553418026' },
    { title: 'Project Hail Mary', category: 'Science Fiction', author: 'Andy Weir', isbn: '9780593135204' },
    { title: 'Artemis', category: 'Science Fiction', author: 'Andy Weir', isbn: '9780553448146' },
    { title: 'Ready Player One', category: 'Science Fiction', author: 'Ernest Cline', isbn: '9780307887443' },
    { title: 'Ready Player Two', category: 'Science Fiction', author: 'Ernest Cline', isbn: '9781524761332' },
    { title: 'Enders Game', category: 'Science Fiction', author: 'Orson Scott Card', isbn: '9780312853235' },
    { title: 'Speaker for the Dead', category: 'Science Fiction', author: 'Orson Scott Card', isbn: '9780312853259' },
    { title: 'Xenocide', category: 'Science Fiction', author: 'Orson Scott Card', isbn: '9780312861872' },
    { title: '2001: A Space Odyssey', category: 'Science Fiction', author: 'Arthur C. Clarke', isbn: '9780451457998' },
    { title: 'Rendezvous with Rama', category: 'Science Fiction', author: 'Arthur C. Clarke', isbn: '9780358380221' },
    { title: 'Childhoods End', category: 'Science Fiction', author: 'Arthur C. Clarke', isbn: '9780345444059' },
    { title: 'Neuromancer', category: 'Science Fiction', author: 'William Gibson', isbn: '9780441569595' },
    { title: 'Snow Crash', category: 'Science Fiction', author: 'Neal Stephenson', isbn: '9780553380958' },
    { title: 'The Diamond Age', category: 'Science Fiction', author: 'Neal Stephenson', isbn: '9780553380965' },
    { title: 'Fahrenheit 451', category: 'Science Fiction', author: 'Ray Bradbury', isbn: '9781451673319' },
    { title: 'The Illustrated Man', category: 'Science Fiction', author: 'Ray Bradbury', isbn: '9781451678185' },
    { title: 'The Martian Chronicles', category: 'Science Fiction', author: 'Ray Bradbury', isbn: '9781451678192' },
    { title: 'Do Androids Dream of Electric Sheep?', category: 'Science Fiction', author: 'Philip K. Dick', isbn: '9780345404473' },
    { title: 'The Man in the High Castle', category: 'Science Fiction', author: 'Philip K. Dick', isbn: '9780547572482' },
    { title: 'Ubik', category: 'Science Fiction', author: 'Philip K. Dick', isbn: '9780547572291' },
    { title: 'The Left Hand of Darkness', category: 'Science Fiction', author: 'Ursula K. Le Guin', isbn: '9780441478125' },
    { title: 'The Dispossessed', category: 'Science Fiction', author: 'Ursula K. Le Guin', isbn: '9780061054884' },
    { title: 'The Hitchhikers Guide to the Galaxy', category: 'Science Fiction', author: 'Douglas Adams', isbn: '9780345391803' },
    { title: 'The Restaurant at the End of the Universe', category: 'Science Fiction', author: 'Douglas Adams', isbn: '9780345391810' },
    { title: 'Life, the Universe and Everything', category: 'Science Fiction', author: 'Douglas Adams', isbn: '9780345391827' },
    { title: 'The War of the Worlds', category: 'Science Fiction', author: 'H.G. Wells', isbn: '9780141439976' },
    { title: 'The Time Machine', category: 'Science Fiction', author: 'H.G. Wells', isbn: '9780451528551' },
    { title: 'The Invisible Man', category: 'Science Fiction', author: 'H.G. Wells', isbn: '9780141439983' },

    // Mystery & Thriller (35 books)
    { title: 'Murder on the Orient Express', category: 'Mystery', author: 'Agatha Christie', isbn: '9780062693662' },
    { title: 'And Then There Were None', category: 'Mystery', author: 'Agatha Christie', isbn: '9780062073488' },
    { title: 'The Murder of Roger Ackroyd', category: 'Mystery', author: 'Agatha Christie', isbn: '9780062073563' },
    { title: 'Death on the Nile', category: 'Mystery', author: 'Agatha Christie', isbn: '9780062073556' },
    { title: 'The ABC Murders', category: 'Mystery', author: 'Agatha Christie', isbn: '9780062073587' },
    { title: 'The Girl with the Dragon Tattoo', category: 'Thriller', author: 'Stieg Larsson', isbn: '9780307454546' },
    { title: 'The Girl Who Played with Fire', category: 'Thriller', author: 'Stieg Larsson', isbn: '9780307454553' },
    { title: 'The Girl Who Kicked the Hornets Nest', category: 'Thriller', author: 'Stieg Larsson', isbn: '9780307454560' },
    { title: 'Gone Girl', category: 'Thriller', author: 'Gillian Flynn', isbn: '9780307588371' },
    { title: 'Sharp Objects', category: 'Thriller', author: 'Gillian Flynn', isbn: '9780307341556' },
    { title: 'Dark Places', category: 'Thriller', author: 'Gillian Flynn', isbn: '9780307341570' },
    { title: 'The Da Vinci Code', category: 'Thriller', author: 'Dan Brown', isbn: '9780307474278' },
    { title: 'Angels and Demons', category: 'Thriller', author: 'Dan Brown', isbn: '9781416524793' },
    { title: 'Inferno', category: 'Thriller', author: 'Dan Brown', isbn: '9781400079155' },
    { title: 'The Lost Symbol', category: 'Thriller', author: 'Dan Brown', isbn: '9780307950680' },
    { title: 'Origin', category: 'Thriller', author: 'Dan Brown', isbn: '9780385514231' },
    { title: 'The Girl on the Train', category: 'Thriller', author: 'Paula Hawkins', isbn: '9781594634024' },
    { title: 'Into the Water', category: 'Thriller', author: 'Paula Hawkins', isbn: '9780735211209' },
    { title: 'The Silent Patient', category: 'Thriller', author: 'Alex Michaelides', isbn: '9781250301697' },
    { title: 'The Maidens', category: 'Thriller', author: 'Alex Michaelides', isbn: '9781250304452' },
    { title: 'Big Little Lies', category: 'Mystery', author: 'Liane Moriarty', isbn: '9780399167065' },
    { title: 'The Husband Secret', category: 'Mystery', author: 'Liane Moriarty', isbn: '9780425267721' },
    { title: 'Truly Madly Guilty', category: 'Mystery', author: 'Liane Moriarty', isbn: '9781250069795' },
    { title: 'The Woman in the Window', category: 'Thriller', author: 'A.J. Finn', isbn: '9780062678416' },
    { title: 'The Firm', category: 'Thriller', author: 'John Grisham', isbn: '9780385319058' },
    { title: 'A Time to Kill', category: 'Thriller', author: 'John Grisham', isbn: '9780385338608' },
    { title: 'The Pelican Brief', category: 'Thriller', author: 'John Grisham', isbn: '9780385339704' },
    { title: 'The Client', category: 'Thriller', author: 'John Grisham', isbn: '9780385339087' },
    { title: 'Along Came a Spider', category: 'Thriller', author: 'James Patterson', isbn: '9780316072915' },
    { title: 'Kiss the Girls', category: 'Thriller', author: 'James Patterson', isbn: '9780446601245' },
    { title: 'Jack and Jill', category: 'Thriller', author: 'James Patterson', isbn: '9780446604802' },
    { title: 'The Bourne Identity', category: 'Thriller', author: 'Robert Ludlum', isbn: '9780553593549' },
    { title: 'The Bourne Supremacy', category: 'Thriller', author: 'Robert Ludlum', isbn: '9780553263220' },
    { title: 'The Bourne Ultimatum', category: 'Thriller', author: 'Robert Ludlum', isbn: '9780553287738' },
    { title: 'Red Dragon', category: 'Thriller', author: 'Thomas Harris', isbn: '9780425228227' },

    // Horror (20 books)
    { title: 'The Shining', category: 'Horror', author: 'Stephen King', isbn: '9780307743657' },
    { title: 'It', category: 'Horror', author: 'Stephen King', isbn: '9781501142970' },
    { title: 'Pet Sematary', category: 'Horror', author: 'Stephen King', isbn: '9781501156700' },
    { title: 'Carrie', category: 'Horror', author: 'Stephen King', isbn: '9780307743664' },
    { title: 'The Stand', category: 'Horror', author: 'Stephen King', isbn: '9780307743688' },
    { title: 'Misery', category: 'Horror', author: 'Stephen King', isbn: '9781501143106' },
    { title: 'Doctor Sleep', category: 'Horror', author: 'Stephen King', isbn: '9781451698855' },
    { title: 'Salem Lot', category: 'Horror', author: 'Stephen King', isbn: '9780307743671' },
    { title: 'The Green Mile', category: 'Horror', author: 'Stephen King', isbn: '9781501192265' },
    { title: 'Cujo', category: 'Horror', author: 'Stephen King', isbn: '9781501192241' },
    { title: 'Christine', category: 'Horror', author: 'Stephen King', isbn: '9781501144189' },
    { title: 'The Dead Zone', category: 'Horror', author: 'Stephen King', isbn: '9781501144509' },
    { title: 'Firestarter', category: 'Horror', author: 'Stephen King', isbn: '9781501143793' },
    { title: 'The Exorcist', category: 'Horror', author: 'William Peter Blatty', isbn: '9780061007224' },
    { title: 'Rosemarys Baby', category: 'Horror', author: 'Ira Levin', isbn: '9781605981703' },
    { title: 'The Haunting of Hill House', category: 'Horror', author: 'Shirley Jackson', isbn: '9780143039983' },
    { title: 'We Have Always Lived in the Castle', category: 'Horror', author: 'Shirley Jackson', isbn: '9780143039976' },
    { title: 'House of Leaves', category: 'Horror', author: 'Mark Z. Danielewski', isbn: '9780375703768' },
    { title: 'Bird Box', category: 'Horror', author: 'Josh Malerman', isbn: '9780062259653' },
    { title: 'Mexican Gothic', category: 'Horror', author: 'Silvia Moreno-Garcia', isbn: '9780525620785' },

    // Young Adult (25 books)
    { title: 'The Hunger Games', category: 'Young Adult', author: 'Suzanne Collins', isbn: '9780439023528' },
    { title: 'Catching Fire', category: 'Young Adult', author: 'Suzanne Collins', isbn: '9780439023498' },
    { title: 'Mockingjay', category: 'Young Adult', author: 'Suzanne Collins', isbn: '9780439023511' },
    { title: 'Divergent', category: 'Young Adult', author: 'Veronica Roth', isbn: '9780062024039' },
    { title: 'Insurgent', category: 'Young Adult', author: 'Veronica Roth', isbn: '9780062024046' },
    { title: 'Allegiant', category: 'Young Adult', author: 'Veronica Roth', isbn: '9780062024060' },
    { title: 'The Fault in Our Stars', category: 'Young Adult', author: 'John Green', isbn: '9780525478812' },
    { title: 'Looking for Alaska', category: 'Young Adult', author: 'John Green', isbn: '9780142402511' },
    { title: 'Paper Towns', category: 'Young Adult', author: 'John Green', isbn: '9780142414934' },
    { title: 'An Abundance of Katherines', category: 'Young Adult', author: 'John Green', isbn: '9780142410707' },
    { title: 'Turtles All the Way Down', category: 'Young Adult', author: 'John Green', isbn: '9780525555360' },
    { title: 'The Maze Runner', category: 'Young Adult', author: 'James Dashner', isbn: '9780385737951' },
    { title: 'The Scorch Trials', category: 'Young Adult', author: 'James Dashner', isbn: '9780385738767' },
    { title: 'The Death Cure', category: 'Young Adult', author: 'James Dashner', isbn: '9780385738774' },
    { title: 'Twilight', category: 'Young Adult', author: 'Stephenie Meyer', isbn: '9780316015844' },
    { title: 'New Moon', category: 'Young Adult', author: 'Stephenie Meyer', isbn: '9780316024969' },
    { title: 'Eclipse', category: 'Young Adult', author: 'Stephenie Meyer', isbn: '9780316160209' },
    { title: 'Breaking Dawn', category: 'Young Adult', author: 'Stephenie Meyer', isbn: '9780316067935' },
    { title: 'Percy Jackson: The Lightning Thief', category: 'Young Adult', author: 'Rick Riordan', isbn: '9780786838653' },
    { title: 'Percy Jackson: Sea of Monsters', category: 'Young Adult', author: 'Rick Riordan', isbn: '9781423103349' },
    { title: 'The Giver', category: 'Young Adult', author: 'Lois Lowry', isbn: '9780544336261' },
    { title: 'Gathering Blue', category: 'Young Adult', author: 'Lois Lowry', isbn: '9780547904146' },
    { title: 'The Perks of Being a Wallflower', category: 'Young Adult', author: 'Stephen Chbosky', isbn: '9781451696196' },
    { title: 'Eleanor and Park', category: 'Young Adult', author: 'Rainbow Rowell', isbn: '9781250012579' },
    { title: 'Fangirl', category: 'Young Adult', author: 'Rainbow Rowell', isbn: '9781250030955' },

    // Romance (20 books)
    { title: 'Pride and Prejudice', category: 'Romance', author: 'Jane Austen', isbn: '9780141040349' },
    { title: 'Sense and Sensibility', category: 'Romance', author: 'Jane Austen', isbn: '9780141439662' },
    { title: 'Emma', category: 'Romance', author: 'Jane Austen', isbn: '9780141439587' },
    { title: 'Persuasion', category: 'Romance', author: 'Jane Austen', isbn: '9780141439686' },
    { title: 'Outlander', category: 'Romance', author: 'Diana Gabaldon', isbn: '9780440212560' },
    { title: 'Dragonfly in Amber', category: 'Romance', author: 'Diana Gabaldon', isbn: '9780440215622' },
    { title: 'The Notebook', category: 'Romance', author: 'Nicholas Sparks', isbn: '9781455582877' },
    { title: 'A Walk to Remember', category: 'Romance', author: 'Nicholas Sparks', isbn: '9781455550418' },
    { title: 'Message in a Bottle', category: 'Romance', author: 'Nicholas Sparks', isbn: '9781455532032' },
    { title: 'Dear John', category: 'Romance', author: 'Nicholas Sparks', isbn: '9780446618328' },
    { title: 'The Last Song', category: 'Romance', author: 'Nicholas Sparks', isbn: '9780446547567' },
    { title: 'It Ends with Us', category: 'Romance', author: 'Colleen Hoover', isbn: '9781501110368' },
    { title: 'It Starts with Us', category: 'Romance', author: 'Colleen Hoover', isbn: '9781668001226' },
    { title: 'Ugly Love', category: 'Romance', author: 'Colleen Hoover', isbn: '9781476753188' },
    { title: 'Verity', category: 'Romance', author: 'Colleen Hoover', isbn: '9781538724736' },
    { title: 'November 9', category: 'Romance', author: 'Colleen Hoover', isbn: '9781501110344' },
    { title: 'Confess', category: 'Romance', author: 'Colleen Hoover', isbn: '9781476791456' },
    { title: 'Beach Read', category: 'Romance', author: 'Emily Henry', isbn: '9781984806734' },
    { title: 'People We Meet on Vacation', category: 'Romance', author: 'Emily Henry', isbn: '9781984806758' },
    { title: 'Book Lovers', category: 'Romance', author: 'Emily Henry', isbn: '9780593334836' },

    // Non-Fiction (30 books)
    { title: 'Sapiens: A Brief History of Humankind', category: 'Non-Fiction', author: 'Yuval Noah Harari', isbn: '9780062316097' },
    { title: 'Homo Deus', category: 'Non-Fiction', author: 'Yuval Noah Harari', isbn: '9780062464316' },
    { title: '21 Lessons for the 21st Century', category: 'Non-Fiction', author: 'Yuval Noah Harari', isbn: '9780525512172' },
    { title: 'Outliers', category: 'Non-Fiction', author: 'Malcolm Gladwell', isbn: '9780316017930' },
    { title: 'The Tipping Point', category: 'Non-Fiction', author: 'Malcolm Gladwell', isbn: '9780316346627' },
    { title: 'Blink', category: 'Non-Fiction', author: 'Malcolm Gladwell', isbn: '9780316010665' },
    { title: 'David and Goliath', category: 'Non-Fiction', author: 'Malcolm Gladwell', isbn: '9780316204361' },
    { title: 'Talking to Strangers', category: 'Non-Fiction', author: 'Malcolm Gladwell', isbn: '9780316478526' },
    { title: 'Freakonomics', category: 'Non-Fiction', author: 'Steven D. Levitt', isbn: '9780060731335' },
    { title: 'SuperFreakonomics', category: 'Non-Fiction', author: 'Steven D. Levitt', isbn: '9780060889579' },
    { title: 'Guns, Germs, and Steel', category: 'Non-Fiction', author: 'Jared Diamond', isbn: '9780393354324' },
    { title: 'Collapse', category: 'Non-Fiction', author: 'Jared Diamond', isbn: '9780143117001' },
    { title: 'The Immortal Life of Henrietta Lacks', category: 'Non-Fiction', author: 'Rebecca Skloot', isbn: '9781400052189' },
    { title: 'Educated', category: 'Non-Fiction', author: 'Tara Westover', isbn: '9780399590504' },
    { title: 'Born a Crime', category: 'Non-Fiction', author: 'Trevor Noah', isbn: '9780399588174' },
    { title: 'When Breath Becomes Air', category: 'Non-Fiction', author: 'Paul Kalanithi', isbn: '9780812988406' },
    { title: 'The Glass Castle', category: 'Non-Fiction', author: 'Jeannette Walls', isbn: '9780743247542' },
    { title: 'Into the Wild', category: 'Non-Fiction', author: 'Jon Krakauer', isbn: '9780385486804' },
    { title: 'Into Thin Air', category: 'Non-Fiction', author: 'Jon Krakauer', isbn: '9780385494786' },
    { title: 'Quiet: The Power of Introverts', category: 'Non-Fiction', author: 'Susan Cain', isbn: '9780307352156' },
    { title: 'The Body: A Guide for Occupants', category: 'Non-Fiction', author: 'Bill Bryson', isbn: '9780385539302' },
    { title: 'A Short History of Nearly Everything', category: 'Non-Fiction', author: 'Bill Bryson', isbn: '9780767908184' },
    { title: 'In a Sunburned Country', category: 'Non-Fiction', author: 'Bill Bryson', isbn: '9780767903868' },
    { title: 'A Walk in the Woods', category: 'Non-Fiction', author: 'Bill Bryson', isbn: '9780307279460' },
    { title: 'The Wright Brothers', category: 'Non-Fiction', author: 'David McCullough', isbn: '9781476728742' },
    { title: 'Unbroken', category: 'Non-Fiction', author: 'Laura Hillenbrand', isbn: '9780812974492' },
    { title: 'Seabiscuit', category: 'Non-Fiction', author: 'Laura Hillenbrand', isbn: '9780449005613' },
    { title: 'The Devil in the White City', category: 'Non-Fiction', author: 'Erik Larson', isbn: '9780375725609' },
    { title: 'Dead Wake', category: 'Non-Fiction', author: 'Erik Larson', isbn: '9780307408877' },
    { title: 'The Splendid and the Vile', category: 'Non-Fiction', author: 'Erik Larson', isbn: '9780385348713' },

    // Biography (15 books)
    { title: 'Steve Jobs', category: 'Biography', author: 'Walter Isaacson', isbn: '9781451648539' },
    { title: 'Einstein: His Life and Universe', category: 'Biography', author: 'Walter Isaacson', isbn: '9780743264747' },
    { title: 'Benjamin Franklin', category: 'Biography', author: 'Walter Isaacson', isbn: '9780684807614' },
    { title: 'Leonardo da Vinci', category: 'Biography', author: 'Walter Isaacson', isbn: '9781501139154' },
    { title: 'Elon Musk', category: 'Biography', author: 'Ashlee Vance', isbn: '9780062301253' },
    { title: 'Becoming', category: 'Biography', author: 'Michelle Obama', isbn: '9781524763138' },
    { title: 'A Promised Land', category: 'Biography', author: 'Barack Obama', isbn: '9781524763169' },
    { title: 'Long Walk to Freedom', category: 'Biography', author: 'Nelson Mandela', isbn: '9780316548182' },
    { title: 'The Autobiography of Malcolm X', category: 'Biography', author: 'Malcolm X', isbn: '9780345350688' },
    { title: 'The Diary of a Young Girl', category: 'Biography', author: 'Anne Frank', isbn: '9780553296983' },
    { title: 'Alexander Hamilton', category: 'Biography', author: 'Ron Chernow', isbn: '9780143034759' },
    { title: 'Washington: A Life', category: 'Biography', author: 'Ron Chernow', isbn: '9780143119968' },
    { title: 'Team of Rivals', category: 'Biography', author: 'Doris Kearns Goodwin', isbn: '9780743270755' },
    { title: 'Shoe Dog', category: 'Biography', author: 'Phil Knight', isbn: '9781501135910' },
    { title: 'Open', category: 'Biography', author: 'Andre Agassi', isbn: '9780307388407' },

    // Self-Help & Psychology (25 books)
    { title: 'Atomic Habits', category: 'Self-Help', author: 'James Clear', isbn: '9780735211292' },
    { title: 'The 7 Habits of Highly Effective People', category: 'Self-Help', author: 'Stephen Covey', isbn: '9781982137274' },
    { title: 'How to Win Friends and Influence People', category: 'Self-Help', author: 'Dale Carnegie', isbn: '9780671027032' },
    { title: 'Think and Grow Rich', category: 'Self-Help', author: 'Napoleon Hill', isbn: '9781585424337' },
    { title: 'The Subtle Art of Not Giving a F*ck', category: 'Self-Help', author: 'Mark Manson', isbn: '9780062457714' },
    { title: 'Thinking, Fast and Slow', category: 'Psychology', author: 'Daniel Kahneman', isbn: '9780374533557' },
    { title: 'The Power of Habit', category: 'Psychology', author: 'Charles Duhigg', isbn: '9780812981605' },
    { title: 'Mans Search for Meaning', category: 'Psychology', author: 'Viktor E. Frankl', isbn: '9780807014295' },
    { title: 'Influence: The Psychology of Persuasion', category: 'Psychology', author: 'Robert Cialdini', isbn: '9780062937650' },
    { title: 'Emotional Intelligence', category: 'Psychology', author: 'Daniel Goleman', isbn: '9780553804911' },
    { title: 'Mindset: The New Psychology of Success', category: 'Psychology', author: 'Carol S. Dweck', isbn: '9780345472328' },
    { title: 'Grit: The Power of Passion and Perseverance', category: 'Psychology', author: 'Angela Duckworth', isbn: '9781501111112' },
    { title: 'The Four Agreements', category: 'Self-Help', author: 'Don Miguel Ruiz', isbn: '9781878424310' },
    { title: 'The Power of Now', category: 'Self-Help', author: 'Eckhart Tolle', isbn: '9781577314806' },
    { title: 'A New Earth', category: 'Self-Help', author: 'Eckhart Tolle', isbn: '9780452289963' },
    { title: 'Daring Greatly', category: 'Self-Help', author: 'Brene Brown', isbn: '9781592408412' },
    { title: 'The Gifts of Imperfection', category: 'Self-Help', author: 'Brene Brown', isbn: '9781592858491' },
    { title: 'Rising Strong', category: 'Self-Help', author: 'Brene Brown', isbn: '9780812995824' },
    { title: 'You Are a Badass', category: 'Self-Help', author: 'Jen Sincero', isbn: '9780762447695' },
    { title: 'The Life-Changing Magic of Tidying Up', category: 'Self-Help', author: 'Marie Kondo', isbn: '9781607747307' },
    { title: '12 Rules for Life', category: 'Self-Help', author: 'Jordan B. Peterson', isbn: '9780345816023' },
    { title: 'Beyond Order', category: 'Self-Help', author: 'Jordan B. Peterson', isbn: '9780593084649' },
    { title: 'The 5 Love Languages', category: 'Self-Help', author: 'Gary Chapman', isbn: '9780802412706' },
    { title: 'Boundaries', category: 'Self-Help', author: 'Henry Cloud', isbn: '9780310351801' },
    { title: 'The Happiness Project', category: 'Self-Help', author: 'Gretchen Rubin', isbn: '9780061583261' },

    // Business (20 books)
    { title: 'The Lean Startup', category: 'Business', author: 'Eric Ries', isbn: '9780307887894' },
    { title: 'Zero to One', category: 'Business', author: 'Peter Thiel', isbn: '9780804139298' },
    { title: 'Start with Why', category: 'Business', author: 'Simon Sinek', isbn: '9781591846444' },
    { title: 'Good to Great', category: 'Business', author: 'Jim Collins', isbn: '9780066620992' },
    { title: 'Built to Last', category: 'Business', author: 'Jim Collins', isbn: '9780060516406' },
    { title: 'The Hard Thing About Hard Things', category: 'Business', author: 'Ben Horowitz', isbn: '9780062273208' },
    { title: 'Thinking in Bets', category: 'Business', author: 'Annie Duke', isbn: '9780735216358' },
    { title: 'The E-Myth Revisited', category: 'Business', author: 'Michael E. Gerber', isbn: '9780887307287' },
    { title: 'Rich Dad Poor Dad', category: 'Business', author: 'Robert Kiyosaki', isbn: '9781612680194' },
    { title: 'The Intelligent Investor', category: 'Business', author: 'Benjamin Graham', isbn: '9780060555665' },
    { title: 'A Random Walk Down Wall Street', category: 'Business', author: 'Burton Malkiel', isbn: '9780393358384' },
    { title: 'The Psychology of Money', category: 'Business', author: 'Morgan Housel', isbn: '9780857197689' },
    { title: 'Think Again', category: 'Business', author: 'Adam Grant', isbn: '9781984878106' },
    { title: 'Give and Take', category: 'Business', author: 'Adam Grant', isbn: '9780143124986' },
    { title: 'Originals', category: 'Business', author: 'Adam Grant', isbn: '9780525429562' },
    { title: 'Leaders Eat Last', category: 'Business', author: 'Simon Sinek', isbn: '9781591848011' },
    { title: 'The Infinite Game', category: 'Business', author: 'Simon Sinek', isbn: '9780735213500' },
    { title: 'Principles', category: 'Business', author: 'Ray Dalio', isbn: '9781501124020' },
    { title: 'The 4-Hour Workweek', category: 'Business', author: 'Timothy Ferriss', isbn: '9780307465351' },
    { title: 'Rework', category: 'Business', author: 'Jason Fried', isbn: '9780307463746' },

    // Science (15 books)
    { title: 'A Brief History of Time', category: 'Science', author: 'Stephen Hawking', isbn: '9780553380163' },
    { title: 'The Universe in a Nutshell', category: 'Science', author: 'Stephen Hawking', isbn: '9780553802023' },
    { title: 'The Grand Design', category: 'Science', author: 'Stephen Hawking', isbn: '9780553384666' },
    { title: 'The Origin of Species', category: 'Science', author: 'Charles Darwin', isbn: '9780451529060' },
    { title: 'Cosmos', category: 'Science', author: 'Carl Sagan', isbn: '9780345539434' },
    { title: 'Pale Blue Dot', category: 'Science', author: 'Carl Sagan', isbn: '9780345376596' },
    { title: 'The Demon-Haunted World', category: 'Science', author: 'Carl Sagan', isbn: '9780345409461' },
    { title: 'Astrophysics for People in a Hurry', category: 'Science', author: 'Neil deGrasse Tyson', isbn: '9780393609394' },
    { title: 'The Selfish Gene', category: 'Science', author: 'Richard Dawkins', isbn: '9780199291151' },
    { title: 'The God Delusion', category: 'Science', author: 'Richard Dawkins', isbn: '9780618918249' },
    { title: 'The Blind Watchmaker', category: 'Science', author: 'Richard Dawkins', isbn: '9780393351491' },
    { title: 'A Short History of Nearly Everything', category: 'Science', author: 'Bill Bryson', isbn: '9780767908177' },
    { title: 'The Gene: An Intimate History', category: 'Science', author: 'Siddhartha Mukherjee', isbn: '9781476733500' },
    { title: 'The Emperor of All Maladies', category: 'Science', author: 'Siddhartha Mukherjee', isbn: '9781439170915' },
    { title: 'Silent Spring', category: 'Science', author: 'Rachel Carson', isbn: '9780618249060' },

    // Technology (10 books)
    { title: 'Clean Code', category: 'Technology', author: 'Robert C. Martin', isbn: '9780132350884' },
    { title: 'The Pragmatic Programmer', category: 'Technology', author: 'David Thomas', isbn: '9780135957059' },
    { title: 'Design Patterns', category: 'Technology', author: 'Gang of Four', isbn: '9780201633610' },
    { title: 'Code Complete', category: 'Technology', author: 'Steve McConnell', isbn: '9780735619678' },
    { title: 'The Mythical Man-Month', category: 'Technology', author: 'Frederick Brooks', isbn: '9780201835953' },
    { title: 'Refactoring', category: 'Technology', author: 'Martin Fowler', isbn: '9780134757599' },
    { title: 'Introduction to Algorithms', category: 'Technology', author: 'Thomas H. Cormen', isbn: '9780262033848' },
    { title: 'Structure and Interpretation', category: 'Technology', author: 'Harold Abelson', isbn: '9780262510875' },
    { title: 'Cracking the Coding Interview', category: 'Technology', author: 'Gayle McDowell', isbn: '9780984782857' },
    { title: 'The Art of Computer Programming', category: 'Technology', author: 'Donald Knuth', isbn: '9780201896831' },
  ];

  bookTitles.push(...popularBooks);

  // Create books with copies
  let copyCounter = 1;
  const createdBooks: any[] = [];

  for (const bookData of bookTitles) {
    const numCopies = Math.floor(Math.random() * 4) + 1; // 1-4 copies per book
    const book = await prisma.book.create({
      data: {
        title: bookData.title,
        author: bookData.author,
        category: bookData.category,
        isbn: bookData.isbn || null,
        description: `A compelling ${bookData.category.toLowerCase()} book by ${bookData.author}.`,
        publishedYear: 1990 + Math.floor(Math.random() * 34),
        userId, // Associate with target user
        copies: {
          create: Array.from({ length: numCopies }, () => ({
            barcode: `BC-${String(copyCounter++).padStart(4, '0')}`,
            status: 'AVAILABLE',
            condition: ['NEW', 'GOOD', 'GOOD', 'GOOD', 'FAIR'][Math.floor(Math.random() * 5)],
            shelfLocation: `${bookData.category.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 20) + 1}`,
          })),
        },
      },
      include: { copies: true },
    });
    createdBooks.push(book);
  }
  console.log(`Created ${createdBooks.length} books with ${copyCounter - 1} total copies`);

  // Create 50 members
  const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle', 'Kenneth', 'Dorothy', 'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Melissa', 'Edward', 'Deborah'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'];

  const createdMembers: any[] = [];
  for (let i = 1; i <= 50; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const member = await prisma.member.create({
      data: {
        memberNumber: `LIB-${String(i).padStart(3, '0')}`,
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
        phone: `555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        address: `${Math.floor(Math.random() * 9999) + 1} ${['Main', 'Oak', 'Elm', 'Maple', 'Cedar', 'Pine', 'Park', 'Lake', 'Hill', 'River'][Math.floor(Math.random() * 10)]} ${['St', 'Ave', 'Blvd', 'Dr', 'Ln'][Math.floor(Math.random() * 5)]}`,
        status: Math.random() > 0.1 ? 'ACTIVE' : (Math.random() > 0.5 ? 'SUSPENDED' : 'EXPIRED'),
        maxBooks: [3, 5, 5, 5, 7, 10][Math.floor(Math.random() * 6)],
        createdAt: randomPastDate(365),
        userId, // Associate with target user
      },
    });
    createdMembers.push(member);
  }
  console.log(`Created ${createdMembers.length} members`);

  // Get all available copies for borrowing (only from this user's books)
  const allCopies = await prisma.bookCopy.findMany({
    where: { book: { userId } },
    include: { book: true }
  });
  const activeMembers = createdMembers.filter(m => m.status === 'ACTIVE');

  // Create 150+ borrowings (mix of active, returned, overdue)
  const borrowings: any[] = [];
  const usedCopyIds = new Set<string>();

  // Active borrowings (30)
  for (let i = 0; i < 30; i++) {
    const member = activeMembers[Math.floor(Math.random() * activeMembers.length)];
    const copy = allCopies.find(c => !usedCopyIds.has(c.id) && c.status === 'AVAILABLE');
    if (!copy) continue;

    usedCopyIds.add(copy.id);
    const borrowDate = randomPastDate(14);
    const dueDate = new Date(borrowDate);
    dueDate.setDate(dueDate.getDate() + 14);

    const borrowing = await prisma.borrowing.create({
      data: {
        memberId: member.id,
        bookCopyId: copy.id,
        borrowDate,
        dueDate,
        status: 'ACTIVE',
      },
    });
    await prisma.bookCopy.update({ where: { id: copy.id }, data: { status: 'BORROWED' } });
    borrowings.push(borrowing);
  }

  // Overdue borrowings (20)
  for (let i = 0; i < 20; i++) {
    const member = activeMembers[Math.floor(Math.random() * activeMembers.length)];
    const copy = allCopies.find(c => !usedCopyIds.has(c.id) && c.status === 'AVAILABLE');
    if (!copy) continue;

    usedCopyIds.add(copy.id);
    const borrowDate = pastDate(Math.floor(Math.random() * 30) + 20);
    const dueDate = new Date(borrowDate);
    dueDate.setDate(dueDate.getDate() + 14);

    const borrowing = await prisma.borrowing.create({
      data: {
        memberId: member.id,
        bookCopyId: copy.id,
        borrowDate,
        dueDate,
        status: 'ACTIVE',
      },
    });
    await prisma.bookCopy.update({ where: { id: copy.id }, data: { status: 'BORROWED' } });
    borrowings.push(borrowing);

    // Create fine for overdue
    const daysOverdue = Math.ceil((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysOverdue > 0) {
      await prisma.fine.create({
        data: {
          borrowingId: borrowing.id,
          amount: daysOverdue * 0.50,
          reason: 'OVERDUE',
          status: Math.random() > 0.7 ? 'PAID' : 'PENDING',
          paidAt: Math.random() > 0.7 ? new Date() : null,
        },
      });
    }
  }

  // Returned borrowings (100+)
  for (let i = 0; i < 100; i++) {
    const member = activeMembers[Math.floor(Math.random() * activeMembers.length)];
    const copy = allCopies.find(c => !usedCopyIds.has(c.id) && c.status === 'AVAILABLE');
    if (!copy) continue;

    const borrowDate = randomPastDate(90);
    const dueDate = new Date(borrowDate);
    dueDate.setDate(dueDate.getDate() + 14);
    const returnDate = new Date(dueDate);
    returnDate.setDate(returnDate.getDate() + Math.floor(Math.random() * 7) - 3);

    const borrowing = await prisma.borrowing.create({
      data: {
        memberId: member.id,
        bookCopyId: copy.id,
        borrowDate,
        dueDate,
        returnDate,
        status: 'RETURNED',
      },
    });
    borrowings.push(borrowing);

    // Some returned late - create paid fines
    if (returnDate > dueDate) {
      const daysLate = Math.ceil((returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      await prisma.fine.create({
        data: {
          borrowingId: borrowing.id,
          amount: daysLate * 0.50,
          reason: 'OVERDUE',
          status: 'PAID',
          paidAt: returnDate,
        },
      });
    }
  }

  console.log(`Created ${borrowings.length} borrowings`);

  // Get final stats
  const stats = await Promise.all([
    prisma.book.count(),
    prisma.bookCopy.count(),
    prisma.member.count(),
    prisma.borrowing.count(),
    prisma.borrowing.count({ where: { status: 'ACTIVE' } }),
    prisma.borrowing.count({ where: { status: 'ACTIVE', dueDate: { lt: new Date() } } }),
    prisma.fine.count(),
    prisma.fine.aggregate({ _sum: { amount: true } }),
  ]);

  console.log('\n=== Seeding Complete ===');
  console.log(`Books: ${stats[0]}`);
  console.log(`Book Copies: ${stats[1]}`);
  console.log(`Members: ${stats[2]}`);
  console.log(`Total Borrowings: ${stats[3]}`);
  console.log(`Active Borrowings: ${stats[4]}`);
  console.log(`Overdue Borrowings: ${stats[5]}`);
  console.log(`Fines: ${stats[6]} (Total: $${stats[7]._sum.amount?.toFixed(2) || '0.00'})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
