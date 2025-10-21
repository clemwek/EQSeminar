import { useMemo } from 'react';
import { X, Download, CheckCircle, XCircle } from 'lucide-react';
import { useGetAttendanceQuery, useGetRegistrationsQuery } from '../store/api';

interface AttendanceModalProps {
  seminarId: string;
  seminarTitle: string;
  numberOfDays: number;
  onClose: () => void;
}

interface MemberAttendance {
  memberId: number;
  firstName: string;
  lastName: string;
  pfNumber: string;
  department: string;
  phoneNumber: string;
  attendance: { [dayNumber: number]: boolean };
}

export default function AttendanceModal({ seminarId, seminarTitle, numberOfDays, onClose }: AttendanceModalProps) {
  const { data: rawAttendanceData = [], isLoading: attendanceLoading } = useGetAttendanceQuery(seminarId);
  const { data: registrations = [], isLoading: registrationsLoading } = useGetRegistrationsQuery(seminarId);

  const isLoading = attendanceLoading || registrationsLoading;

  const attendanceData: MemberAttendance[] = useMemo(() => {
    const memberMap = new Map<number, MemberAttendance>();

    registrations.forEach((reg: any) => {
      const member = reg.member;
      if (member && !memberMap.has(member.id)) {
        memberMap.set(member.id, {
          memberId: member.id,
          firstName: member.firstName,
          lastName: member.lastName,
          pfNumber: member.pfNumber,
          department: member.department || '',
          phoneNumber: member.phoneNumber || '',
          attendance: {},
        });
      }
    });

    (rawAttendanceData as any[]).forEach((record: any) => {
      const memberId = record.memberId;
      const day = record.day;

      if (!memberMap.has(memberId) && record.member) {
        memberMap.set(memberId, {
          memberId: record.member.id,
          firstName: record.member.firstName,
          lastName: record.member.lastName,
          pfNumber: record.member.pfNumber,
          department: record.member.department || '',
          phoneNumber: record.member.phoneNumber || '',
          attendance: {},
        });
      }

      const memberData = memberMap.get(memberId);
      if (memberData) {
        memberData.attendance[day] = true;
      }
    });

    return Array.from(memberMap.values()).sort((a, b) =>
      a.pfNumber.localeCompare(b.pfNumber)
    );
  }, [rawAttendanceData, registrations]);

  const handleExport = async () => {
    try {
      const response = await fetch(`http://3.94.106.122:4000/api/attendance/export?seminarId=${seminarId}`, {
        headers: {
          'x-admin-token': localStorage.getItem('admin-token') || '',
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${seminarTitle}_attendance_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export attendance:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-maroon-600 to-maroon-800 px-6 py-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Attendance Report - {seminarTitle}</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-white text-maroon-700 font-medium rounded-lg hover:bg-maroon-50 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </button>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1.5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-600">Loading attendance data...</div>
            </div>
          ) : attendanceData.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-600">No registered members found</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10">PF Number</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">First Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Last Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Department</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                    {Array.from({ length: numberOfDays }, (_, i) => (
                      <th key={i + 1} className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-l border-gray-200">
                        Day {i + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.map((record) => (
                    <tr key={record.memberId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white group-hover:bg-gray-50">{record.pfNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{record.firstName}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{record.lastName}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{record.department || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{record.phoneNumber || '-'}</td>
                      {Array.from({ length: numberOfDays }, (_, i) => {
                        const dayNumber = i + 1;
                        const attended = record.attendance[dayNumber] || false;
                        return (
                          <td key={dayNumber} className="px-4 py-3 text-center border-l border-gray-100">
                            {attended ? (
                              <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                            ) : (
                              <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>Total Members: {attendanceData.length}</div>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
