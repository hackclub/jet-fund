"use client";
import { SessionProvider, useSession } from "next-auth/react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Notice } from "@/components/ui/notice";
import { Separator } from "@/components/ui/separator";
import { Clock, Target, User, Loader2, AlertTriangle } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import type { Project } from "@/lib/db/types";
import { HelpModal } from "@/components/help-modal";
import AccountSettings from "@/components/account-settings";
import SessionTimer from "@/components/session-timer";
import ProjectManager from "@/components/project-manager";
import { useRouter } from "next/navigation";

function HomeContent() {
  const { data: session, status } = useSession();
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const router = useRouter();

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

  // Redirect unauthenticated users to landing page
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/landing");
    }
  }, [status, router]);

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-lg font-medium">Loading...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Helper to check for active projects
  const hasActiveProject = projects.some(p => p.status === 'active');

  // Show full content when authenticated
  return (
    <div className="space-y-6">
      <HelpModal />
      <AccountSettingsModal open={showAccountSettings} onOpenChange={setShowAccountSettings} />
      
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch w-full">
        {session?.user && (
          <div className="flex flex-col justify-center items-center md:items-start flex-1 bg-background/80 rounded-lg p-4 md:p-6 min-h-full">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className="text-sm">
                <User className="w-3 h-3 mr-1" />
                {session.user.name}
              </Badge>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-2">
              Ready to take flight?
            </h2>
            <Separator className="my-2" />
            <p className="text-muted-foreground text-sm md:text-base max-w-md">
              Get flight stipends to hackathons simply by programming! Every session brings you closer to your next adventure. For more information, open the help modal from the bottom right corner.
            </p>
          </div>
        )}
      </div>

      {/* No Active Projects Notice */}
      {!hasActiveProject && (
        <Notice variant="warning">
          <AlertTriangle className="h-4 w-4" />
          You have no active projects. Create a new project under the &quot;Your Projects&quot; section, then you can start logging time spent programming.
        </Notice>
      )}

      {/* Main Grid - Session Timer and Projects */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Session Timer Card - Only show if there are active projects */}
        {hasActiveProject && (
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
        )}

        {/* Projects Card */}
        <Card className={hasActiveProject ? "md:col-span-2" : "md:col-span-2 lg:col-span-3"}>
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
