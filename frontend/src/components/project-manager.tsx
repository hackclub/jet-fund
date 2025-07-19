import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ProjectSubmission from "@/components/project-submission";
import ProjectDetailsModal from "@/components/project-details-modal";
import HackatimeProjectSelect from "@/components/hackatime-project-select";
import type { Project } from "@/lib/db/types";
import { Eye, Pencil } from "lucide-react";
import CheckBadge from "@/components/ui/check-badge";

interface ProjectManagerProps {
  selectedProject?: string;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  refreshProjects: () => Promise<void>;
  setShowAccountSettings: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ProjectManager({ selectedProject, projects, refreshProjects, setShowAccountSettings }: ProjectManagerProps) {
  const [newName, setNewName] = useState("");
  const [newHackatimeProject, setNewHackatimeProject] = useState("");
  const [showHackatimeSelect, setShowHackatimeSelect] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState<React.ReactNode | null>(null);
  const [submissionProject, setSubmissionProject] = useState<Project | null>(null);
  const [ongoingSession, setOngoingSession] = useState<string | null>(null);
  const [selectedProjectForDetails, setSelectedProjectForDetails] = useState<Project | null>(null);


  async function handleCreate() {
    if (!newName.trim()) return;
    setLoading(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        name: newName,
        hackatimeProjectName: newHackatimeProject || undefined
      }),
    });
    if (res.ok) {
      setNewName("");
      setNewHackatimeProject("");
      setShowHackatimeSelect(false);
      await refreshProjects();
    }
    setLoading(false);
  }





  function handleSubmissionSuccess() {
    setSubmissionProject(null);
    refreshProjects();
  }

  // Check for ongoing session on mount and when projects change
  useEffect(() => {
    async function checkOngoingSession() {
      try {
        const res = await fetch("/api/sessions");
        const data = await res.json();
        if (data.session) {
          setOngoingSession(data.session.project[0]);
        } else {
          setOngoingSession(null);
        }
      } catch {
        console.error("Failed to check ongoing session");
      }
    }
    checkOngoingSession();
  }, [projects]);

  async function handleSubmitClick(project: Project) {
    // Check if there's an ongoing session for this project
    if (ongoingSession === project.id) {
      setSubmissionError("Cannot submit project while there's an ongoing session. Please finish your current session first.");
      return;
    }

    // Check if user has complete profile set before opening submission form
    try {
      const res = await fetch("/api/user/profile");
      
      if (res.ok) {
        const data = await res.json();
        // Check if all required personal information fields are present
        if (!data.firstName?.trim() || !data.lastName?.trim() || !data.birthday?.trim()) {
          setSubmissionError(
            <span>
              Please complete your profile (first name, last name, and date of birth) in{" "}
              <Button 
                variant="link" 
                className="p-0 h-auto text-inherit hover:text-primary underline"
                onClick={() => setShowAccountSettings(true)}
              >
                Account Settings
              </Button>
              {" "}before submitting a project.
            </span>
          );
          return;
        }
        // If we get a successful response and have personal info, we can proceed
        // (address validation will happen during actual project submission)
        setSubmissionProject(project);
        setSubmissionError(null);
      } else {
        // Handle HTTP error responses (401, 404, 500, etc.)
        setSubmissionError("Failed to check profile status. Please try again.");
      }
    } catch {
      // Handle network-level errors (no internet, DNS failure, etc.)
      setSubmissionError("Failed to check profile status. Please try again.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="pt-2">
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="New project name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleCreate} disabled={loading || !newName.trim()}>Create</Button>
            </div>
            
            {/* Hackatime Project Selection */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHackatimeSelect(!showHackatimeSelect)}
                >
                  {showHackatimeSelect ? "Hide" : "Add"} Hackatime Project (Optional)
                </Button>
                {newHackatimeProject && (
                  <span className="text-sm text-muted-foreground">
                    Selected: {newHackatimeProject}
                  </span>
                )}
              </div>
              
                               {showHackatimeSelect && (
                   <HackatimeProjectSelect
                     value={newHackatimeProject}
                     onValueChange={setNewHackatimeProject}
                     placeholder="Select a Hackatime project (optional)"
                     showClearButton={true}
                   />
                 )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {submissionError && (
        <Alert className="bg-yellow-100 dark:bg-yellow-900 border-yellow-400 dark:border-yellow-700 text-yellow-900 dark:text-yellow-100 font-semibold">
          <AlertDescription className="flex items-center justify-between">
            {submissionError}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSubmissionError(null)}
              className="h-auto p-0 text-muted-foreground hover:text-foreground"
            >
              ×
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        {projects.map(p => (
          <Card key={p.id}>
            <CardContent className="pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full">
                <div className="flex items-center gap-2 flex-1">
                  <span
                    className="break-words"
                    style={{ fontWeight: selectedProject === p.id ? "bold" : undefined }}
                  >
                    {p.name}
                  </span>
                  <button
                    onClick={() => setSelectedProjectForDetails(p)}
                    className="flex items-center outline-purple rounded-lg overflow-hidden text-accent-foreground hover:text-accent-foreground hover:bg-accent/30 hover:ring-2 hover:ring-accent transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    title="View project details and sessions"
                  >
                    <div className="p-1">
                      <Eye className="w-4 h-4" />
                    </div>
                    {p.status === 'active' && (
                      <div className="p-1">
                        <Pencil className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                </div>
                <span className="ml-0 sm:ml-2 text-xs text-muted-foreground">
                  {p.hackatimeProjectName ? (
                    <div>
                      <div>{p.approvedHours || 0} approved, {p.pendingHours || 0} pending hours</div>
                      <div className="text-xs">
                        <div>Approved: {p.sessionApprovedHours || 0}h session + {p.hackatimeApprovedHours || 0}h hackatime</div>
                        <div>Pending: {p.sessionPendingHours || 0}h session + {p.hackatimePendingHours || 0}h hackatime</div>
                      </div>
                    </div>
                  ) : (
                    `${p.approvedHours || 0} approved, ${p.pendingHours || 0} pending hours`
                  )}
                </span>
                {p.status === 'approved' ? (
                  <CheckBadge>Approved</CheckBadge>
                ) : p.status === 'submitted' ? (
                  <Badge variant="secondary">Submitted</Badge>
                ) : p.status === 'rejected' ? (
                  <Badge variant="destructive">Rejected</Badge>
                ) : (
                  <Badge variant="default">Active</Badge>
                )}
                {ongoingSession === p.id && (
                  <Badge variant="outline">Session Active</Badge>
                )}
                {p.status === 'active' && (
                  <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                    <Button 
                      onClick={() => handleSubmitClick(p)} 
                      disabled={loading || ongoingSession === p.id} 
                      variant="default"
                      size="lg"
                      className="font-bold shadow-md px-6 py-2 text-base bg-accent text-accent-foreground hover:bg-accent/80 outline-purple"
                      title={ongoingSession === p.id ? "Cannot submit while session is in progress" : ""}
                    >
                      Submit
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Project Submission Modal */}
      {submissionProject && (
        <ProjectSubmission
          project={submissionProject}
          onClose={() => setSubmissionProject(null)}
          onSuccess={handleSubmissionSuccess}
          setShowAccountSettings={setShowAccountSettings}
        />
      )}

      {/* Project Details Modal */}
      <ProjectDetailsModal
        project={selectedProjectForDetails}
        isOpen={!!selectedProjectForDetails}
        onClose={() => setSelectedProjectForDetails(null)}
        onProjectUpdate={refreshProjects}
      />
    </div>
  );
}