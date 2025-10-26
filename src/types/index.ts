export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
  timestamp: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt?: string;
  borrowedBooksCount?: number;
}

export interface LoginResponse extends User {
  token: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  publishedYear: number;
  genre?: string;
  description?: string;
  totalCopies: number;
  availableCopies: number;
  coverImage?: string;
}

export interface BooksResponse {
  content: Book[];
  totalPages: number;
  currentPage: number;
  totalElements: number;
}

export interface BorrowedBook extends Book {
  borrowedDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE';
}

export interface BorrowingRecord {
  id: number;
  userId: number;
  bookId: number;
  borrowedDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE';
}
