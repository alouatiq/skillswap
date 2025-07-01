import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, User, MessageCircle, Edit, CheckCircle, XCircle, Star } from 'lucide-react';
import { Session, useCompleteSession } from '@/hooks/useSessions';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import SessionApprovalDialog from './SessionApprovalDialog';
import EditTimeDialog from './EditTimeDialog';
import SessionChat from './SessionChat';
import LiveChat from './LiveChat';
import MutualReviewSection from './MutualReviewSection';

interface EnhancedSessionCardProps {
  session: Session;
}

export default function EnhancedSessionCard({ session }: EnhancedSessionCardProps) {
  const { user } = useAuth();
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [showEditTimeDialog, setShowEditTimeDialog] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [showMutualReviews, setShowMutualReviews] = useState(false);
  
  const completeSession = useCompleteSession();

  const isMentor = user?.id === session.mentor.id;

  const canApprove = isMentor && session.status === 'PENDING';
  const canEditTime = session.status !== 'COMPLETED' && session.status !== 'CANCELLED';
  const canChat = session.status === 'APPROVED' || session.status === 'COMPLETED';
  const canComplete = session.status === 'APPROVED';
  const canReview = session.status === 'COMPLETED';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApprove = () => {
    setApprovalAction('approve');
    setShowApprovalDialog(true);
  };

  const handleReject = () => {
    setApprovalAction('reject');
    setShowApprovalDialog(true);
  };

  const handleComplete = async () => {
    try {
      await completeSession.mutateAsync(session.id);
    } catch (error) {
      console.error('Failed to complete session:', error);
    }
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{session.skill.title}</CardTitle>
              <div className="flex items-center space-x-2 mt-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {isMentor ? (
                    <>Learning with {session.learner.user.first_name || session.learner.user.username}</>
                  ) : (
                    <>Mentored by {session.mentor.user.first_name || session.mentor.user.username}</>
                  )}
                </span>
              </div>
            </div>
            <Badge className={getStatusColor(session.status)}>
              {session.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm">
                {format(new Date(session.scheduled_datetime), 'PPP p')}
              </span>
            </div>

            {session.learner_message && (
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="text-sm font-medium mb-1">Learner's Message:</div>
                <div className="text-sm text-gray-700">{session.learner_message}</div>
              </div>
            )}

            {session.mentor_response && (
              <div className="bg-blue-50 p-3 rounded-md">
                <div className="text-sm font-medium mb-1">Mentor's Response:</div>
                <div className="text-sm text-gray-700">{session.mentor_response}</div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {canApprove && (
                <>
                  <Button
                    size="sm"
                    onClick={handleApprove}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleReject}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </>
              )}

              {canEditTime && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowEditTimeDialog(true)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit Time
                </Button>
              )}

              {canChat && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowChat(!showChat)}
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  {showChat ? 'Hide Chat' : 'Show Chat'}
                </Button>
              )}

              {canComplete && (
                <Button
                  size="sm"
                  onClick={handleComplete}
                  disabled={completeSession.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Mark Complete
                </Button>
              )}

              {canReview && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowMutualReviews(!showMutualReviews)}
                >
                  <Star className="w-4 h-4 mr-1" />
                  {showMutualReviews ? 'Hide Reviews' : 'Session Reviews'}
                </Button>
              )}
            </div>

            {showChat && canChat && (
              <div className="mt-4">
                <SessionChat session={session} />
              </div>
            )}

            {showMutualReviews && canReview && (
              <div className="mt-4">
                <MutualReviewSection session={session} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <SessionApprovalDialog
        session={session}
        isOpen={showApprovalDialog}
        onClose={() => setShowApprovalDialog(false)}
        action={approvalAction}
      />

      <EditTimeDialog
        session={session}
        isOpen={showEditTimeDialog}
        onClose={() => setShowEditTimeDialog(false)}
      />

      <LiveChat
        session={session}
        isOpen={showLiveChat}
        onClose={() => setShowLiveChat(false)}
      />
    </>
  );
}
