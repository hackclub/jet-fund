import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import HackatimeProjectSelect from "@/components/hackatime-project-select";
import SessionEditModal from "@/components/session-edit-modal";
import { Calendar, Clock, GitBranch, Image, ExternalLink, Trash2, Edit } from "lucide-react";
import type { Project, Session } from "@/lib/db/types";

interface ProjectDetailsModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onProjectUpdate: () => void;
}

export default function ProjectDetailsModal({ 
  project, 
  isOpen, 
  onClose, 
  onProjectUpdate 
}: ProjectDetailsModalProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editHackatimeProjectName, setEditHackatimeProjectName] = useState("");
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    projectId: string | null;
    projectName: string;
  }>({ isOpen: false, projectId: null, projectName: "" });
  const [editingSession, setEditingSession] = useState<Session | null>(null);

  const fetchSessions = useCallback(async () => {
    if (!project) return;
    
    setSessionsLoading(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/sessions`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setSessionsLoading(false);
    }
  }, [project]);

  useEffect(() => {
    if (project && isOpen) {
      setEditName(project.name);
      setEditHackatimeProjectName(project.hackatimeProjectName || "");
      fetchSessions();
    }
  }, [project, isOpen, fetchSessions]);

  async function handleSaveEdit() {
    if (!project || !editName.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: editName,
          hackatimeProjectName: editHackatimeProjectName.trim() || undefined
        }),
      });
      
      if (res.ok) {
        setEditing(false);
        onProjectUpdate();
      }
    } catch (error) {
      console.error("Failed to update project:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete project");
      } else {
        onProjectUpdate();
        onClose();
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
    } finally {
      setLoading(false);
    }
  }

  function confirmDelete(id: string, name: string) {
    setDeleteConfirm({
      isOpen: true,
      projectId: id,
      projectName: name,
    });
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function formatDuration(hours: number | undefined) {
    if (!hours) return "0h";
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return minutes > 0 ? `${wholeHours}h ${minutes}m` : `${wholeHours}h`;
  }

  if (!project) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {editing ? (
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center gap-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Project name"
                    className="flex-1"
                  />
                  <Button onClick={handleSaveEdit} disabled={loading || !editName.trim()} size="sm">
                    Save
                  </Button>
                  <Button onClick={() => setEditing(false)} variant="secondary" size="sm">
                    Cancel
                  </Button>
                </div>
                                 <div className="space-y-2">
                   <label className="text-sm font-medium">Hackatime Project (Optional)</label>
                   <HackatimeProjectSelect
                     value={editHackatimeProjectName}
                     onValueChange={setEditHackatimeProjectName}
                     placeholder="Select a Hackatime project (optional)"
                     showClearButton={true}
                   />
                 </div>
              </div>
            ) : (
              <>
                <span>{project.name}</span>
                {project.status === 'active' && (
                  <div className="flex items-center gap-2 ml-auto">
                    <Button 
                      onClick={() => setEditing(true)} 
                      variant="ghost" 
                      size="sm"
                    >
                      Edit
                    </Button>
                  </div>
                )}
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sessions">Sessions ({sessions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardContent className="space-y-2">
                <CardTitle className="text-lg mb-1">Project Details</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  {project.status === 'approved' ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>
                  ) : project.status === 'submitted' ? (
                    <Badge variant="secondary">Submitted</Badge>
                  ) : project.status === 'rejected' ? (
                    <Badge variant="destructive">Rejected</Badge>
                  ) : (
                    <Badge variant="outline">Active</Badge>
                  )}
                </div>
                
                {project.rejectionReason && (
                  <div className="flex items-start gap-2">
                    <span className="font-medium">Rejection Reason:</span>
                    <p className="text-sm text-muted-foreground">{project.rejectionReason}</p>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Total Time: {formatDuration((project.approvedHours || 0) + (project.pendingHours || 0))}</span>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Approved: {formatDuration(project.approvedHours || 0)}</span>
                  <span>Pending: {formatDuration(project.pendingHours || 0)}</span>
                </div>

                {/* Hackatime Integration */}
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-medium">Hackatime Integration</h4>
                  
                  {project.hackatimeProjectName ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Connected Project:</span>
                        <span className="text-sm text-muted-foreground">{project.hackatimeProjectName}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Session Hours:</span>
                          <div className="text-muted-foreground">
                            <div>Approved: {formatDuration(project.sessionApprovedHours || 0)}</div>
                            <div>Pending: {formatDuration(project.sessionPendingHours || 0)}</div>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Hackatime Hours:</span>
                          <div className="text-muted-foreground">
                            <div>Approved: {formatDuration(project.hackatimeApprovedHours || 0)}</div>
                            <div>Pending: {formatDuration(project.hackatimePendingHours || 0)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No Hackatime project linked. You can link this project to a Hackatime project for automatic time tracking.
                    </div>
                  )}
                  
                  {project.status === 'active' && (
                    <div className="pt-2">
                      <Button
                        onClick={() => setEditing(true)}
                        variant="outline"
                        size="sm"
                      >
                        {project.hackatimeProjectName ? 'Edit Hackatime Link' : 'Link to Hackatime'}
                      </Button>
                    </div>
                  )}
                </div>

                {project.status === 'submitted' && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="font-medium">Submission Details</h4>
                      
                      {project.description && (
                        <div>
                          <span className="font-medium">Description:</span>
                          <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        {project.playableUrl && (
                          <div className="flex items-center gap-2">
                            <ExternalLink className="h-4 w-4" />
                            <a 
                              href={project.playableUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm"
                            >
                              Playable Version
                            </a>
                          </div>
                        )}
                        
                        {project.codeUrl && (
                          <div className="flex items-center gap-2">
                            <GitBranch className="h-4 w-4" />
                            <a 
                              href={project.codeUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm"
                            >
                              Source Code
                            </a>
                          </div>
                        )}
                        
                        {project.screenshotUrl && (
                          <div className="flex items-center gap-2">
                            {/* eslint-disable-next-line jsx-a11y/alt-text */}
                            <Image className="h-4 w-4" />
                            <a 
                              href={project.screenshotUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm"
                            >
                              Screenshot
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Work Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                {sessionsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading sessions...</div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No sessions found for this project.</div>
                ) : (
                  <div className="space-y-3">
                    {sessions.map((session) => (
                      <Card key={session.id} className={`border-l-4 ${
                        session.status === 'approved' ? 'border-l-green-500' :
                        session.status === 'rejected' ? 'border-l-red-500' :
                        session.status === 'finished' ? 'border-l-yellow-500' :
                        'border-l-blue-500'
                      }`}>
                        <CardContent className="pt-4">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(session.startTime)}</span>
                                {session.endTime && (
                                  <>
                                    <span>to</span>
                                    <span>{formatDate(session.endTime)}</span>
                                  </>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2 mt-1">
                              {session.hoursSpent && (
                                  <div className="flex items-center gap-2">
                                  <Clock className="h-3 w-3" />
                                  <span className="text-sm font-medium">
                                    {formatDuration(session.hoursSpent)}
                                  </span>
                                  </div>
                                )}
                                
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium">Status:</span>
                                  {session.status === 'approved' ? (
                                    <Badge variant="default" className="bg-green-100 text-green-800 text-xs">Approved</Badge>
                                  ) : session.status === 'finished' ? (
                                    <Badge variant="secondary" className="text-xs">Finished</Badge>
                                  ) : session.status === 'rejected' ? (
                                    <Badge variant="destructive" className="text-xs">Rejected</Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs">Ongoing</Badge>
                                  )}
                                </div>
                              </div>
                              
                              {session.rejectionReason && (
                                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
                                  <span className="font-medium text-red-800">Rejection Reason:</span>
                                  <p className="text-red-700 mt-1">{session.rejectionReason}</p>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              {session.gitCommitUrl && (
                                <a 
                                  href={session.gitCommitUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline text-xs flex items-center gap-1"
                                >
                                  <GitBranch className="h-3 w-3" />
                                  Commit
                                </a>
                              )}
                              
                              {session.imageUrl && (
                                <a 
                                  href={session.imageUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline text-xs flex items-center gap-1"
                                >
                                  {/* eslint-disable-next-line jsx-a11y/alt-text */}
                                  <Image className="h-3 w-3" />
                                  Screenshot
                                </a>
                              )}
                              
                              {session.status === 'rejected' && (
                                <Button
                                  onClick={() => setEditingSession(session)}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs h-6 px-2"
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Delete Button at the bottom */}
        {project.status === 'active' && (
          <div className="flex justify-end pt-4">
            <Button
              onClick={() => confirmDelete(project.id, project.name)}
              variant="destructive"
              size="sm"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete Project
            </Button>
          </div>
        )}
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, projectId: null, projectName: "" })}
        onConfirm={() => {
          if (deleteConfirm.projectId) {
            handleDelete(deleteConfirm.projectId);
            setDeleteConfirm({ isOpen: false, projectId: null, projectName: "" });
          }
        }}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteConfirm.projectName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />

      {/* Session Edit Modal */}
      <SessionEditModal
        session={editingSession}
        isOpen={!!editingSession}
        onClose={() => setEditingSession(null)}
        onSuccess={() => {
          fetchSessions();
          onProjectUpdate();
        }}
      />
    </Dialog>
  );
} 