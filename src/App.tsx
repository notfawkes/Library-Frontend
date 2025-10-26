import { useState, useEffect } from 'react';
import { Search, Plus, BookMarked, Library, Filter, X } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { BookCard } from './components/BookCard';
import { BookModal } from './components/BookModal';
import { BorrowedBookCard } from './components/BorrowedBookCard';
import { booksApi, borrowApi } from './services/api';
import { Book, BorrowedBook } from './types';

type ViewMode = 'browse' | 'borrowed' | 'profile';

function AppContent() {
  const { user, isAdmin } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | undefined>(undefined);
  const [viewMode, setViewMode] = useState<ViewMode>('browse');

  const [books, setBooks] = useState<Book[]>([]);
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await booksApi.getAll({
        page: currentPage,
        size: 12,
        search: searchQuery || undefined,
        genre: genreFilter || undefined,
      });
      if (response.success) {
        setBooks(response.data.content);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      showNotification('error', 'Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const fetchBorrowedBooks = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await borrowApi.getBorrowedBooks();
      if (response.success) {
        setBorrowedBooks(response.data);
      }
    } catch (error) {
      showNotification('error', 'Failed to load borrowed books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'browse') {
      fetchBooks();
    } else if (viewMode === 'borrowed' && user) {
      fetchBorrowedBooks();
    }
  }, [viewMode, currentPage, user]);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, genreFilter]);

  useEffect(() => {
    if (viewMode === 'browse') {
      fetchBooks();
    }
  }, [searchQuery, genreFilter, currentPage]);

  const handleBorrow = async (bookId: number) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    try {
      const response = await borrowApi.borrowBook(bookId);
      if (response.success) {
        showNotification('success', 'Book borrowed successfully!');
        fetchBooks();
      } else {
        showNotification('error', response.message);
      }
    } catch (error) {
      showNotification('error', 'Failed to borrow book');
    }
  };

  const handleReturn = async (bookId: number) => {
    try {
      const response = await borrowApi.returnBook(bookId);
      if (response.success) {
        showNotification('success', 'Book returned successfully!');
        fetchBorrowedBooks();
        if (viewMode === 'browse') fetchBooks();
      } else {
        showNotification('error', response.message);
      }
    } catch (error) {
      showNotification('error', 'Failed to return book');
    }
  };

  const handleSaveBook = async (bookData: Omit<Book, 'id' | 'availableCopies'>) => {
    try {
      if (editingBook) {
        const response = await booksApi.update(editingBook.id, bookData);
        if (response.success) {
          showNotification('success', 'Book updated successfully!');
          fetchBooks();
        } else {
          showNotification('error', response.message);
        }
      } else {
        const response = await booksApi.create(bookData);
        if (response.success) {
          showNotification('success', 'Book added successfully!');
          fetchBooks();
        } else {
          showNotification('error', response.message);
        }
      }
    } catch (error) {
      showNotification('error', 'Failed to save book');
    }
  };

  const handleDeleteBook = async (bookId: number) => {
    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
      const response = await booksApi.delete(bookId);
      if (response.success) {
        showNotification('success', 'Book deleted successfully!');
        fetchBooks();
      } else {
        showNotification('error', response.message);
      }
    } catch (error) {
      showNotification('error', 'Failed to delete book');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onAuthClick={() => setAuthModalOpen(true)}
        onProfileClick={() => setViewMode('profile')}
      />

      {notification && (
        <div className="fixed top-20 right-4 z-50 animate-slide-in">
          <div
            className={`${
              notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2`}
          >
            <span>{notification.message}</span>
            <button onClick={() => setNotification(null)}>
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('browse')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                viewMode === 'browse'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Library size={20} />
              <span>Browse</span>
            </button>
            {user && (
              <button
                onClick={() => setViewMode('borrowed')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  viewMode === 'borrowed'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <BookMarked size={20} />
                <span>My Books</span>
              </button>
            )}
          </div>

          {isAdmin && viewMode === 'browse' && (
            <button
              onClick={() => {
                setEditingBook(undefined);
                setBookModalOpen(true);
              }}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl font-semibold"
            >
              <Plus size={20} />
              <span>Add Book</span>
            </button>
          )}
        </div>

        {viewMode === 'browse' && (
          <>
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by title or author..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Filter by genre..."
                    value={genreFilter}
                    onChange={(e) => setGenreFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
              </div>
            ) : books.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {books.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      onBorrow={handleBorrow}
                      onEdit={(book) => {
                        setEditingBook(book);
                        setBookModalOpen(true);
                      }}
                      onDelete={handleDeleteBook}
                      isAdmin={isAdmin}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center space-x-2">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          currentPage === i
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <Library className="mx-auto text-gray-400 mb-4" size={64} />
                <p className="text-gray-500 text-lg">No books found</p>
              </div>
            )}
          </>
        )}

        {viewMode === 'borrowed' && (
          <>
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
              </div>
            ) : borrowedBooks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {borrowedBooks.map((book) => (
                  <BorrowedBookCard key={book.id} book={book} onReturn={handleReturn} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <BookMarked className="mx-auto text-gray-400 mb-4" size={64} />
                <p className="text-gray-500 text-lg">You haven't borrowed any books yet</p>
              </div>
            )}
          </>
        )}

        {viewMode === 'profile' && user && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <p className="text-lg text-gray-900">{user.username}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-lg text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      user.role === 'ADMIN'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <BookModal
        isOpen={bookModalOpen}
        onClose={() => {
          setBookModalOpen(false);
          setEditingBook(undefined);
        }}
        onSave={handleSaveBook}
        book={editingBook}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
