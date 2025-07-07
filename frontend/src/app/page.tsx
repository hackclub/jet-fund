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
    <div className="flex min-h-screen flex-col items-center justify-start p-8">
      <div className="w-full max-w-md mb-8">
        <ProjectManager
          onSelect={setSelectedProject}
          selectedProject={selectedProject}
          projects={projects}
          setProjects={setProjects}
          refreshProjects={fetchProjects}
        />
      </div>
      <SessionTimer
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        projects={projects}
        refreshProjects={fetchProjects}
      />
      <div className="mt-8 w-full max-w-md">
        <SessionProvider>
          <SignIn />
        </SessionProvider>
      </div>
    </div>
  );
} 
