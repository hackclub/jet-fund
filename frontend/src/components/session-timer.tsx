import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import type { Project } from "@/lib/db/types";

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
        setStartTime(new Date()); // For local elapsed display only
        setTimerActive(true);
        setElapsed(0);
        intervalRef.current = setInterval(() => {
          setElapsed((prev) => prev + 1);
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    if (!sessionId) {
      setMessage("No session in progress.");
      setLoading(false);
      return;
    }
    const body = {
      sessionId,
      gitCommitUrl,
      imageUrl: image ? image.name : "",
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
        setSelectedProject("");
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
          <div className="text-2xl font-mono">{elapsed}s</div>
          <Button onClick={stopTimer} variant="secondary">Finish Session</Button>
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