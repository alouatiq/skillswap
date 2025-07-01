import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useApproveSession, useRejectSession } from '@/hooks/useSessions';
import { Session } from '@/hooks/useSessions';

interface SessionApprovalDialogProps {
  session: Session | null;
  isOpen: boolean;
  onClose: () => void;
  action: 'approve' | 'reject';
}

export default function SessionApprovalDialog({
  session,
  isOpen,
  onClose,
  action,
}: SessionApprovalDialogProps) {
  const [mentorResponse, setMentorResponse] = useState('');
  const approveSession = useApproveSession();
  const rejectSession = useRejectSession();

  const handleSubmit = async () => {
    if (!session) return;

    try {
      if (action === 'approve') {
        await approveSession.mutateAsync({
          sessionId: session.id,
          mentorResponse,
        });
      } else {
        await rejectSession.mutateAsync({
          sessionId: session.id,
          mentorResponse,
        });
      }
      
      setMentorResponse('');
      onClose();
    } catch (error) {
      console.error(`Failed to ${action} session:`, error);
    }
  };

  const isLoading = approveSession.isPending || rejectSession.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {action === 'approve' ? 'Approve Session' : 'Reject Session'}
          </DialogTitle>
          <DialogDescription>
            {session && (
              <>
                Session with {session.learner.user.first_name || session.learner.user.username} for{' '}
                <strong>{session.skill.title}</strong>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {session?.learner_message && (
            <div>
              <label className="block text-sm font-medium mb-2">Learner's Message</label>
              <div className="p-3 bg-gray-50 rounded-md text-sm">
                {session.learner_message}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="mentor-response" className="block text-sm font-medium mb-2">
              Your Response {action === 'reject' ? '(Required)' : '(Optional)'}
            </label>
            <Textarea
              id="mentor-response"
              value={mentorResponse}
              onChange={(e) => setMentorResponse(e.target.value)}
              placeholder={
                action === 'approve'
                  ? 'Add any additional notes for the learner...'
                  : 'Please explain why you are rejecting this session...'
              }
              rows={3}
              required={action === 'reject'}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || (action === 'reject' && !mentorResponse.trim())}
            variant={action === 'approve' ? 'default' : 'destructive'}
          >
            {isLoading
              ? `${action === 'approve' ? 'Approving' : 'Rejecting'}...`
              : action === 'approve'
              ? 'Approve Session'
              : 'Reject Session'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
