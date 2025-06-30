import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Session {
  id: number;
  skill: {
    id: number;
    title: string;
    description: string;
    category_name: string;
  };
  learner: {
    id: number;
    user: {
      username: string;
      first_name: string;
      last_name: string;
    };
  };
  mentor: {
    id: number;
    user: {
      username: string;
      first_name: string;
      last_name: string;
    };
  };
  scheduled_datetime: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
  learner_message: string;
  mentor_response: string;
  created_at: string;
  updated_at: string;
}

export interface LearningSession extends Session {}

export const useSessions = () => {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const response = await api.get('/sessions/');
      return response.data;
    },
  });
};

export const useSessionsAsLearner = () => {
  return useQuery({
    queryKey: ['sessions-learner'],
    queryFn: async () => {
      const response = await api.get('/sessions/as_learner/');
      return response.data;
    },
  });
};

export const useSessionsAsMentor = () => {
  return useQuery({
    queryKey: ['sessions-mentor'],
    queryFn: async () => {
      const response = await api.get('/sessions/as_mentor/');
      return response.data;
    },
  });
};

export const useCreateSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (sessionData: {
      skill_id: number;
      scheduled_datetime: string;
      learner_message?: string;
    }) => {
      const response = await api.post('/sessions/', sessionData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['sessions-learner'] });
    },
  });
};

export const useApproveSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ sessionId, mentorResponse }: { sessionId: number; mentorResponse?: string }) => {
      const response = await api.post(`/sessions/${sessionId}/approve/`, { 
        mentor_response: mentorResponse 
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['sessions-mentor'] });
    },
  });
};

export const useRejectSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ sessionId, mentorResponse }: { sessionId: number; mentorResponse?: string }) => {
      const response = await api.post(`/sessions/${sessionId}/reject/`, { 
        mentor_response: mentorResponse 
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['sessions-mentor'] });
    },
  });
};

export const useEditSessionTime = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ sessionId, scheduledDatetime }: { sessionId: number; scheduledDatetime: string }) => {
      const response = await api.post(`/sessions/${sessionId}/edit_time/`, {
        scheduled_datetime: scheduledDatetime,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};

export const useCompleteSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (sessionId: number) => {
      const response = await api.post(`/sessions/${sessionId}/complete/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};
