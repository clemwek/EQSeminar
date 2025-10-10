import { Link } from 'react-router-dom';
import { BookOpen, Calendar, ArrowRight } from 'lucide-react';
import { useGetSeminarsQuery } from '../store/api';

export default function SeminarsPage() {
  const { data: seminars = [], isLoading } = useGetSeminarsQuery();

  console.log("List seminars: ", seminars);
  

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-maroon-800">Loading seminars...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-maroon-600 to-maroon-800 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Seminars</h1>
                <p className="text-sm text-gray-600 mt-0.5">Browse and attend upcoming seminars</p>
              </div>
            </div>
            <Link
              to="/admin"
              className="px-4 py-2 text-sm font-medium text-maroon-700 hover:text-maroon-900 hover:bg-maroon-50 rounded-lg transition-all duration-200"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {seminars.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No seminars yet</h2>
            <p className="text-gray-600">Check back later for upcoming seminars</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {seminars.map((seminar) => (
              <Link
                key={seminar.id}
                to={`/seminars/${seminar.id}`}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-maroon-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900 group-hover:text-maroon-700 transition-colors line-clamp-2 mb-2">
                        {seminar.title}
                      </h2>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        seminar.status === 'ongoing'
                          ? 'bg-green-100 text-green-800'
                          : seminar.status === 'completed'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {seminar.status}
                      </span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-maroon-600 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
                  </div>

                  {seminar.description && (
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {seminar.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-500 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>{seminar.numberOfDays} days</span>
                    </div>
                    {seminar.days && (
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4" />
                        <span>{seminar.days.reduce((acc, day) => acc + (day.talks?.length || 0), 0)} talks</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="h-1 bg-gradient-to-r from-maroon-600 to-maroon-800 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
