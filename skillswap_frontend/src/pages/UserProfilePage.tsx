import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, User, Calendar } from 'lucide-react';
import ReviewDisplay from '@/components/ReviewDisplay';

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();

  if (!userId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">User not found</div>
      </div>
    );
  }

  const userIdNumber = parseInt(userId);
  const userName = `User ${userId}`;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-gray-500" />
              </div>
              <div>
                <CardTitle className="text-2xl">{userName}</CardTitle>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="secondary">
                    <Calendar className="w-3 h-3 mr-1" />
                    Member since 2024
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">4.8</div>
                <div className="text-sm text-gray-600">Average Rating</div>
                <div className="flex justify-center mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= 5 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">12</div>
                <div className="text-sm text-gray-600">Sessions Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">8</div>
                <div className="text-sm text-gray-600">Skills Offered</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <ReviewDisplay userId={userIdNumber} userName={userName} />
      </div>
    </div>
  );
}
