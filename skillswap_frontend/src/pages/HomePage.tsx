import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Star, Clock } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Learn and Teach Skills with SkillSwap
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Connect with mentors and learners in your community. Share your expertise 
          and learn new skills through personalized 1-on-1 sessions.
        </p>
        <div className="flex justify-center space-x-4">
          <Link to="/register">
            <Button size="lg">
              Get Started
            </Button>
          </Link>
          <Link to="/skills">
            <Button variant="outline" size="lg">
              Browse Skills
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <BookOpen className="w-8 h-8 text-blue-600 mb-2" />
            <CardTitle>Learn New Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Discover skills from programming to cooking, taught by experienced mentors.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Users className="w-8 h-8 text-green-600 mb-2" />
            <CardTitle>Teach Others</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Share your expertise and help others grow while building your reputation.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Star className="w-8 h-8 text-yellow-600 mb-2" />
            <CardTitle>Quality Assured</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Rate and review sessions to maintain high-quality learning experiences.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Clock className="w-8 h-8 text-purple-600 mb-2" />
            <CardTitle>Flexible Scheduling</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Book sessions at times that work for both mentors and learners.
            </CardDescription>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Ready to Start Learning?
        </h2>
        <p className="text-gray-600 mb-6">
          Join our community of learners and mentors today.
        </p>
        <Link to="/register">
          <Button size="lg">
            Sign Up Now
          </Button>
        </Link>
      </section>
    </div>
  );
}
