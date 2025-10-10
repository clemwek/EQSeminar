import { useState } from 'react';
import { X, AlertCircle, CheckCircle, Upload } from 'lucide-react';
import { useCreateMemberMutation, useImportMembersMutation } from '../store/api';

interface AddMembersModalProps {
  onClose: () => void;
}

export default function AddMembersModal({ onClose }: AddMembersModalProps) {
  const [createMember, { isLoading }] = useCreateMemberMutation();
  const [importMembers] = useImportMembersMutation();
  const [mode, setMode] = useState<'single' | 'import'>('single');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    pfNumber: '',
    department: '',
    phoneNumber: '',
  });
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [importing, setImporting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    try {
      await createMember(formData).unwrap();
      setStatus({ type: 'success', message: 'Member added successfully!' });
      setFormData({
        firstName: '',
        lastName: '',
        pfNumber: '',
        department: '',
        phoneNumber: '',
      });
      setTimeout(() => {
        setStatus(null);
      }, 3000);
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to add member. Please try again.' });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setStatus(null);

    try {
      const result = await importMembers(file).unwrap();
      setStatus({
        type: 'success',
        message: result.message || 'Members imported successfully!',
      });

      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error: any) {
      setStatus({
        type: 'error',
        message: error?.data?.message || 'Failed to process file. Please check the format.'
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        <div className="bg-gradient-to-r from-maroon-600 to-maroon-800 px-6 py-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Add Members</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1.5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setMode('single')}
              className={`flex-1 px-6 py-3 font-medium transition-colors ${
                mode === 'single'
                  ? 'text-maroon-700 border-b-2 border-maroon-700 bg-maroon-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Add Single Member
            </button>
            <button
              onClick={() => setMode('import')}
              className={`flex-1 px-6 py-3 font-medium transition-colors ${
                mode === 'import'
                  ? 'text-maroon-700 border-b-2 border-maroon-700 bg-maroon-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Import from File
            </button>
          </div>
        </div>

        <div className="p-6">
          {mode === 'single' ? (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="pfNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    PF Number *
                  </label>
                  <input
                    type="text"
                    id="pfNumber"
                    value={formData.pfNumber}
                    onChange={(e) => setFormData({ ...formData, pfNumber: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              {status && (
                <div className={`mb-4 p-4 rounded-lg flex items-start gap-3 ${
                  status.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {status.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  )}
                  <span className="text-sm">{status.message}</span>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  disabled={isLoading}
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-maroon-600 to-maroon-800 text-white rounded-lg hover:from-maroon-700 hover:to-maroon-900 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {isLoading ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  Upload a CSV or Excel file with columns: firstName, lastName, pfNumber, department, phoneNumber
                </p>
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-maroon-500 hover:bg-maroon-50 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-12 h-12 text-gray-400 mb-3" />
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">CSV or XLSX files</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    disabled={importing}
                  />
                </label>
              </div>

              {status && (
                <div className={`mb-4 p-4 rounded-lg flex items-start gap-3 ${
                  status.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {status.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  )}
                  <span className="text-sm">{status.message}</span>
                </div>
              )}

              {importing && (
                <div className="text-center text-gray-600 mb-4">
                  Importing members...
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
