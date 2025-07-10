"use client";
import SignIn from "@/components/sign-in";
import { SessionProvider, useSession } from "next-auth/react";
import SessionTimer from "@/components/session-timer";
import ProjectManager from "@/components/project-manager";
import EarningsDisplay from "@/components/earnings-display";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plane, Clock, Target, Settings, User } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import type { Project } from "@/lib/db/types";
import { HackathonCarousel } from "@/components/hackathon-carousel";
import { HelpModal } from "@/components/help-modal";
import AccountSettings from "@/components/account-settings";

function HomeContent() {
  const { data: session, status } = useSession();
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const hackathonSectionRef = useRef<HTMLDivElement>(null);

  const scrollToHackathons = () => {
    hackathonSectionRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start' 
    });
  };

  const fetchProjects = useCallback(async () => {
    const res = await fetch("/api/projects");
    const data = await res.json();
    if (res.ok) setProjects(data.projects);
  }, []);

  useEffect(() => { 
    if (session?.user) {
      fetchProjects(); 
    }
  }, [fetchProjects, session]);

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

  // Show only sign-in when not authenticated
  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Plane size={48} className="text-primary" />
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
              </div>
            </div>
            <CardTitle className="text-2xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Welcome to Jet Fund
            </CardTitle>
            <p className="text-muted-foreground">
              Earn flight stipends for travelling to hackathons
            </p>
          </CardHeader>
          <CardContent>
            <SignIn />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show full content when authenticated
  return (
    <div className="space-y-6">
      <HelpModal />
      {/* Account Settings Modal (single source of truth) */}
      <AccountSettingsModal open={showAccountSettings} onOpenChange={setShowAccountSettings} />
      {/* Top Row: Welcome only (left) */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch w-full">
        {/* Welcome Text (left, only if logged in) */}
        {session?.user && (
          <div className="flex flex-col justify-center items-center md:items-start flex-1 bg-background/80 rounded-lg p-4 md:p-6 min-h-full">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-sm">
                <User className="w-3 h-3 mr-1" />
                {session.user.name}
              </Badge>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-1">
              Ready to take flight?
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-md">
              Get flight stipends to{" "}
              <button 
                onClick={scrollToHackathons}
                className="text-primary hover:text-primary/80 underline cursor-pointer transition-colors"
                type="button"
                aria-label="Jump to hackathons section"
              >
                hackathons
              </button>{" "}
               simply by programming! Every session brings you closer to your next adventure.
            </p>
          </div>
        )}
      </div>

      {/* Main Grid - Session Timer and Projects */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Session Timer Card */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Log a Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SessionTimer
              selectedProject={selectedProject}
              setSelectedProject={setSelectedProject}
              projects={projects}
              refreshProjects={fetchProjects}
            />
          </CardContent>
        </Card>

        {/* Projects Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Your Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectManager
              selectedProject={selectedProject}
              projects={projects}
              setProjects={setProjects}
              refreshProjects={fetchProjects}
              setShowAccountSettings={setShowAccountSettings}
            />
          </CardContent>
        </Card>
      </div>

      {/* Hackathon Carousel - Moved to bottom */}
      <div ref={hackathonSectionRef}>
        <HackathonCarousel />
      </div>
    </div>
  );
}

// Extracted modal for maintainability
function AccountSettingsModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogTitle>Account Settings</DialogTitle>
        <AccountSettings onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

export default function Home() {
  return (
    <SessionProvider>
      <HomeContent />
    </SessionProvider>
  );
}
