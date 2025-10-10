import { useState } from 'react';
import { ArrowLeft, Plus, CreditCard as Edit2, Users, Download, Calendar } from 'lucide-react';
import { useGetSeminarQuery, useGetRegistrationsQuery } from '../store/api';
import AddTalkModal from './AddTalkModal';
import EditSeminarModal from './EditSeminarModal';
import EditTalkModal from './EditTalkModal';
import RegisterMemberModal from './RegisterMemberModal';
import AttendanceModal from './AttendanceModal';

interface SeminarDetailAdminProps {
  seminarId: string;
  onBack: () => void;
}

export default function SeminarDetailAdmin({ seminarId, onBack }: SeminarDetailAdminProps) {
  const { data: seminar } = useGetSeminarQuery(seminarId);
  const { data: registrations = [] } = useGetRegistrationsQuery(seminarId);
  const [showAddTalk, setShowAddTalk] = useState<{ dayNumber: number } | null>(null);
  const [showEditSeminar, setShowEditSeminar] = useState(false);
  const [showEditTalk, setShowEditTalk] = useState<string | null>(null);
  const [showRegisterMember, setShowRegisterMember] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);


  if (!seminar) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-maroon-800">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-medium text-maroon-700 hover:text-maroon-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to dashboard
          </button>
          <div className="flex items-start justify-between">
            <div className="flex-1">
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
                {seminar.startDate && (
                  <span className="text-sm text-gray-600 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {new Date(seminar.startDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowEditSeminar(true)}
              className="px-4 py-2 border-2 border-maroon-200 text-maroon-700 font-medium rounded-lg hover:bg-maroon-50 transition-colors flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Edit Seminar
            </button>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={() => setShowRegisterMember(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Register Members ({registrations.length})
            </button>
            <button
              onClick={() => setShowAttendance(true)}
              className="px-4 py-2 bg-white border-2 border-maroon-200 text-maroon-700 font-medium rounded-lg hover:bg-maroon-50 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              View Attendance
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {Array.from({ length: seminar.numberOfDays || 0 }, (_, index) => {
            const dayNumber = index + 1;
            const dayDate = seminar.startDate ? new Date(new Date(seminar.startDate).getTime() + (dayNumber - 1) * 86400000) : null;
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
                  onClick={() => setShowAddTalk({ dayNumber })}
                  className="px-4 py-2 bg-white text-maroon-700 font-medium rounded-lg hover:bg-maroon-50 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Talk
                </button>
              </div>

              <div className="p-6">
                {dayTalks.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No talks scheduled for this day</p>
                ) : (
                  <div className="grid gap-4">
                    {dayTalks.map((talk: any) => (
                      <div
                        key={talk.id}
                        className="p-5 rounded-xl border-2 border-gray-200 hover:border-maroon-200 transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{talk.title}</h3>
                            {talk.description && (
                              <p className="text-gray-600 text-sm mb-3">{talk.description}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                              <span>Speaker: {talk.speaker}</span>
                              {(talk.startTime || talk.endTime) && (
                                <span>
                                  Time: {talk.startTime && new Date(`2000-01-01T${talk.startTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                  {talk.startTime && talk.endTime && ' - '}
                                  {talk.endTime && new Date(`2000-01-01T${talk.endTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                </span>
                              )}
                              {talk.presentationLink && (
                                <a
                                  href={talk.presentationLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-maroon-700 hover:text-maroon-900 underline"
                                >
                                  View Presentation
                                </a>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => setShowEditTalk(talk.id)}
                            className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 flex-shrink-0"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
          })}
        </div>
      </main>

      {showAddTalk && (
        <AddTalkModal
          dayId=""
          dayNumber={showAddTalk.dayNumber}
          seminarId={seminarId}
          onClose={() => setShowAddTalk(null)}
        />
      )}

      {showEditSeminar && (
        <EditSeminarModal
          seminar={seminar}
          onClose={() => setShowEditSeminar(false)}
        />
      )}

      {showEditTalk && (
        <EditTalkModal
          talkId={showEditTalk}
          onClose={() => setShowEditTalk(null)}
        />
      )}

      {showRegisterMember && (
        <RegisterMemberModal
          seminarId={seminarId}
          onClose={() => setShowRegisterMember(false)}
        />
      )}

      {showAttendance && (
        <AttendanceModal
          seminarId={seminarId}
          seminarTitle={seminar.title}
          numberOfDays={seminar.numberOfDays}
          onClose={() => setShowAttendance(false)}
        />
      )}
    </div>
  );
}
