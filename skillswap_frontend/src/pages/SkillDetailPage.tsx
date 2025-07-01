import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateSession } from '@/hooks/useSessions';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Star, Clock, User, Calendar, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

export default function SkillDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const createSession = useCreateSession();
  
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [learnerMessage, setLearnerMessage] = useState('');
  const [error, setError] = useState('');

  const { data: skill, isLoading } = useQuery({
    queryKey: ['skill', id],
    queryFn: async () => {
      const response = await api.get(`/skills/${id}/`);
      return response.data;
    },
  });

  const handleBookSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      navigate('/login');
      return;
    }

    if (!scheduledDateTime) {
      setError('Please select a date and time');
      return;
    }

    try {
      console.log('Raw scheduledDateTime:', scheduledDateTime);
      const isoDateTime = new Date(scheduledDateTime).toISOString();
      console.log('Converted ISO DateTime:', isoDateTime);
      await createSession.mutateAsync({
        skill_id: parseInt(id!),
        scheduled_datetime: isoDateTime,
        learner_message: learnerMessage,
      });
      
      setShowBookingForm(false);
      setScheduledDateTime('');
      setLearnerMessage('');
      alert('Session booked successfully! The mentor will review your request.');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to book session');
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER': return 'bg-green-100 text-green-800';
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800';
      case 'ADVANCED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-64">Loading skill details...</div>;
  }

  if (!skill) {
    return <div className="text-center py-12">Skill not found</div>;
  }

  const isOwnSkill = user?.id === skill.mentor.id;

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate('/skills')}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Skills
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{skill.title}</CardTitle>
                  <CardDescription className="text-lg">{skill.category_name}</CardDescription>
                </div>
                <Badge className={getLevelColor(skill.level)}>
                  {skill.level}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {skill.duration_minutes} minutes per session
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Added {format(new Date(skill.created_at), 'PPP')}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{skill.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Booking Form */}
          {showBookingForm && !isOwnSkill && (
            <Card>
              <CardHeader>
                <CardTitle>Book a Session</CardTitle>
                <CardDescription>
                  Schedule a learning session with {skill.mentor.user.first_name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBookSession} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="datetime">Preferred Date & Time</Label>
                    <Input
                      id="datetime"
                      type="text"
                      placeholder="YYYY-MM-DDTHH:MM (e.g., 2025-06-20T14:00)"
                      value={scheduledDateTime}
                      onChange={(e) => setScheduledDateTime(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message to Mentor (Optional)</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell the mentor about your goals, experience level, or any specific questions..."
                      value={learnerMessage}
                      onChange={(e) => setLearnerMessage(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button type="submit" disabled={createSession.isPending}>
                      {createSession.isPending ? 'Booking...' : 'Book Session'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowBookingForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Mentor Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Your Mentor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold">
                  {skill.mentor.user.first_name} {skill.mentor.user.last_name}
                </h3>
                <p className="text-sm text-gray-600">@{skill.mentor.user.username}</p>
              </div>
              
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                <span className="text-sm">
                  {skill.mentor.average_rating.toFixed(1)} ({skill.mentor.review_count} reviews)
                </span>
              </div>
              
              {skill.mentor.bio && (
                <div>
                  <h4 className="font-medium mb-1">About</h4>
                  <p className="text-sm text-gray-600">{skill.mentor.bio}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Button */}
          {!isOwnSkill && (
            <Card>
              <CardContent className="pt-6">
                {user ? (
                  <Button
                    className="w-full"
                    onClick={() => setShowBookingForm(true)}
                    disabled={showBookingForm}
                  >
                    {showBookingForm ? 'Booking Form Open' : 'Book a Session'}
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => navigate('/login')}
                  >
                    Login to Book Session
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {isOwnSkill && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 text-center">
                  This is your skill. Students can book sessions with you through this page.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
