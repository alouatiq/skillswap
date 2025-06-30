import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Review {
  id: number;
  session: number;
  reviewer: {
    id: number;
    user: {
      username: string;
      first_name: string;
      last_name: string;
    };
  };
  reviewed: {
    id: number;
    user: {
      username: string;
      first_name: string;
      last_name: string;
    };
  };
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface CreateReviewData {
  session_id: number;
  reviewed_id: number;
  rating: number;
  comment: string;
}

export const useReviews = () => {
  return useQuery({
    queryKey: ['reviews'],
    queryFn: async () => {
      const response = await api.get('/reviews/');
      return response.data;
    },
  });
};

export const useUserReviews = (userId: number) => {
  return useQuery({
    queryKey: ['reviews', 'user', userId],
    queryFn: async () => {
      const response = await api.get(`/reviews/for_user/?user_id=${userId}`);
      return response.data;
    },
    enabled: !!userId,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reviewData: CreateReviewData) => {
      const response = await api.post('/reviews/', reviewData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};

export const useSessionReviews = (sessionId: number) => {
  return useQuery({
    queryKey: ['reviews', 'session', sessionId],
    queryFn: async () => {
      const response = await api.get(`/reviews/?session=${sessionId}`);
      return response.data;
    },
    enabled: !!sessionId,
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...reviewData }: Partial<Review> & { id: number }) => {
      const response = await api.put(`/reviews/${id}/`, reviewData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/reviews/${id}/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};
