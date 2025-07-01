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
import { Input } from '@/components/ui/input';
import { useEditSessionTime } from '@/hooks/useSessions';
import { Session } from '@/hooks/useSessions';
import { format } from 'date-fns';

interface EditTimeDialogProps {
  session: Session | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditTimeDialog({ session, isOpen, onClose }: EditTimeDialogProps) {
  const [newDateTime, setNewDateTime] = useState('');
  const editSessionTime = useEditSessionTime();

  React.useEffect(() => {
    if (session && isOpen) {
      const currentDateTime = new Date(session.scheduled_datetime);
      const formattedDateTime = format(currentDateTime, "yyyy-MM-dd'T'HH:mm");
      setNewDateTime(formattedDateTime);
    }
  }, [session, isOpen]);

  const handleSubmit = async () => {
    if (!session || !newDateTime) return;

    try {
      await editSessionTime.mutateAsync({
        sessionId: session.id,
        scheduledDatetime: new Date(newDateTime).toISOString(),
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to edit session time:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Session Time</DialogTitle>
          <DialogDescription>
            Change the scheduled time for this session. If the session was already approved, it will require re-approval.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label htmlFor="new-datetime" className="block text-sm font-medium mb-2">
              New Date & Time
            </label>
            <Input
              id="new-datetime"
              type="datetime-local"
              value={newDateTime}
              onChange={(e) => setNewDateTime(e.target.value)}
              required
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={editSessionTime.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={editSessionTime.isPending || !newDateTime}
          >
            {editSessionTime.isPending ? 'Updating...' : 'Update Time'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
