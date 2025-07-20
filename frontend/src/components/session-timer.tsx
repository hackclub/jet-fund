import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import SessionForm from "@/components/session-form";
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
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showHackatimeInfo, setShowHackatimeInfo] = useState(false);
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

  async function handleSessionSubmit(data: { gitCommitUrl: string; imageUrl: string }) {
    if (!sessionId) {
      throw new Error("No session in progress.");
    }

    const body = {
      sessionId,
      gitCommitUrl: data.gitCommitUrl,
      imageUrl: data.imageUrl,
    };

    const res = await fetch("/api/sessions/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await res.json();
    
    if (res.ok && result.success) {
      setStatusMessage("Session submitted!");
      setShowForm(false);
      setElapsed(0);
      setSessionId(null);
      setTimerActive(false);
      setSelectedProject("");
      if (intervalRef.current) clearInterval(intervalRef.current);
      
      // Refresh projects to get updated data
      await refreshProjects();
    } else {
      throw new Error(result.error || "Failed to submit session.");
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
              <label htmlFor="project-select" className="font-bold text-lg mb-1 text-primary">Select a project</label>
              <Select 
                value={selectedProject} 
                onValueChange={setSelectedProject}
              >
                <SelectTrigger id="project-select" className="h-14 shadow-lg text-base font-semibold w-full">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id} disabled={p.status !== 'active'} className="text-base py-3">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">
                          {p.name} {p.status !== 'active' ? `(${p.status === 'submitted' ? 'Submitted' : 'Approved'})` : ''}
                        </span>
                        {(p.approvedHours !== undefined || p.pendingHours !== undefined) && (
                          <span className="text-sm text-muted-foreground">
                            {p.approvedHours || 0} approved, {p.pendingHours || 0} pending hours
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            
              {/* Hackatime Info */}
              {selectedProject && projects.find(p => p.id === selectedProject)?.status === 'active' && (
                <div className="border rounded-lg p-4 bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm">Hackatime Integration</h3>
                    {projects.find(p => p.id === selectedProject)?.hackatimeProjectName && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Connected</span>
                    )}
                  </div>
                  
                  {projects.find(p => p.id === selectedProject)?.hackatimeProjectName ? (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Connected to: <strong>{projects.find(p => p.id === selectedProject)?.hackatimeProjectName}</strong>
                      </p>
                      <p className="text-xs text-orange-700 bg-orange-50 p-2 rounded">
                        ⚠️ This project is connected to Hackatime for automatic time tracking. 
                        Manual sessions are disabled and will not contribute to earnings. To log time manually, disconnect the project from Hackatime.
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      You can also link this project to Hackatime for automatic time tracking. 
                      Edit the project to set up the connection.
                    </p>
                  )}
                </div>
              )}
              
              <Button 
                type="submit" 
                disabled={loading || !selectedProject || projects.find(p => p.id === selectedProject)?.status !== 'active' || !!projects.find(p => p.id === selectedProject)?.hackatimeProjectName}
                className="w-full outline-purple"
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
      
      {showForm && sessionId && (
        <SessionForm
          sessionId={sessionId}
          projectName={projects.find(p => p.id === selectedProject)?.name}
          mode="submit"
          onSubmit={handleSessionSubmit}
        />
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