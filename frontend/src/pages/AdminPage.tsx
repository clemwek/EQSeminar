import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, Download, BookOpen, Calendar, LogOut } from 'lucide-react';
import { useGetSeminarsQuery, useGetMembersQuery } from '../store/api';
import AddSeminarModal from '../components/AddSeminarModal';
import AddMembersModal from '../components/AddMembersModal';
import SeminarDetailAdmin from '../components/SeminarDetailAdmin';

export default function AdminPage() {
  const { data: seminars = [] } = useGetSeminarsQuery();
  const { data: members = [] } = useGetMembersQuery();
  const [showAddSeminar, setShowAddSeminar] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [selectedSeminar, setSelectedSeminar] = useState<string | null>(null);

  const handleLogout = () => {
    localStorage.removeItem('admin-token');
    window.location.reload();
  };

  const handleExportAttendance = async () => {
    try {
      const response = await fetch('http://127.0.0.1:4000/api/attendance/export', {
        headers: {
          'x-admin-token': localStorage.getItem('admin-token') || '',
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export attendance:', error);
    }
  };

  if (selectedSeminar) {
    return (
      <SeminarDetailAdmin
        seminarId={selectedSeminar}
        onBack={() => setSelectedSeminar(null)}
      />
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
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600 mt-0.5">Manage seminars, members, and attendance</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                Public View
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-red-700 hover:text-red-900 hover:bg-red-50 rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setShowAddSeminar(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Seminar
            </button>
            <button
              onClick={() => setShowAddMembers(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Add Members
            </button>
            <button
              onClick={handleExportAttendance}
              className="px-4 py-2 bg-white border-2 border-maroon-200 text-maroon-700 font-medium rounded-lg hover:bg-maroon-50 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Attendance
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-maroon-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-maroon-700" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Seminars</p>
                <p className="text-3xl font-bold text-gray-900">{seminars.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Members</p>
                <p className="text-3xl font-bold text-gray-900">{members.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Seminars</p>
                <p className="text-3xl font-bold text-gray-900">{seminars.filter(s => s.status === 'ongoing').length}</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Seminars</h2>
          {seminars.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No seminars yet</h3>
              <p className="text-gray-600 mb-6">Get started by creating your first seminar</p>
              <button
                onClick={() => setShowAddSeminar(true)}
                className="btn btn-primary inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Seminar
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {seminars.map((seminar) => (
                <button
                  key={seminar.id}
                  onClick={() => setSelectedSeminar(seminar.id)}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-maroon-200 text-left"
                >
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                      {seminar.title}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-3 ${
                      seminar.status === 'ongoing'
                        ? 'bg-green-100 text-green-800'
                        : seminar.status === 'completed'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {seminar.status}
                    </span>
                    {seminar.description && (
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">
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
                  <div className="h-1 bg-gradient-to-r from-maroon-600 to-maroon-800" />
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      {showAddSeminar && (
        <AddSeminarModal onClose={() => setShowAddSeminar(false)} />
      )}

      {showAddMembers && (
        <AddMembersModal onClose={() => setShowAddMembers(false)} />
      )}
    </div>
  );
}
