"use client";
import { Plane } from "lucide-react";
import SignIn from "@/components/sign-in";
import { SessionProvider } from "next-auth/react";
import SessionTimer from "@/components/session-timer";
import ProjectManager from "@/components/project-manager";
import { useState } from "react";

export default function Home() {
  const [selectedProject, setSelectedProject] = useState<string>("");

  return (
    <div className="flex min-h-screen flex-col items-center justify-start p-8">
      <div className="w-full max-w-md mb-8">
        <ProjectManager onSelect={setSelectedProject} selectedProject={selectedProject} />
      </div>
      <SessionTimer selectedProject={selectedProject} setSelectedProject={setSelectedProject} />
      <div className="mt-8 w-full max-w-md">
        <SessionProvider>
          <SignIn />
        </SessionProvider>
      </div>
    </div>
  );
} 
