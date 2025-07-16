"use client";
import SignIn from "@/components/sign-in";
import { SessionProvider, useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plane, Clock, Target, PiggyBank } from "lucide-react";
import { HackathonCarousel } from "@/components/hackathon-carousel";
import { useRouter } from "next/navigation";
import { REIMBURSEMENT_FORM_URL } from "@/lib/consts";

function LandingContent() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="text-lg font-medium">Loading...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show landing page content
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Plane size={64} className="text-primary" />
            <div className="absolute -top-3 -right-3 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Jet Fund
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Get travel stipends for high school hackathons by building projects
        </p>
        <div className="flex justify-center">
          <Card className="w-full max-w-md">
            <CardContent>
              {session?.user ? (
                <Button 
                  onClick={() => router.push("/")} 
                  className="w-full"
                  size="lg"
                >
                  Go to App
                </Button>
              ) : (
                <SignIn />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* How It Works */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-2">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-sm">Log Your Work</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Create a project and use the session timer to log your coding hours.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-2">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-sm">Submit Proof</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Provide a Git commit link and screenshot at the end of each session.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-2">
                <Plane className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-sm">Ship Your Project</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                When you're ready, submit your project for approval.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-2">
                <PiggyBank className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-sm">Get Reimbursed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Once approved, use your funds to{" "}
                <a
                  href={REIMBURSEMENT_FORM_URL}
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  reimburse travel expenses
                </a>
                .
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hackathon Carousel */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Available Hackathons</h2>
        <p className="text-center text-muted-foreground">
          Jet Fund allows you to fly to any community-ran hackathon on{' '}
          <a href="https://hackathons.hackclub.com/" target="_blank" rel="noopener noreferrer" className="underline text-primary">hackathons.hackclub.com</a>.
        </p>
        <HackathonCarousel />
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <SessionProvider>
      <LandingContent />
    </SessionProvider>
  );
} 