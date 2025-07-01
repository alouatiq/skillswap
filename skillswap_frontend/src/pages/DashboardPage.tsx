import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSessionsAsLearner, useSessionsAsMentor } from '@/hooks/useSessions';
import { useMySkills, useDeleteSkill } from '@/hooks/useSkills';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Users, Star, Clock, Plus, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import EditSkillDialog from '@/components/EditSkillDialog';
import EnhancedSessionCard from '@/components/EnhancedSessionCard';
import { Skill } from '@/hooks/useSkills';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: learnerSessions = [] } = useSessionsAsLearner();
  const { data: mentorSessions = [] } = useSessionsAsMentor();
  const { data: mySkills = [] } = useMySkills();
  const deleteSkill = useDeleteSkill();
  
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);



  const handleEditSkill = (skill: Skill) => {
    setEditingSkill(skill);
    setShowEditDialog(true);
  };

  const handleDeleteSkill = async (skillId: number) => {
    if (window.confirm('Are you sure you want to delete this skill? This action cannot be undone.')) {
      try {
        await deleteSkill.mutateAsync(skillId);
      } catch (error) {
        console.error('Failed to delete skill:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.user.first_name || user?.user.username}!
          </h1>
          <p className="text-gray-600">
            {user?.user_type === 'MENTOR' ? 'Manage your skills and sessions' : 'Track your learning journey'}
          </p>
        </div>
        {user?.user_type === 'MENTOR' && (
          <Link to="/create-skill">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add New Skill
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {user?.user_type === 'MENTOR' ? 'Skills Offered' : 'Sessions Booked'}
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user?.user_type === 'MENTOR' ? mySkills.length : learnerSessions.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {user?.user_type === 'MENTOR' ? 'Teaching Sessions' : 'Completed Sessions'}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user?.user_type === 'MENTOR' 
                ? mentorSessions.length 
                : learnerSessions.filter((s: any) => s.status === 'COMPLETED').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user?.average_rating?.toFixed(1) || '0.0'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.review_count || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue={user?.user_type === 'MENTOR' ? 'mentor' : 'learner'} className="space-y-4">
        <TabsList>
          <TabsTrigger value="learner">As Learner</TabsTrigger>
          {user?.user_type === 'MENTOR' && (
            <TabsTrigger value="mentor">As Mentor</TabsTrigger>
          )}
          {user?.user_type === 'MENTOR' && (
            <TabsTrigger value="skills">My Skills</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="learner" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Learning Sessions</CardTitle>
              <CardDescription>Sessions you've booked as a learner</CardDescription>
            </CardHeader>
            <CardContent>
              {learnerSessions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No sessions booked yet. <Link to="/skills" className="text-blue-600 hover:underline">Browse skills</Link> to get started!
                </p>
              ) : (
                <div className="space-y-4">
                  {learnerSessions.map((session: any) => (
                    <EnhancedSessionCard key={session.id} session={session} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {user?.user_type === 'MENTOR' && (
          <TabsContent value="mentor" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Teaching Sessions</CardTitle>
                <CardDescription>Sessions where you're the mentor</CardDescription>
              </CardHeader>
              <CardContent>
                {mentorSessions.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No teaching sessions yet. Students will book your skills once you add them!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {mentorSessions.map((session: any) => (
                      <EnhancedSessionCard key={session.id} session={session} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {user?.user_type === 'MENTOR' && (
          <TabsContent value="skills" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Skills</CardTitle>
                <CardDescription>Skills you're offering to teach</CardDescription>
              </CardHeader>
              <CardContent>
                {mySkills.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">You haven't added any skills yet.</p>
                    <Link to="/create-skill">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Skill
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {mySkills.map((skill: any) => (
                      <div key={skill.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold">{skill.title}</h3>
                            <p className="text-sm text-gray-600">{skill.category_name}</p>
                            <p className="text-sm text-gray-500 mt-1">{skill.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">{skill.level}</Badge>
                              <Badge variant="outline">{skill.duration_minutes} min</Badge>
                              {skill.tags && (
                                <Badge variant="secondary">{skill.tags}</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditSkill(skill)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteSkill(skill.id)}
                              disabled={deleteSkill.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <EditSkillDialog
        skill={editingSkill}
        isOpen={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setEditingSkill(null);
        }}
      />
    </div>
  );
}
