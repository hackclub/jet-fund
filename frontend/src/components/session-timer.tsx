import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { Project } from "@/lib/db/types";
import prettyMs from "pretty-ms";

interface SessionTimerProps {
  selectedProject: string;
  setSelectedProject: (id: string) => void;
  projects: Project[];
  refreshProjects: () => Promise<void>;
}

export default function SessionTimer({ selectedProject, setSelectedProject, projects, refreshProjects }: SessionTimerProps) {
  const [timerActive, setTimerActive] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
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
        setStartTime(started);
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
  }, []);

  // Clear selected project if it becomes submitted
  useEffect(() => {
    if (selectedProject) {
      const project = projects.find(p => p.id === selectedProject);
      if (project && project.status === 'finished') {
        setSelectedProject("");
      }
    }
  }, [projects, selectedProject]);

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
        setStartTime(started);
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
    } catch (err) {
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
      } catch (err) {
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
        setStartTime(null);
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
    } catch (err) {
      setStatusMessage("Network error.");
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto">
      {!timerActive && !showForm && (
        <form
          onSubmit={e => {
            e.preventDefault();
            startTimer();
          }}
          className="flex flex-col gap-2"
        >
          <select
            value={selectedProject}
            onChange={e => setSelectedProject(e.target.value)}
            required
            className="border px-2 py-1 rounded"
          >
            <option value="" disabled>Select a project</option>
            {projects.map(p => (
              <option key={p.id} value={p.id} disabled={p.status === 'finished'}>
                {p.name} {p.status === 'finished' ? '(Submitted)' : ''}
              </option>
            ))}
          </select>
          {selectedProject && projects.find(p => p.id === selectedProject)?.status === 'finished' && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
              <strong>Project Submitted:</strong> This project has been submitted and cannot accept new sessions.
            </div>
          )}
          <Button 
            type="submit" 
            disabled={loading || !selectedProject || projects.find(p => p.id === selectedProject)?.status === 'finished'}
          >
            {loading ? "Starting..." : "Start Session"}
          </Button>
        </form>
      )}
      {timerActive && (
        <div className="flex flex-col gap-2 items-center">
          <div className="text-2xl font-mono">{prettyMs(elapsed * 1000, { verbose: true })}</div>
          <Button onClick={stopTimer} variant="secondary">Finish Session</Button>
          <div className="text-sm text-muted-foreground">
            Working on <strong>{projects.find(p => p.id === selectedProject)?.name || 'Unknown Project'}</strong>
          </div>
        </div>
      )}
      {showForm && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input
            type="url"
            placeholder="Git commit URL"
            value={gitCommitUrl}
            onChange={e => setGitCommitUrl(e.target.value)}
            required
            className="border px-2 py-1 rounded"
          />
          <input
            type="file"
            accept="image/*"
            onChange={e => setImage(e.target.files?.[0] || null)}
            required
            className="border px-2 py-1 rounded"
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Logging..." : "Submit Session"}
          </Button>
          {statusMessage && <span className="text-xs text-muted-foreground">{statusMessage}</span>}
        </form>
      )}
      {!timerActive && !showForm && statusMessage && (
        <span className="text-xs text-muted-foreground">{statusMessage}</span>
      )}
    </div>
  );
} 