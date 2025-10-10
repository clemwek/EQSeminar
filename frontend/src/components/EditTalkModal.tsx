import { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Upload } from 'lucide-react';
import { useUpdateTalkMutation } from '../store/api';
import { apiClient } from '../lib/api-client';

interface EditTalkModalProps {
  talkId: string;
  onClose: () => void;
}

export default function EditTalkModal({ talkId, onClose }: EditTalkModalProps) {
  const [updateTalk, { isLoading }] = useUpdateTalkMutation();
  const [talk, setTalk] = useState<{
    title: string;
    description: string;
    speaker: string;
    startTime: string;
    endTime: string;
    presentationLink: string;
  } | null>(null);
  const [presentationFile, setPresentationFile] = useState<File | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const fetchTalk = async () => {
      try {
        const data = await apiClient.talks.get(talkId);
        if (data) {
          setTalk({
            title: data.title,
            description: data.description || '',
            speaker: data.speaker,
            startTime: data.startTime || '',
            endTime: data.endTime || '',
            presentationLink: data.presentationLink || '',
          });
        }
      } catch (error) {
        console.error('Failed to fetch talk:', error);
      }
    };

    fetchTalk();
  }, [talkId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!talk) return;
    setStatus(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', talk.title);
      formDataToSend.append('description', talk.description);
      formDataToSend.append('speaker', talk.speaker);
      formDataToSend.append('timeSlot', `${talk.startTime} - ${talk.endTime}`);
      if (presentationFile) {
        formDataToSend.append('presentation', presentationFile);
      }

      await updateTalk({ id: talkId, formData: formDataToSend }).unwrap();
      setStatus({ type: 'success', message: 'Talk updated successfully!' });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to update talk. Please try again.' });
    }
  };

  if (!talk) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-8">
          <div className="text-maroon-800">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        <div className="bg-gradient-to-r from-maroon-600 to-maroon-800 px-6 py-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Edit Talk</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1.5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4 mb-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={talk.title}
                onChange={(e) => setTalk({ ...talk, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={talk.description}
                onChange={(e) => setTalk({ ...talk, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none transition-all resize-none"
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="speaker" className="block text-sm font-medium text-gray-700 mb-2">
                Speaker *
              </label>
              <input
                type="text"
                id="speaker"
                value={talk.speaker}
                onChange={(e) => setTalk({ ...talk, speaker: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  id="startTime"
                  value={talk.startTime}
                  onChange={(e) => setTalk({ ...talk, startTime: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  id="endTime"
                  value={talk.endTime}
                  onChange={(e) => setTalk({ ...talk, endTime: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Presentation
              </label>
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="presentationFile"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-maroon-500 transition-all cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    <Upload className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-600">
                      {presentationFile ? presentationFile.name : 'Upload presentation file'}
                    </span>
                  </label>
                  <input
                    type="file"
                    id="presentationFile"
                    accept=".pdf,.ppt,.pptx,.key"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setPresentationFile(file);
                        setTalk({ ...talk, presentationLink: '' });
                      }
                    }}
                    className="hidden"
                  />
                </div>
                {presentationFile && (
                  <button
                    type="button"
                    onClick={() => setPresentationFile(null)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove file
                  </button>
                )}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-2 text-gray-500">OR</span>
                  </div>
                </div>
                <input
                  type="url"
                  id="presentationLink"
                  value={talk.presentationLink}
                  onChange={(e) => {
                    setTalk({ ...talk, presentationLink: e.target.value });
                    if (e.target.value) {
                      setPresentationFile(null);
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none transition-all"
                  placeholder="Or paste a link (https://...)"
                  disabled={!!presentationFile}
                />
              </div>
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
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || status?.type === 'success'}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-maroon-600 to-maroon-800 text-white rounded-lg hover:from-maroon-700 hover:to-maroon-900 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? 'Updating...' : 'Update Talk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
