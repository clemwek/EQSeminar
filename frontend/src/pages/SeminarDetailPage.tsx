import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Clock, FileText, MessageSquare } from 'lucide-react';
import { useGetSeminarQuery } from '../store/api';
import SignInModal from '../components/SignInModal';
import TalkModal from '../components/TalkModal';

export default function SeminarDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: seminar, isLoading } = useGetSeminarQuery(id!);
  const [signInModal, setSignInModal] = useState<{ dayId: number; dayNumber: number } | null>(null);
  const [talkModal, setTalkModal] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-maroon-800">Loading seminar details...</div>
      </div>
    );
  }

  if (!seminar) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Seminar not found</h2>
          <Link to="/" className="text-maroon-700 hover:text-maroon-900">
            Back to seminars
          </Link>
        </div>
      </div>
    );
  }

  const getTalkStatus = (date: string | null) => {
    if (!date) return 'upcoming';
    const talkDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    talkDate.setHours(0, 0, 0, 0);

    if (talkDate < today) return 'past';
    if (talkDate.getTime() === today.getTime()) return 'current';
    return 'upcoming';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-maroon-700 hover:text-maroon-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to seminars
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{seminar.title}</h1>
            {seminar.description && (
              <p className="text-gray-600 mt-2">{seminar.description}</p>
            )}
            <div className="flex items-center gap-4 mt-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                seminar.status === 'ongoing'
                  ? 'bg-green-100 text-green-800'
                  : seminar.status === 'completed'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {seminar.status}
              </span>
              {seminar.start_date && (
                <span className="text-sm text-gray-600 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {new Date(seminar.start_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {Array.from({ length: seminar.numberOfDays || 0 }, (_, index) => {
            const dayNumber = index + 1;
            const dayDate = seminar.startDate || seminar.start_date ? new Date(new Date(seminar.startDate || seminar.start_date).getTime() + (dayNumber - 1) * 86400000) : null;
            const dayTalks = seminar.talks?.filter((talk: any) => talk.day === dayNumber) || [];
            return (
            <div key={dayNumber} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-maroon-600 to-maroon-800 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Day {dayNumber}</h2>
                  {dayDate && (
                    <p className="text-maroon-100 text-sm mt-1">
                      {dayDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setSignInModal({ dayId: dayNumber, dayNumber })}
                  className="px-5 py-2.5 bg-white text-maroon-700 font-medium rounded-lg hover:bg-maroon-50 transition-colors shadow-lg"
                >
                  Sign In
                </button>
              </div>

              <div className="p-6">
                {!dayTalks || dayTalks.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No talks scheduled for this day</p>
                ) : (
                  <div className="grid gap-4">
                    {dayTalks.map((talk: any) => {
                      const status = getTalkStatus(dayDate?.toISOString() || null);
                      return (
                        <button
                          key={talk.id}
                          onClick={() => setTalkModal(talk.id)}
                          className={`text-left p-5 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                            status === 'past'
                              ? 'border-gray-200 bg-gray-50'
                              : status === 'current'
                              ? 'border-maroon-300 bg-maroon-50 shadow-sm'
                              : 'border-gray-200 hover:border-maroon-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-gray-900 mb-2">{talk.title}</h3>
                              {talk.description && (
                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{talk.description}</p>
                              )}
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1.5">
                                  <User className="w-4 h-4" />
                                  <span>{talk.speaker}</span>
                                </div>
                                {(talk.start_time || talk.end_time) && (
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" />
                                    <span>
                                      {talk.start_time && new Date(`2000-01-01T${talk.start_time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                      {talk.start_time && talk.end_time && ' - '}
                                      {talk.end_time && new Date(`2000-01-01T${talk.end_time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                    </span>
                                  </div>
                                )}
                                {talk.presentation_link && (
                                  <div className="flex items-center gap-1.5 text-maroon-700">
                                    <FileText className="w-4 h-4" />
                                    <span>Presentation available</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <MessageSquare className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          </div>
                          {status === 'current' && (
                            <div className="mt-3 pt-3 border-t border-maroon-200">
                              <span className="text-xs font-medium text-maroon-700">HAPPENING NOW</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
          })}
        </div>
      </main>

      {signInModal && (
        <SignInModal
          dayId={signInModal.dayId}
          dayNumber={signInModal.dayNumber}
          seminarId={id!}
          onClose={() => setSignInModal(null)}
        />
      )}

      {talkModal && (
        <TalkModal
          talkId={talkModal}
          onClose={() => setTalkModal(null)}
        />
      )}
    </div>
  );
}
