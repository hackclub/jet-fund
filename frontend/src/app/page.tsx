"use client";
import { Plane } from "lucide-react";
import SignIn from "@/components/sign-in";
import { SessionProvider } from "next-auth/react";
import SessionTimer from "@/components/session-timer";
import ProjectManager from "@/components/project-manager";
import AccountSettings from "@/components/account-settings";
import { useState, useEffect, useCallback } from "react";
import type { Project } from "@/lib/db/types";

export default function Home() {
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [showAccountSettings, setShowAccountSettings] = useState(false);

  const fetchProjects = useCallback(async () => {
    const res = await fetch("/api/projects");
    const data = await res.json();
    if (res.ok) setProjects(data.projects);
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  return (
    <SessionProvider>
    <div className="min-h-screen bg-gradient-to-br from-white to-slate-100 flex flex-col items-center py-12 px-2">
      <main className="w-full max-w-2xl flex flex-col gap-8">
        <section className="bg-white rounded-xl shadow p-6 flex flex-col gap-4">
          <h2 className="text-xl font-bold mb-2">Your Projects</h2>
          <ProjectManager
            onSelect={setSelectedProject}
            selectedProject={selectedProject}
            projects={projects}
            setProjects={setProjects}
            refreshProjects={fetchProjects}
          />
        </section>
        <section className="bg-white rounded-xl shadow p-6 flex flex-col gap-4">
          <h2 className="text-xl font-bold mb-2">Log a Session</h2>
          <SessionTimer
            selectedProject={selectedProject}
            setSelectedProject={setSelectedProject}
            projects={projects}
            refreshProjects={fetchProjects}
          />
        </section>
        <section className="bg-white rounded-xl shadow p-6 flex flex-col gap-4 items-center">
            <SignIn />
            <div className="flex gap-2">
              <button
                onClick={() => setShowAccountSettings(true)}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Account Settings
              </button>
            </div>
        </section>
      </main>

        {/* Account Settings Modal */}
        {showAccountSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <AccountSettings onClose={() => setShowAccountSettings(false)} />
              </div>
            </div>
          </div>
        )}
    </div>
    </SessionProvider>
  );
} 
