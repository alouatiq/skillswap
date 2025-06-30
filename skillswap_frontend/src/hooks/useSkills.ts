import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
}

export interface Skill {
  id: number;
  mentor: {
    id: number;
    user: {
      username: string;
      first_name: string;
      last_name: string;
    };
    user_type: string;
    bio: string;
    average_rating: number;
    review_count: number;
  };
  category: number;
  category_name: string;
  title: string;
  description: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  duration_minutes: number;
  tags: string;
  created_at: string;
  updated_at: string;
}

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories/');
      return response.data;
    },
  });
};

export const useSkills = (category?: string, level?: string) => {
  return useQuery({
    queryKey: ['skills', category, level],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (level) params.append('level', level);
      
      const response = await api.get(`/skills/?${params.toString()}`);
      return response.data;
    },
  });
};

export const useMySkills = () => {
  return useQuery({
    queryKey: ['my-skills'],
    queryFn: async () => {
      const response = await api.get('/skills/my_skills/');
      return response.data;
    },
  });
};

export const useCreateSkill = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (skillData: Partial<Skill>) => {
      const response = await api.post('/skills/', skillData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      queryClient.invalidateQueries({ queryKey: ['my-skills'] });
    },
  });
};

export const useUpdateSkill = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...skillData }: Partial<Skill> & { id: number }) => {
      const response = await api.put(`/skills/${id}/`, skillData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      queryClient.invalidateQueries({ queryKey: ['my-skills'] });
    },
  });
};

export const useDeleteSkill = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/skills/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      queryClient.invalidateQueries({ queryKey: ['my-skills'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (categoryData: { id: number; name: string; description?: string; icon?: string }) => {
      const { id, ...data } = categoryData;
      const response = await api.put(`/categories/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (categoryData: { name: string; description?: string; icon?: string }) => {
      const response = await api.post('/categories/', categoryData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (categoryId: number) => {
      await api.delete(`/categories/${categoryId}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};
