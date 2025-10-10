import { useState } from 'react';
import { X, Search, CheckCircle, UserPlus, Users } from 'lucide-react';
import { useGetMembersQuery, useRegisterMemberMutation, useGetRegistrationsQuery } from '../store/api';

interface RegisterMemberModalProps {
  seminarId: string;
  registrations: Array<{ member_id: string }>;
  onClose: () => void;
}

type Tab = 'available' | 'registered';

export default function RegisterMemberModal({ seminarId, onClose }: Omit<RegisterMemberModalProps, 'registrations'>) {
  const { data: members = [], isLoading: membersLoading, error: membersError } = useGetMembersQuery();
  const { data: registrations = [], isLoading: registrationsLoading } = useGetRegistrationsQuery(seminarId);
  const [registerMember, { isLoading }] = useRegisterMemberMutation();
  const [search, setSearch] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('available');

  const registeredIds = new Set(registrations.map((r: any) => r.member_id));

  const availableMembers = members;

  const registeredMembers = registrations;

  const filteredMembers = activeTab === 'available' ? availableMembers : registeredMembers;
  const isLoadingData = membersLoading || registrationsLoading;

  const handleRegister = async (memberId: string) => {
    try {
      await registerMember({ seminarId, memberId }).unwrap();
      setSuccess(memberId);
      setTimeout(() => setSuccess(null), 2000);
    } catch (error) {
      console.error('Failed to register member:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-maroon-600 to-maroon-800 px-6 py-5 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-bold text-white">Register Members</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1.5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pt-4 pb-2 flex-shrink-0 border-b border-gray-200">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('available')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'available'
                  ? 'bg-maroon-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Available ({availableMembers.length})
            </button>
            <button
              onClick={() => setActiveTab('registered')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'registered'
                  ? 'bg-maroon-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users className="w-4 h-4" />
              Registered ({registeredMembers.length})
            </button>
          </div>
        </div>

        <div className="p-6 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search members by name or PF number..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {isLoadingData ? (
            <div className="text-center py-12 text-gray-500">Loading members...</div>
          ) : membersError ? (
            <div className="text-center py-12 text-red-600">Failed to load members. Please try again.</div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {search ? 'No members found matching your search' :
                activeTab === 'available' ? 'All members are already registered' : 'No registered members yet'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      PF: {member.pfNumber}
                      {member.department && ` | ${member.department}`}
                    </p>
                  </div>
                  {activeTab === 'available' && (
                    <>
                      {success === member.id ? (
                        <div className="flex items-center gap-2 text-green-700 flex-shrink-0">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">Registered</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRegister(member.id)}
                          disabled={isLoading}
                          className="px-4 py-2 bg-gradient-to-r from-maroon-600 to-maroon-800 text-white rounded-lg hover:from-maroon-700 hover:to-maroon-900 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm flex-shrink-0"
                        >
                          Register
                        </button>
                      )}
                    </>
                  )}
                  {activeTab === 'registered' && (
                    <div className="flex items-center gap-2 text-green-700 flex-shrink-0">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Registered</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
