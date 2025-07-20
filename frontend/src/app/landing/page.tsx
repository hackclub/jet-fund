"use client";
import { useEffect } from "react";
import SignIn from "@/components/sign-in";
import { SessionProvider, useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Target, PiggyBank, Plane } from "lucide-react";
import { HackathonCarousel } from "@/components/hackathon-carousel";
import { useRouter } from "next/navigation";
import { REIMBURSEMENT_FORM_URL } from "@/lib/consts";

function LandingContent() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect authenticated users to the main app
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      router.push("/");
    }
  }, [status, session, router]);

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

  // Don't show landing page content if user is authenticated
  if (status === "authenticated" && session?.user) {
    return null;
  }

  // Show landing page content
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6 flex flex-col items-center justify-center min-h-[350px]">
        <div className="relative z-10 w-full flex flex-col items-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Jet Fund
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get travel stipends for high school hackathons by building projects
          </p>
          <div className="flex justify-center">
            <Card className="w-full max-w-md">
              <CardContent>
                <SignIn />
              </CardContent>
            </Card>
          </div>
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
                Create a project and track your coding hours using{" "}
                <a
                  href="https://hackatime.hackclub.com/"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Hackatime
                </a>{" "}
                for automatic tracking or manual session timers.
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
                Provide a Git commit link and screenshot for manual sessions (automatic with Hackatime).
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
                When you&apos;re ready, submit your project for approval.
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
                Once approved, use your funds to reimburse travel expenses. Alternatively, you can request a virtual grant card to book flights/transport.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hackathon Carousel */}
      <div className="space-y-4">
        <div className="text-center">
        <h2 className="text-2xl">Available Hackathons</h2>
        <h3 className="text-xl mb-2">
        Jet Fund allows you to fly to any community-ran hackathon on{' '}
        <a href="https://hackathons.hackclub.com/" target="_blank" rel="noopener noreferrer" className="underline text-primary">hackathons.hackclub.com</a>, even internationally.
      </h3>
        <p>
          Other events and conventions are also eligible. In addition, you can fly to Hack Club HQ in Vermont and stay for free in <a href="https://hackclub.com/steve/" className="underline text-primary">Steve</a>.
        </p>
        <p>Upon request, most events will be approved, assuming there is some technical aspect. For more information, check out #jet on the Hack Club Slack.</p>
        </div>
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