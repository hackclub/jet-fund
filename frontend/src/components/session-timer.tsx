import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { Project } from "@/lib/db/types";
import prettyMs from "pretty-ms";

interface SessionTimerProps {
  selectedProject: string;
  setSelectedProject: (id: string) => void;
  projects: Pick<Project, 'id' | 'name'>[];
}

export default function SessionTimer({ selectedProject, setSelectedProject, projects }: SessionTimerProps) {
  const [timerActive, setTimerActive] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [gitCommitUrl, setGitCommitUrl] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
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

  async function startTimer() {
    setLoading(true);
    setMessage(null);
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
        setMessage(data.error || "Failed to start session.");
      }
    } catch (err) {
      setMessage("Network error.");
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
    setMessage(null);
    if (!sessionId) {
      setMessage("No session in progress.");
      setLoading(false);
      return;
    }
    let imageUrl = "";
    if (image) {
      try {
        imageUrl = await uploadImage(image);
      } catch (err) {
        setMessage("Image upload failed.");
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
        setMessage("Session logged!");
        setShowForm(false);
        setGitCommitUrl("");
        setImage(null);
        setStartTime(null);
        setElapsed(0);
        setSessionId(null);
        setTimerActive(false);
        setSelectedProject("");
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        setMessage(data.error || "Failed to log session.");
      }
    } catch (err) {
      setMessage("Network error.");
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
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <Button type="submit" disabled={loading || !selectedProject}>
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
          {message && <span className="text-xs text-muted-foreground">{message}</span>}
        </form>
      )}
      {!timerActive && !showForm && message && (
        <span className="text-xs text-muted-foreground">{message}</span>
      )}
    </div>
  );
} 