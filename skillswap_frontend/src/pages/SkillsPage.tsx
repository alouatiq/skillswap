import { useState } from 'react';
import { useSkills, useCategories } from '@/hooks/useSkills';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Star, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function SkillsPage() {
  const [categoryFilter, setCategoryFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { user, loading } = useAuth();
  const { data: skills = [], isLoading } = useSkills(categoryFilter, levelFilter);
  const { data: categories = [] } = useCategories();

  const filteredSkills = skills.filter((skill: any) =>
    skill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    skill.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER': return 'bg-green-100 text-green-800';
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800';
      case 'ADVANCED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-64">Loading user info...</div>;
  }

  if (!user) {
    return (
      <div className="text-center mt-20 space-y-4">
        <h2 className="text-2xl font-semibold text-gray-700">
          Log in to explore available skills and connect with the right mentors.
        </h2>
        <Link to="/login">
          <Button className="bg-black mt-5 text-white hover:bg-gray-800">
            Go to Login
          </Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-64">Loading skills...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Browse Skills</h1>
        <p className="text-gray-600">Discover skills you can learn from our community of mentors</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search skills..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="sm:max-w-xs"
        />

        <Select value={categoryFilter || undefined} onValueChange={(value) => setCategoryFilter(value || '')}>
          <SelectTrigger className="sm:max-w-xs">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category: any) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={levelFilter || undefined} onValueChange={(value) => setLevelFilter(value || '')}>
          <SelectTrigger className="sm:max-w-xs">
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="BEGINNER">Beginner</SelectItem>
            <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
            <SelectItem value="ADVANCED">Advanced</SelectItem>
          </SelectContent>
        </Select>

        {(categoryFilter || levelFilter || searchTerm) && (
          <Button
            variant="outline"
            onClick={() => {
              setCategoryFilter('');
              setLevelFilter('');
              setSearchTerm('');
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Skills Grid */}
      {filteredSkills.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No skills found matching your criteria.</p>
          <p className="text-gray-400">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSkills.map((skill: any) => (
            <Card key={skill.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{skill.title}</CardTitle>
                    <CardDescription>{skill.category_name}</CardDescription>
                  </div>
                  <Badge className={getLevelColor(skill.level)}>
                    {skill.level}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {skill.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {skill.duration_minutes} min
                  </div>
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {skill.mentor.user.first_name} {skill.mentor.user.last_name}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    <span className="text-sm">
                      {skill.mentor.average_rating.toFixed(1)} ({skill.mentor.review_count} reviews)
                    </span>
                  </div>
                  <Link to={`/skills/${skill.id}`}>
                    <Button size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}