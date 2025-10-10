import { useState, useEffect, ReactNode } from 'react';
import { Lock, AlertCircle } from 'lucide-react';

interface AdminGateProps {
  children: ReactNode;
}

export default function AdminGate({ children }: AdminGateProps) {
  const [token, setToken] = useState('');
  const [inputToken, setInputToken] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const savedToken = localStorage.getItem('admin-token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputToken.trim()) {
      setError('Please enter a passcode');
      return;
    }
    localStorage.setItem('admin-token', inputToken);
    setToken(inputToken);
    setError('');
  };

  if (token) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-maroon-900 via-maroon-800 to-maroon-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-r from-maroon-600 to-maroon-800 px-6 py-8 text-center">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-maroon-100 text-sm">Enter your passcode to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
              Admin Passcode
            </label>
            <input
              type="password"
              id="token"
              value={inputToken}
              onChange={(e) => {
                setInputToken(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none transition-all"
              placeholder="Enter passcode"
              required
            />
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-lg flex items-start gap-3 border border-red-200">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full px-4 py-3 bg-gradient-to-r from-maroon-600 to-maroon-800 text-white rounded-lg hover:from-maroon-700 hover:to-maroon-900 transition-all font-medium shadow-lg"
          >
            Access Admin Portal
          </button>
        </form>
      </div>
    </div>
  );
}
