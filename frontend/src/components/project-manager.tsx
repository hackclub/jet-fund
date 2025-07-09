import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import ProjectSubmission from "@/components/project-submission";
import ProjectDetailsModal from "@/components/project-details-modal";
import type { Project } from "@/lib/db/types";
import { CheckIcon, Eye, Pencil } from "lucide-react";
import CheckBadge from "@/components/ui/check-badge";

interface ProjectManagerProps {
  onSelect?: (id: string) => void;
  selectedProject?: string;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  refreshProjects: () => Promise<void>;
}

export default function ProjectManager({ onSelect, selectedProject, projects, refreshProjects }: ProjectManagerProps) {
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionProject, setSubmissionProject] = useState<Project | null>(null);
  const [ongoingSession, setOngoingSession] = useState<string | null>(null);
  const [selectedProjectForDetails, setSelectedProjectForDetails] = useState<Project | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    projectId: string | null;
    projectName: string;
  }>({ isOpen: false, projectId: null, projectName: "" });

  async function handleCreate() {
    if (!newName.trim()) return;
    setLoading(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    if (res.ok) {
      setNewName("");
      await refreshProjects();
    }
    setLoading(false);
  }



  async function handleDelete(id: string) {
    setLoading(true);
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to delete project");
    } else {
      await refreshProjects();
    }
    setLoading(false);
  }

  function confirmDelete(id: string, name: string) {
    setDeleteConfirm({
      isOpen: true,
      projectId: id,
      projectName: name,
    });
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

    // Check if user has address set before opening submission form
    try {
      const res = await fetch("/api/user/profile");
      
      if (res.ok) {
        // If we get a successful response, user likely has address set
        // (the API would return an error if address is missing)
        setSubmissionProject(project);
        setSubmissionError(null);
      } else {
        setSubmissionError("Please set your address in Account Settings before submitting a project.");
      }
    } catch {
      setSubmissionError("Failed to check address status. Please try again.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="pt-2">
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
        </CardContent>
      </Card>
      
      {submissionError && (
        <Alert>
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
                    className="flex items-center border border-muted rounded-md overflow-hidden text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    title="View project details and sessions"
                  >
                    <div className="p-1.5">
                      <Eye className="w-3.5 h-3.5" />
                    </div>
                    <div className="w-px h-4 bg-muted"></div>
                    <div className="p-1.5">
                      <Pencil className="w-3.5 h-3.5" />
                    </div>
                  </button>
                </div>
                <span className="ml-0 sm:ml-2 text-xs text-muted-foreground">Total: {p.hoursSpent == null ? '0' : `${p.hoursSpent} hours`}</span>
                {p.status === 'approved' ? (
                  <CheckBadge>Approved</CheckBadge>
                ) : p.status === 'finished' ? (
                  <Badge variant="secondary">Submitted</Badge>
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
                      variant="outline"
                      size="sm"
                      title={ongoingSession === p.id ? "Cannot submit while session is in progress" : ""}
                    >
                      Submit
                    </Button>
                    <Button onClick={() => confirmDelete(p.id, p.name)} variant="destructive" size="sm">Delete</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, projectId: null, projectName: "" })}
        onConfirm={() => {
          if (deleteConfirm.projectId) {
            handleDelete(deleteConfirm.projectId);
          }
        }}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteConfirm.projectName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />

      {/* Project Submission Modal */}
      {submissionProject && (
        <ProjectSubmission
          project={submissionProject}
          onClose={() => setSubmissionProject(null)}
          onSuccess={handleSubmissionSuccess}
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