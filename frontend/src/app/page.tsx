"use client";
import SignIn from "@/components/sign-in";
import { SessionProvider, useSession } from "next-auth/react";
import SessionTimer from "@/components/session-timer";
import ProjectManager from "@/components/project-manager";
import AccountSettings from "@/components/account-settings";
import EarningsDisplay from "@/components/earnings-display";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect, useCallback } from "react";
import type { Project } from "@/lib/db/types";

function HomeContent() {
  const { data: session, status } = useSession();
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [showAccountSettings, setShowAccountSettings] = useState(false);

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
      <div className="min-h-screen bg-gradient-to-br from-white to-slate-100 flex flex-col items-center justify-center py-12 px-2">
        <div className="text-center">
          <div className="text-lg font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  // Show only sign-in when not authenticated
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-slate-100 flex flex-col items-center justify-center py-12 px-2">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 items-center">
                <SignIn />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show full content when authenticated
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-slate-100 flex flex-col items-center py-12 px-2">
      <main className="w-full max-w-2xl flex flex-col gap-8">
        <EarningsDisplay />
        
        <Card>
          <CardHeader>
            <CardTitle>Log a Session</CardTitle>
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
        
        <Card>
          <CardHeader>
            <CardTitle>Your Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectManager
              onSelect={setSelectedProject}
              selectedProject={selectedProject}
              projects={projects}
              setProjects={setProjects}
              refreshProjects={fetchProjects}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 items-center">
              <div className="text-sm text-muted-foreground">
                Signed in as {session.user.name}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAccountSettings(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Account Settings
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Account Settings Modal */}
      <Dialog open={showAccountSettings} onOpenChange={setShowAccountSettings}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogTitle>Account Settings</DialogTitle>
          <AccountSettings onClose={() => setShowAccountSettings(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Home() {
  return (
    <SessionProvider>
      <HomeContent />
    </SessionProvider>
  );
} 
