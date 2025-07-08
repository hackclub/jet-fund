import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import ProjectSubmission from "@/components/project-submission";
import type { Project } from "@/lib/db/types";

interface ProjectManagerProps {
  onSelect?: (id: string) => void;
  selectedProject?: string;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  refreshProjects: () => Promise<void>;
}

export default function ProjectManager({ onSelect, selectedProject, projects, setProjects, refreshProjects }: ProjectManagerProps) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; projectId: string | null; projectName: string }>({
    isOpen: false,
    projectId: null,
    projectName: "",
  });
  const [submissionProject, setSubmissionProject] = useState<Project | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [ongoingSession, setOngoingSession] = useState<string | null>(null);

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

  async function handleEdit(id: string) {
    if (!editingName.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editingName }),
    });
    if (res.ok) {
      setEditingId(null);
      setEditingName("");
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
      } catch (err) {
        console.error("Failed to check ongoing session:", err);
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
      const data = await res.json();
      
      if (res.ok) {
        // If we get a successful response, user likely has address set
        // (the API would return an error if address is missing)
        setSubmissionProject(project);
        setSubmissionError(null);
      } else {
        setSubmissionError("Please set your address in Account Settings before submitting a project.");
      }
    } catch (err) {
      setSubmissionError("Failed to check address status. Please try again.");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="New project name"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <Button onClick={handleCreate} disabled={loading || !newName.trim()}>Create</Button>
      </div>
      
      {submissionError && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
          {submissionError}
          <button 
            onClick={() => setSubmissionError(null)}
            className="float-right text-red-800 hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}
      
      <ul className="divide-y">
        {projects.map(p => (
          <li key={p.id} className="flex items-center gap-2 py-1">
            {editingId === p.id ? (
              <>
                <input
                  type="text"
                  value={editingName}
                  onChange={e => setEditingName(e.target.value)}
                  className="border px-2 py-1 rounded"
                />
                <Button onClick={() => handleEdit(p.id)} disabled={loading || !editingName.trim()}>Save</Button>
                <Button onClick={() => { setEditingId(null); setEditingName(""); }} variant="secondary">Cancel</Button>
              </>
            ) : (
              <>
                <span
                  className={`${onSelect && p.status === 'active' ? "cursor-pointer hover:underline" : ""} ${
                    p.status === 'finished' ? "text-gray-500" : ""
                  }`}
                  onClick={() => onSelect && p.status === 'active' && onSelect(p.id)}
                  style={{ fontWeight: selectedProject === p.id ? "bold" : undefined }}
                >
                  {p.name}
                </span>
                <span className={`px-2 py-1 text-xs rounded ${
                  p.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {p.status === 'active' ? 'Active' : 'Submitted'}
                </span>
                {ongoingSession === p.id && (
                  <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                    Session Active
                  </span>
                )}
                {p.status === 'active' && (
                  <>
                    <Button onClick={() => { setEditingId(p.id); setEditingName(p.name); }} variant="secondary">Edit</Button>
                    <Button 
                      onClick={() => handleSubmitClick(p)} 
                      disabled={loading || ongoingSession === p.id} 
                      variant="outline"
                      title={ongoingSession === p.id ? "Cannot submit while session is in progress" : ""}
                    >
                      Submit
                    </Button>
                    <Button onClick={() => confirmDelete(p.id, p.name)} variant="destructive">Delete</Button>
                  </>
                )}
              </>
            )}
          </li>
        ))}
      </ul>

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
    </div>
  );
} 