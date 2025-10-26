import { BookOpen, Calendar, Clock, CheckCircle } from 'lucide-react';
import { BorrowedBook } from '../types';

interface BorrowedBookCardProps {
  book: BorrowedBook;
  onReturn: (bookId: number) => void;
}

export const BorrowedBookCard = ({ book, onReturn }: BorrowedBookCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysRemaining = () => {
    const due = new Date(book.dueDate);
    const now = new Date();
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getStatusColor = () => {
    if (book.status === 'RETURNED') return 'bg-gray-100 text-gray-700';
    if (book.status === 'OVERDUE') return 'bg-red-100 text-red-700';
    const daysRemaining = getDaysRemaining();
    if (daysRemaining <= 3) return 'bg-orange-100 text-orange-700';
    return 'bg-green-100 text-green-700';
  };

  const getStatusText = () => {
    if (book.status === 'RETURNED') return 'Returned';
    if (book.status === 'OVERDUE') return 'Overdue';
    const daysRemaining = getDaysRemaining();
    if (daysRemaining === 0) return 'Due Today';
    if (daysRemaining < 0) return 'Overdue';
    return `${daysRemaining} days left`;
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="flex">
        <div className="w-32 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 flex items-center justify-center flex-shrink-0">
          <BookOpen className="text-white opacity-30" size={48} />
        </div>

        <div className="flex-1 p-5">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">{book.title}</h3>
              <p className="text-sm text-gray-600">{book.author}</p>
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar size={14} className="mr-2" />
              <span>Borrowed: {formatDate(book.borrowedDate)}</span>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <Clock size={14} className="mr-2" />
              <span>Due: {formatDate(book.dueDate)}</span>
            </div>

            {book.returnDate && (
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle size={14} className="mr-2" />
                <span>Returned: {formatDate(book.returnDate)}</span>
              </div>
            )}
          </div>

          {book.status === 'ACTIVE' && (
            <button
              onClick={() => onReturn(book.id)}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-semibold shadow-md hover:shadow-lg"
            >
              Return Book
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
