import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Project } from "@/lib/db/types";

export default function ProjectManager({ onSelect, selectedProject }: { onSelect?: (id: string) => void, selectedProject?: string }) {
  const [projects, setProjects] = useState<Pick<Project, 'id' | 'name'>[]>([]);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [loading, setLoading] = useState(false);

  async function fetchProjects() {
    const res = await fetch("/api/projects");
    const data = await res.json();
    if (res.ok) setProjects(data.projects);
  }

  useEffect(() => { fetchProjects(); }, []);

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
      fetchProjects();
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
      fetchProjects();
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    setLoading(true);
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    fetchProjects();
    setLoading(false);
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
                  className={onSelect ? "cursor-pointer hover:underline" : ""}
                  onClick={() => onSelect && onSelect(p.id)}
                  style={{ fontWeight: selectedProject === p.id ? "bold" : undefined }}
                >
                  {p.name}
                </span>
                <Button onClick={() => { setEditingId(p.id); setEditingName(p.name); }} variant="secondary">Edit</Button>
                <Button onClick={() => handleDelete(p.id)} variant="destructive">Delete</Button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
} 