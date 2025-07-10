import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import prettyMs from "pretty-ms";
import type { Project } from "@/lib/db/types";

interface SessionTimerProps {
  selectedProject: string;
  setSelectedProject: (id: string) => void;
  projects: Project[];
  refreshProjects: () => Promise<void>;
}

export default function SessionTimer({ selectedProject, setSelectedProject, projects, refreshProjects }: SessionTimerProps) {
  const [timerActive, setTimerActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [gitCommitUrl, setGitCommitUrl] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showNoActiveAlert, setShowNoActiveAlert] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check for unfinished session on mount
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    async function checkUnfinished() {
      const res = await fetch("/api/sessions");
      const data = await res.json();
      if (data.session) {
        setSessionId(data.session.id);
        // Use the session data from the API response
        const session = data.session;
        
        // If session is finished but not submitted, show form
        if (session.endTime && (!session.gitCommitUrl || !session.imageUrl)) {
          setShowForm(true);
          setSelectedProject(session.project[0]);
        } else if (!session.endTime) {
          // Session is still active
        const started = new Date(session.startTime);
        setTimerActive(true);
        setElapsed(Math.floor((Date.now() - started.getTime()) / 1000));
        interval = setInterval(() => {
          setElapsed(Math.floor((Date.now() - started.getTime()) / 1000));
        }, 1000);
        setSelectedProject(session.project[0]);
        }
      }
    }
    checkUnfinished();
    return () => { if (interval) clearInterval(interval); };
  }, [setSelectedProject]);

  // Clear selected project if it becomes non-active
  useEffect(() => {
    if (selectedProject) {
      const project = projects.find(p => p.id === selectedProject);
      if (project && project.status !== 'active') {
        setSelectedProject("");
      }
    }
  }, [projects, selectedProject, setSelectedProject]);

  async function startTimer() {
    setLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/sessions/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project: selectedProject }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSessionId(data.session.id);
        const started = new Date(data.session.startTime);
        setTimerActive(true);
        setElapsed(Math.floor((Date.now() - started.getTime()) / 1000));
        intervalRef.current = setInterval(() => {
          setElapsed(Math.floor((Date.now() - started.getTime()) / 1000));
        }, 1000);
      } else {
        setStatusMessage(data.error || "Failed to start session.");
        // If it's a submitted project error, clear the selection
        if (data.error && data.error.includes("submitted project")) {
          setSelectedProject("");
        }
        // If there's an unfinished session that needs completion, show it
        if (data.unfinishedSession) {
          setSessionId(data.unfinishedSession.id);
                  // If the session is finished but missing details, show form
        if (data.unfinishedSession.endTime && (!data.unfinishedSession.gitCommitUrl || !data.unfinishedSession.imageUrl)) {
          setShowForm(true);
          setSelectedProject(data.unfinishedSession.project[0]);
        }
        }
      }
    } catch {
      setStatusMessage("Network error.");
    } finally {
      setLoading(false);
    }
  }

  async function stopTimer() {
    if (!sessionId) return;
    
    setLoading(true);
    setStatusMessage(null);
    
    try {
      const res = await fetch("/api/sessions/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimerActive(false);
    setShowForm(true);
      } else {
        setStatusMessage(data.error || "Failed to finish session.");
      }
    } catch {
      setStatusMessage("Network error.");
    } finally {
      setLoading(false);
    }
  }

  // Helper: Upload file to Bucky and then to Hack Club CDN
  async function uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) throw new Error("Image upload failed");
    const data = await response.json();
    return data.url;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);
    if (!sessionId) {
      setStatusMessage("No session in progress.");
      setLoading(false);
      return;
    }
    let imageUrl = "";
    if (image) {
      try {
        imageUrl = await uploadImage(image);
      } catch {
        setStatusMessage("Image upload failed.");
        setLoading(false);
        return;
      }
    }
    const body = {
      sessionId,
      gitCommitUrl,
      imageUrl,
    };
    try {
      const res = await fetch("/api/sessions/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage("Session submitted!");
        setShowForm(false);
        setGitCommitUrl("");
        setImage(null);
        setElapsed(0);
        setSessionId(null);
        setTimerActive(false);
        setSelectedProject("");
        if (intervalRef.current) clearInterval(intervalRef.current);
        
        // Refresh projects to get updated data
        await refreshProjects();
      } else {
        setStatusMessage(data.error || "Failed to submit session.");
      }
    } catch {
      setStatusMessage("Network error.");
    } finally {
      setLoading(false);
    }
  }

  // Helper to check for active projects
  const hasActiveProject = projects.some(p => p.status === 'active');

  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto">
      {showNoActiveAlert && (
        <Alert className="bg-yellow-100 dark:bg-yellow-900 border-yellow-400 dark:border-yellow-700 text-yellow-900 dark:text-yellow-100 font-semibold mt-2">
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                You have no active projects. Create a new project under the "Your Projects" section, then you can start logging time spent programming.
              </span>
              <Button onClick={() => setShowNoActiveAlert(false)} variant="ghost" size="sm" className="ml-4">
                Dismiss
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      {!timerActive && !showForm && (
        <Card>
          <CardContent className="pt-6">
            <form
              onSubmit={e => {
                e.preventDefault();
                startTimer();
              }}
              className="flex flex-col gap-4"
            >
              <label htmlFor="project-select" className="font-bold text-lg mb-1 text-primary">Select a project</label>
              <Select 
                value={selectedProject} 
                onValueChange={setSelectedProject}
                onOpenChange={open => {
                  if (open && !hasActiveProject) setShowNoActiveAlert(true);
                }}
              >
                <SelectTrigger id="project-select" className="h-14 shadow-lg text-base font-semibold w-full">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id} disabled={p.status !== 'active'} className="text-base py-3">
                      {p.name} {p.status !== 'active' ? `(${p.status === 'submitted' ? 'Submitted' : 'Approved'})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedProject && projects.find(p => p.id === selectedProject)?.status !== 'active' && (
                <Alert>
                  <AlertDescription>
                    <strong>Project {projects.find(p => p.id === selectedProject)?.status === 'submitted' ? 'Submitted' : 'Approved'}:</strong> This project cannot accept new sessions.
                  </AlertDescription>
                </Alert>
              )}
              
              <Button 
                type="submit" 
                disabled={loading || !selectedProject || projects.find(p => p.id === selectedProject)?.status !== 'active'}
                className="w-full"
                variant="default"
              >
                {loading ? "Starting..." : "Start Session"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
      
      {timerActive && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 items-center">
              <div className="text-2xl font-mono">{prettyMs(elapsed * 1000, { verbose: true })}</div>
              <Button onClick={stopTimer} variant="secondary" className="w-full" disabled={loading}>
                {loading ? "Finishing..." : "Finish Session"}
              </Button>
              <div className="text-sm text-muted-foreground text-center">
                Working on <strong>{projects.find(p => p.id === selectedProject)?.name || 'Unknown Project'}</strong>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="mb-4">
              <Alert>
                <AlertDescription>
                  <strong>Session Finished:</strong> Please provide the commit URL and screenshot to complete your session submission for{" "}
                  <strong>{projects.find(p => p.id === selectedProject)?.name || 'Unknown Project'}</strong>
                </AlertDescription>
              </Alert>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                type="url"
                placeholder="https://github.com/mojombo/grit/commit/634396b2f541a9f2d58b00be1a07f0c358b999b3"
                value={gitCommitUrl}
                onChange={e => setGitCommitUrl(e.target.value)}
                required
              />
              <Input
                type="file"
                accept="image/*"
                onChange={e => setImage(e.target.files?.[0] || null)}
                required
              />
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Submitting..." : "Submit Session Details"}
              </Button>
              {statusMessage && (
                <p className="text-sm text-muted-foreground text-center">{statusMessage}</p>
              )}
            </form>
          </CardContent>
        </Card>
      )}
      
      {!timerActive && !showForm && statusMessage && (
        <Alert>
          <AlertDescription>
            {typeof statusMessage === "string" ? statusMessage : ""}
            {typeof statusMessage === "string" && statusMessage.includes("needs commit URL and screenshot") && (
              <div className="mt-2">
                <Button 
                  onClick={() => {
                    // This will be handled by the startTimer function when it detects the unfinished session
                    startTimer();
                  }}
                  variant="outline"
                  size="sm"
                >
                  Complete Session
                </Button>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}