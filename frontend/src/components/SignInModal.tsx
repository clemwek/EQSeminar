import { useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { useSignInMutation } from '../store/api';

interface SignInModalProps {
  dayId: number;
  dayNumber: number;
  seminarId: string;
  onClose: () => void;
}

export default function SignInModal({ dayId, dayNumber, seminarId, onClose }: SignInModalProps) {
  const [pfNumber, setPfNumber] = useState('');
  const [signIn, { isLoading }] = useSignInMutation();
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    try {
      await signIn({ pfNumber, dayId, seminarId }).unwrap();
      setStatus({ type: 'success', message: 'Successfully signed in!' });
      setPfNumber('');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error: unknown) {
      const err = error as { message?: string; status?: number };
      if (err.status === 409) {
        setStatus({ type: 'error', message: 'You have already signed in for this day' });
      } else if (err.message === 'Member not found') {
        setStatus({ type: 'error', message: 'Member not found. Please check your PF number.' });
      } else {
        setStatus({ type: 'error', message: 'Failed to sign in. Please try again.' });
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-r from-maroon-600 to-maroon-800 px-6 py-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Sign In - Day {dayNumber}</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1.5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label htmlFor="pfNumber" className="block text-sm font-medium text-gray-700 mb-2">
              PF Number
            </label>
            <input
              type="text"
              id="pfNumber"
              value={pfNumber}
              onChange={(e) => setPfNumber(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none transition-all"
              placeholder="Enter your PF number"
              required
              disabled={isLoading || status?.type === 'success'}
            />
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
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || status?.type === 'success'}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-maroon-600 to-maroon-800 text-white rounded-lg hover:from-maroon-700 hover:to-maroon-900 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
