import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface SessionMessage {
  id: number;
  session: number;
  sender: {
    id: number;
    user: {
      username: string;
      first_name: string;
      last_name: string;
    };
  };
  sender_name: string;
  message: string;
  created_at: string;
}

export const useSessionMessages = (sessionId: number) => {
  return useQuery({
    queryKey: ['session-messages', sessionId],
    queryFn: async () => {
      const response = await api.get(`/sessions/${sessionId}/messages/`);
      return response.data;
    },
    enabled: !!sessionId,
    refetchInterval: 5000,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ sessionId, message }: { sessionId: number; message: string }) => {
      const response = await api.post(`/sessions/${sessionId}/messages/`, { message });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['session-messages', variables.sessionId] });
    },
  });
};
