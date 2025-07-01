import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, User } from 'lucide-react';
import { Session } from '@/hooks/useSessions';
import { useSessionReviews } from '@/hooks/useReviews';
import { useAuth } from '@/contexts/AuthContext';
import ReviewForm from './ReviewForm';


interface MutualReviewSectionProps {
  session: Session;
}

export default function MutualReviewSection({ session }: MutualReviewSectionProps) {
  const { user } = useAuth();
  const { data: reviews = [] } = useSessionReviews(session.id);
  const [showReviewMentor, setShowReviewMentor] = useState(false);
  const [showReviewLearner, setShowReviewLearner] = useState(false);

  if (!user) return null;

  const isMentor = user.id === session.mentor.id;
  const isLearner = user.id === session.learner.id;

  const mentorReview = reviews.find((r: any) => r.reviewer.id === session.mentor.id);
  const learnerReview = reviews.find((r: any) => r.reviewer.id === session.learner.id);

  const hasReviewedOther = reviews.some((r: any) => r.reviewer.id === user.id);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Session Reviews
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Show existing reviews */}
          {mentorReview && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4" />
                <span className="font-medium">
                  Review by {session.mentor.user.first_name || session.mentor.user.username} (Mentor)
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= mentorReview.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-700">{mentorReview.comment}</p>
                <p className="text-xs text-gray-500">
                  {new Date(mentorReview.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          {learnerReview && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4" />
                <span className="font-medium">
                  Review by {session.learner.user.first_name || session.learner.user.username} (Learner)
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= learnerReview.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-700">{learnerReview.comment}</p>
                <p className="text-xs text-gray-500">
                  {new Date(learnerReview.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          {/* Review options for current user */}
          {!hasReviewedOther && (
            <div className="space-y-3">
              <h4 className="font-medium">Leave your review:</h4>
              
              {isMentor && (
                <div>
                  <Button
                    variant="outline"
                    onClick={() => setShowReviewLearner(!showReviewLearner)}
                    className="mb-3"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Review {session.learner.user.first_name || session.learner.user.username} (Learner)
                  </Button>
                  
                  {showReviewLearner && (
                    <ReviewForm
                      session={session}
                      reviewedUserId={session.learner.id}
                      reviewedUserName={session.learner.user.first_name || session.learner.user.username}
                      onSuccess={() => setShowReviewLearner(false)}
                    />
                  )}
                </div>
              )}

              {isLearner && (
                <div>
                  <Button
                    variant="outline"
                    onClick={() => setShowReviewMentor(!showReviewMentor)}
                    className="mb-3"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Review {session.mentor.user.first_name || session.mentor.user.username} (Mentor)
                  </Button>
                  
                  {showReviewMentor && (
                    <ReviewForm
                      session={session}
                      reviewedUserId={session.mentor.id}
                      reviewedUserName={session.mentor.user.first_name || session.mentor.user.username}
                      onSuccess={() => setShowReviewMentor(false)}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {hasReviewedOther && (
            <div className="text-center text-gray-600 py-4">
              <Star className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
              <p>Thank you for your review! You have already reviewed this session.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
