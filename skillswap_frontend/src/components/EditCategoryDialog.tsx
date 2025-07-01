import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { useUpdateCategory, useCreateCategory } from '@/hooks/useSkills';

interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
}

interface EditCategoryDialogProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
  isCreating?: boolean;
}

export default function EditCategoryDialog({ category, isOpen, onClose, isCreating = false }: EditCategoryDialogProps) {
  const updateCategory = useUpdateCategory();
  const createCategory = useCreateCategory();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (category && !isCreating) {
        setFormData({
          name: category.name,
          description: category.description || '',
          icon: category.icon || '',
        });
      } else {
        setFormData({
          name: '',
          description: '',
          icon: '',
        });
      }
      setError('');
    }
  }, [category, isOpen, isCreating]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      if (isCreating) {
        await createCategory.mutateAsync(formData);
      } else if (category) {
        await updateCategory.mutateAsync({
          id: category.id,
          ...formData,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || `Failed to ${isCreating ? 'create' : 'update'} category`);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const mutation = isCreating ? createCategory : updateCategory;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isCreating ? 'Create Category' : 'Edit Category'}</DialogTitle>
          <DialogDescription>
            {isCreating 
              ? 'Create a new skill category for the platform.'
              : 'Update the category information.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Category Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Programming, Design, Languages"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of this category..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Icon</Label>
            <Input
              id="icon"
              placeholder="e.g., 💻, 🎨, 🗣️"
              value={formData.icon}
              onChange={(e) => handleInputChange('icon', e.target.value)}
            />
            <p className="text-sm text-gray-500">
              Optional emoji or icon to represent this category
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isCreating ? 'Create Category' : 'Update Category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
