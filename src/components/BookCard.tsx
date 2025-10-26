import { BookOpen, User as UserIcon, Calendar, Package } from 'lucide-react';
import { Book } from '../types';

interface BookCardProps {
  book: Book;
  onBorrow?: (bookId: number) => void;
  onEdit?: (book: Book) => void;
  onDelete?: (bookId: number) => void;
  showActions?: boolean;
  isAdmin?: boolean;
}

export const BookCard = ({ book, onBorrow, onEdit, onDelete, showActions = true, isAdmin = false }: BookCardProps) => {
  const isAvailable = book.availableCopies > 0;

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className="h-48 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <BookOpen className="text-white opacity-20 group-hover:opacity-30 transition-opacity" size={80} />
        </div>
        <div className="absolute top-3 right-3">
          {isAvailable ? (
            <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              Available
            </span>
          ) : (
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              Out of Stock
            </span>
          )}
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {book.title}
        </h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600 text-sm">
            <UserIcon size={14} className="mr-2 flex-shrink-0" />
            <span className="line-clamp-1">{book.author}</span>
          </div>

          <div className="flex items-center text-gray-600 text-sm">
            <Calendar size={14} className="mr-2 flex-shrink-0" />
            <span>{book.publishedYear}</span>
          </div>

          {book.genre && (
            <div className="inline-block bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full">
              {book.genre}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center">
            <Package size={14} className="mr-1" />
            <span>{book.availableCopies} / {book.totalCopies}</span>
          </div>
          <span className="text-xs">ISBN: {book.isbn}</span>
        </div>

        {showActions && (
          <div className="space-y-2">
            {isAdmin ? (
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit?.(book)}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete?.(book.id)}
                  className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors font-semibold"
                >
                  Delete
                </button>
              </div>
            ) : (
              <button
                onClick={() => onBorrow?.(book.id)}
                disabled={!isAvailable}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-2 rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md hover:shadow-lg"
              >
                {isAvailable ? 'Borrow Book' : 'Not Available'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
