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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { useCategories, useUpdateSkill, Skill } from '@/hooks/useSkills';

interface EditSkillDialogProps {
  skill: Skill | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditSkillDialog({ skill, isOpen, onClose }: EditSkillDialogProps) {
  const { data: categories = [] } = useCategories();
  const updateSkill = useUpdateSkill();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    level: 'BEGINNER' as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
    duration_minutes: 60,
    tags: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (skill && isOpen) {
      setFormData({
        title: skill.title,
        description: skill.description,
        category: skill.category.toString(),
        level: skill.level,
        duration_minutes: skill.duration_minutes,
        tags: skill.tags || '',
      });
      setError('');
    }
  }, [skill, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skill) return;
    
    setError('');

    if (!formData.category) {
      setError('Please select a category');
      return;
    }

    try {
      await updateSkill.mutateAsync({
        id: skill.id,
        ...formData,
        category: parseInt(formData.category),
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update skill');
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Skill</DialogTitle>
          <DialogDescription>
            Update your skill information. Changes will be visible to learners immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Skill Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Introduction to React.js"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category: any) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Skill Level *</Label>
            <Select
              value={formData.level}
              onValueChange={(value) => handleInputChange('level', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BEGINNER">Beginner</SelectItem>
                <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                <SelectItem value="ADVANCED">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Session Duration (minutes) *</Label>
            <Input
              id="duration"
              type="number"
              min="15"
              max="240"
              step="15"
              value={formData.duration_minutes}
              onChange={(e) => handleInputChange('duration_minutes', parseInt(e.target.value))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="e.g., javascript, frontend, beginner-friendly"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
            />
            <p className="text-sm text-gray-500">
              Comma-separated tags to help learners find your skill
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe what you'll teach, what students will learn, prerequisites, etc."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={6}
              required
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={updateSkill.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateSkill.isPending}>
              {updateSkill.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Skill
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
