import { ApiResponse, LoginResponse, User, BooksResponse, Book, BorrowedBook, BorrowingRecord } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const PROXY_URL = `${SUPABASE_URL}/functions/v1/library-api-proxy`;

const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  const data = await response.json();
  return data;
};

const proxyFetch = async (path: string, options: RequestInit = {}): Promise<Response> => {
  const url = `${PROXY_URL}?path=${encodeURIComponent(path)}`;
  return fetch(url, options);
};

export const authApi = {
  register: async (username: string, email: string, password: string): Promise<ApiResponse<User>> => {
    const response = await proxyFetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    return handleResponse<User>(response);
  },

  login: async (username: string, password: string): Promise<ApiResponse<LoginResponse>> => {
    const response = await proxyFetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return handleResponse<LoginResponse>(response);
  },

  validate: async (): Promise<ApiResponse<User>> => {
    const response = await proxyFetch('/api/auth/validate', {
      method: 'GET',
      headers: getAuthHeader(),
    });
    return handleResponse<User>(response);
  },
};

export const booksApi = {
  getAll: async (params?: { page?: number; size?: number; genre?: string; search?: string }): Promise<ApiResponse<BooksResponse>> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.genre) queryParams.append('genre', params.genre);
    if (params?.search) queryParams.append('search', params.search);

    const response = await proxyFetch(`/api/books?${queryParams}`, {
      method: 'GET',
    });
    return handleResponse<BooksResponse>(response);
  },

  getById: async (id: number): Promise<ApiResponse<Book>> => {
    const response = await proxyFetch(`/api/books/${id}`, {
      method: 'GET',
    });
    return handleResponse<Book>(response);
  },

  create: async (book: Omit<Book, 'id' | 'availableCopies'>): Promise<ApiResponse<Book>> => {
    const response = await proxyFetch('/api/books', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(book),
    });
    return handleResponse<Book>(response);
  },

  update: async (id: number, book: Partial<Book>): Promise<ApiResponse<Book>> => {
    const response = await proxyFetch(`/api/books/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(book),
    });
    return handleResponse<Book>(response);
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await proxyFetch(`/api/books/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return handleResponse<null>(response);
  },
};

export const borrowApi = {
  borrowBook: async (bookId: number, daysToKeep: number = 30): Promise<ApiResponse<BorrowingRecord>> => {
    const response = await proxyFetch(`/api/borrow/${bookId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ daysToKeep }),
    });
    return handleResponse<BorrowingRecord>(response);
  },

  returnBook: async (bookId: number): Promise<ApiResponse<BorrowingRecord>> => {
    const response = await proxyFetch(`/api/return/${bookId}`, {
      method: 'POST',
      headers: getAuthHeader(),
    });
    return handleResponse<BorrowingRecord>(response);
  },

  getBorrowedBooks: async (status?: 'ACTIVE' | 'RETURNED' | 'OVERDUE'): Promise<ApiResponse<BorrowedBook[]>> => {
    const queryParams = status ? `?status=${status}` : '';
    const response = await proxyFetch(`/api/user/borrowed-books${queryParams}`, {
      method: 'GET',
      headers: getAuthHeader(),
    });
    return handleResponse<BorrowedBook[]>(response);
  },
};

export const userApi = {
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await proxyFetch('/api/user/profile', {
      method: 'GET',
      headers: getAuthHeader(),
    });
    return handleResponse<User>(response);
  },

  updateProfile: async (updates: { email?: string; password?: string }): Promise<ApiResponse<User>> => {
    const response = await proxyFetch('/api/user/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(updates),
    });
    return handleResponse<User>(response);
  },
};
