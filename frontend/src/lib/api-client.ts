const API_BASE_URL = 'http://127.0.0.1:4000';

function getAdminToken(): string | null {
  return localStorage.getItem('admin-token');
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = getAdminToken();
  const headers: HeadersInit = {
    ...options.headers,
  };

  if (token) {
    headers['x-admin-token'] = token;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw { status: response.status, message: error.message || 'Request failed' };
  }

  return response.json();
}

export const apiClient = {
  health: {
    check: () => fetchAPI('/health'),
  },

  seminars: {
    list: () => fetchAPI('/api/seminars'),
    get: (id: string) => fetchAPI(`/api/seminars/${id}`),
    create: (data: { title: string; description?: string; numberOfDays: number; status?: string }) =>
      fetchAPI('/api/seminars', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: { title?: string; description?: string; status?: string }) =>
      fetchAPI(`/api/seminars/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    getRegistrations: (id: string) => fetchAPI(`/api/seminars/${id}/register`),
    registerMember: (id: string, memberId: string) =>
      fetchAPI(`/api/seminars/${id}/register`, {
        method: 'POST',
        body: JSON.stringify({ memberId }),
      }),
  },

  talks: {
    get: (id: string) => fetchAPI(`/api/talks/${id}`),
    create: (data: FormData) =>
      fetchAPI('/api/talks', {
        method: 'POST',
        body: data,
      }),
    update: (id: string, data: FormData) =>
      fetchAPI(`/api/talks/${id}`, {
        method: 'PATCH',
        body: data,
      }),
    getComments: (id: string) => fetchAPI(`/api/talks/${id}/comments`),
    addComment: (id: string, data: { content: string; memberId?: string; commentId?: string }) =>
      fetchAPI(`/api/talks/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  members: {
    list: () => fetchAPI('/api/members'),
    create: (data: { firstName: string; lastName: string; pfNumber: string; department?: string; phoneNumber?: string }) =>
      fetchAPI('/api/members', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    import: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return fetchAPI('/api/members/import', {
        method: 'POST',
        body: formData,
      });
    },
  },

  attendance: {
    signIn: (data: { pfNumber: string; dayId: string; seminarId: string }) =>
      fetchAPI('/api/attendance/sign-in', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    export: (seminarId?: string) => {
      const url = seminarId ? `/api/attendance/export?seminarId=${seminarId}` : '/api/attendance/export';
      return fetch(`${API_BASE_URL}${url}`, {
        headers: {
          'x-admin-token': getAdminToken() || '',
        },
      });
    },
  },
};
