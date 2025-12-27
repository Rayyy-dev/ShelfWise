# ShelfWise Database Schema

## Entity Relationship Diagram

```
+----------------+     +----------------+     +----------------+
|     USER       |     |     BOOK       |     |    MEMBER      |
+----------------+     +----------------+     +----------------+
| id (PK)        |     | id (PK)        |     | id (PK)        |
| email (UK)     |     | isbn (UK)      |     | memberNumber   |
| passwordHash   |     | title          |     | firstName      |
| name           |     | author         |     | lastName       |
| role           |     | category       |     | email (UK)     |
| createdAt      |     | description    |     | phone          |
| updatedAt      |     | publishedYear  |     | address        |
+----------------+     | coverImage     |     | status         |
                       | createdAt      |     | maxBooks       |
                       | updatedAt      |     | createdAt      |
                       +----------------+     | updatedAt      |
                              |               +----------------+
                              | 1:N                  |
                              v                      | 1:N
                       +----------------+            v
                       |   BOOK_COPY    |     +----------------+
                       +----------------+     |   BORROWING    |
                       | id (PK)        |     +----------------+
                       | bookId (FK)    |<----| id (PK)        |
                       | barcode (UK)   |     | memberId (FK)  |
                       | status         |     | bookCopyId(FK) |
                       | condition      |     | borrowDate     |
                       | shelfLocation  |     | dueDate        |
                       | createdAt      |     | returnDate     |
                       | updatedAt      |     | status         |
                       +----------------+     | createdAt      |
                                              | updatedAt      |
                                              +----------------+
                                                     |
                                                     | 1:N
                                                     v
                                              +----------------+
                                              |     FINE       |
                                              +----------------+
                                              | id (PK)        |
                                              | borrowingId(FK)|
                                              | amount         |
                                              | reason         |
                                              | status         |
                                              | paidAt         |
                                              | createdAt      |
                                              | updatedAt      |
                                              +----------------+

PK = Primary Key
FK = Foreign Key
UK = Unique Key
```

## Tables Description

### 1. User
Stores library staff who can access the system.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK | Unique identifier (CUID) |
| email | String | Unique, Not Null | Staff email address |
| passwordHash | String | Not Null | Bcrypt hashed password |
| name | String | Not Null | Full name |
| role | String | Default: LIBRARIAN | ADMIN or LIBRARIAN |
| createdAt | DateTime | Auto | Creation timestamp |
| updatedAt | DateTime | Auto | Last update timestamp |

### 2. Book
Represents book titles in the library catalog.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK | Unique identifier |
| isbn | String | Unique | ISBN number |
| title | String | Not Null | Book title |
| author | String | Not Null | Author name |
| category | String | Not Null | Genre/category |
| description | String | Nullable | Book description |
| publishedYear | Int | Nullable | Year of publication |
| coverImage | String | Nullable | URL to cover image |

### 3. BookCopy
Represents individual physical copies of books.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK | Unique identifier |
| bookId | String | FK -> Book.id | Reference to book |
| barcode | String | Unique, Not Null | Physical barcode |
| status | String | Default: AVAILABLE | AVAILABLE, BORROWED, MAINTENANCE, LOST |
| condition | String | Default: GOOD | NEW, GOOD, FAIR, POOR |
| shelfLocation | String | Nullable | Physical shelf location |

### 4. Member
Library patrons who can borrow books.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK | Unique identifier |
| memberNumber | String | Unique, Not Null | Format: LIB-001, LIB-002... |
| firstName | String | Not Null | First name |
| lastName | String | Not Null | Last name |
| email | String | Unique, Not Null | Email address |
| phone | String | Nullable | Phone number |
| address | String | Nullable | Address |
| status | String | Default: ACTIVE | ACTIVE, SUSPENDED, EXPIRED |
| maxBooks | Int | Default: 5 | Maximum concurrent loans |

### 5. Borrowing
Records of book loans.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK | Unique identifier |
| memberId | String | FK -> Member.id | Borrowing member |
| bookCopyId | String | FK -> BookCopy.id | Borrowed copy |
| borrowDate | DateTime | Default: now() | Date borrowed |
| dueDate | DateTime | Not Null | Return due date |
| returnDate | DateTime | Nullable | Actual return date |
| status | String | Default: ACTIVE | ACTIVE, RETURNED |

### 6. Fine
Financial penalties for overdue or damaged books.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK | Unique identifier |
| borrowingId | String | FK -> Borrowing.id | Related borrowing |
| amount | Float | Not Null | Fine amount in dollars |
| reason | String | Not Null | OVERDUE, DAMAGE, LOST |
| status | String | Default: PENDING | PENDING, PAID, WAIVED |
| paidAt | DateTime | Nullable | Payment timestamp |

## Relationships

1. **Book -> BookCopy** (1:N)
   - One book can have multiple physical copies
   - Cascade delete: Deleting a book removes all its copies

2. **Member -> Borrowing** (1:N)
   - One member can have many borrowings
   - Members cannot be deleted while having active loans

3. **BookCopy -> Borrowing** (1:N)
   - One copy can be borrowed multiple times
   - Each borrowing record represents one loan period

4. **Borrowing -> Fine** (1:N)
   - One borrowing can have multiple fines
   - Fines can be for overdue, damage, or lost books

## Business Rules

1. **Borrowing Limits**: Members cannot exceed their `maxBooks` limit for concurrent loans
2. **Status Transitions**:
   - BookCopy: AVAILABLE -> BORROWED -> AVAILABLE (on return)
   - Member: Must be ACTIVE to borrow books
3. **Fine Calculation**: $0.50 per day overdue
4. **Member Numbers**: Auto-generated as LIB-001, LIB-002, etc.
