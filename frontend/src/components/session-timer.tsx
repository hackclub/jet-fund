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
        const started = new Date(session.startTime);
        setTimerActive(true);
        setElapsed(Math.floor((Date.now() - started.getTime()) / 1000));
        interval = setInterval(() => {
          setElapsed(Math.floor((Date.now() - started.getTime()) / 1000));
        }, 1000);
        setSelectedProject(session.project[0]);
      }
    }
    checkUnfinished();
    return () => { if (interval) clearInterval(interval); };
  }, [setSelectedProject]);

  // Clear selected project if it becomes submitted
  useEffect(() => {
    if (selectedProject) {
      const project = projects.find(p => p.id === selectedProject);
      if (project && project.status === 'finished') {
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
      }
    } catch {
      setStatusMessage("Network error.");
    } finally {
      setLoading(false);
    }
  }

  function stopTimer() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimerActive(false);
    setShowForm(true);
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
      const res = await fetch("/api/sessions/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage("Session logged!");
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
        setStatusMessage(data.error || "Failed to log session.");
      }
    } catch {
      setStatusMessage("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto">
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
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id} disabled={p.status === 'finished'}>
                      {p.name} {p.status === 'finished' ? '(Submitted)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedProject && projects.find(p => p.id === selectedProject)?.status === 'finished' && (
                <Alert>
                  <AlertDescription>
                    <strong>Project Submitted:</strong> This project has been submitted and cannot accept new sessions.
                  </AlertDescription>
                </Alert>
              )}
              
              <Button 
                type="submit" 
                disabled={loading || !selectedProject || projects.find(p => p.id === selectedProject)?.status === 'finished'}
                className="w-full"
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
              <Button onClick={stopTimer} variant="secondary" className="w-full">Finish Session</Button>
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
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                type="url"
                placeholder="Git commit URL"
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
                {loading ? "Logging..." : "Submit Session"}
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
          <AlertDescription>{statusMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  );
} 