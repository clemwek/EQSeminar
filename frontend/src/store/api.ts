import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = 'http://127.0.0.1:4000';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('admin-token');
      if (token) {
        headers.set('x-admin-token', token);
      }
      return headers;
    },
  }),
  tagTypes: ['Seminars', 'Talks', 'Members', 'Comments', 'Attendance', 'Registrations'],
  endpoints: (builder) => ({
    getSeminars: builder.query({
      query: () => '/api/seminars',
      providesTags: ['Seminars'],
    }),

    getSeminar: builder.query({
      query: (id: string) => `/api/seminars/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Seminars', id }],
    }),

    createSeminar: builder.mutation({
      query: (seminar: { title: string; description?: string; numberOfDays: number; status?: string }) => ({
        url: '/api/seminars',
        method: 'POST',
        body: seminar,
      }),
      invalidatesTags: ['Seminars'],
    }),

    updateSeminar: builder.mutation({
      query: ({ id, ...updates }: { id: string; title?: string; description?: string; status?: string }) => ({
        url: `/api/seminars/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Seminars', id }, 'Seminars'],
    }),

    createTalk: builder.mutation({
      query: ({ formData }: { formData: FormData }) => ({
        url: '/api/talks',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Seminars', 'Talks'],
    }),

    updateTalk: builder.mutation({
      query: ({ id, formData }: { id: string; formData: FormData }) => ({
        url: `/api/talks/${id}`,
        method: 'PATCH',
        body: formData,
      }),
      invalidatesTags: ['Seminars', 'Talks'],
    }),

    getComments: builder.query({
      query: (talkId: string) => `/api/talks/${talkId}/comments`,
      providesTags: (_result, _error, talkId) => [{ type: 'Comments', id: talkId }],
    }),

    createComment: builder.mutation({
      query: ({ talkId, content, memberId, commentId }: { talkId: string; content: string; memberId?: string; commentId?: string }) => ({
        url: `/api/talks/${talkId}/comments`,
        method: 'POST',
        body: { content, memberId, commentId },
      }),
      invalidatesTags: (_result, _error, { talkId }) => [{ type: 'Comments', id: talkId }],
    }),

    getMembers: builder.query({
      query: () => '/api/members',
      providesTags: ['Members'],
    }),

    createMember: builder.mutation({
      query: (member: { firstName: string; lastName: string; pfNumber: string; department?: string; phoneNumber?: string }) => ({
        url: '/api/members',
        method: 'POST',
        body: member,
      }),
      invalidatesTags: ['Members'],
    }),

    importMembers: builder.mutation({
      query: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: '/api/members/import',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Members'],
    }),

    signIn: builder.mutation({
      query: ({ pfNumber, dayId, seminarId }: { pfNumber: string; dayId: string; seminarId: string }) => ({
        url: '/api/attendance/sign-in',
        method: 'POST',
        body: { pfNumber, dayId, seminarId },
      }),
      invalidatesTags: ['Attendance'],
    }),

    getRegistrations: builder.query({
      query: (seminarId: string) => `/api/seminars/${seminarId}/register`,
      providesTags: (_result, _error, seminarId) => [{ type: 'Registrations', id: seminarId }],
    }),

    registerMember: builder.mutation({
      query: ({ seminarId, memberId }: { seminarId: string; memberId: string }) => ({
        url: `/api/seminars/${seminarId}/register`,
        method: 'POST',
        body: { memberId },
      }),
      invalidatesTags: (_result, _error, { seminarId }) => [{ type: 'Registrations', id: seminarId }],
    }),

    getAttendance: builder.query({
      query: (seminarId: string) => `/api/attendance?seminarId=${seminarId}`,
      providesTags: (_result, _error, seminarId) => [{ type: 'Attendance', id: seminarId }],
    }),

    exportAttendance: builder.query({
      query: (seminarId?: string) => {
        const params = seminarId ? `?seminarId=${seminarId}` : '';
        return `/api/attendance/export${params}`;
      },
      providesTags: ['Attendance'],
    }),
  }),
});

export const {
  useGetSeminarsQuery,
  useGetSeminarQuery,
  useCreateSeminarMutation,
  useUpdateSeminarMutation,
  useCreateTalkMutation,
  useUpdateTalkMutation,
  useGetCommentsQuery,
  useCreateCommentMutation,
  useGetMembersQuery,
  useCreateMemberMutation,
  useImportMembersMutation,
  useSignInMutation,
  useGetRegistrationsQuery,
  useRegisterMemberMutation,
  useGetAttendanceQuery,
  useExportAttendanceQuery,
} = api;
