"use client";
import { Plane } from "lucide-react";
import SignIn from "@/components/sign-in";
import { SessionProvider } from "next-auth/react";
import SessionTimer from "@/components/session-timer";
import ProjectManager from "@/components/project-manager";
import { useState, useEffect, useCallback } from "react";
import type { Project } from "@/lib/db/types";

export default function Home() {
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [projects, setProjects] = useState<Pick<Project, 'id' | 'name'>[]>([]);

  const fetchProjects = useCallback(async () => {
    const res = await fetch("/api/projects");
    const data = await res.json();
    if (res.ok) setProjects(data.projects);
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  return (
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
          />
        </section>
        <section className="bg-white rounded-xl shadow p-6 flex flex-col gap-4 items-center">
          <SessionProvider>
            <SignIn />
          </SessionProvider>
        </section>
      </main>
    </div>
  );
} 
