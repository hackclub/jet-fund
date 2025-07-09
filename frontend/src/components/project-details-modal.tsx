import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, GitBranch, Image, ExternalLink } from "lucide-react";
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
  const [sessionsLoading, setSessionsLoading] = useState(false);

  useEffect(() => {
    if (project && isOpen) {
      setEditName(project.name);
      fetchSessions();
    }
  }, [project, isOpen]);

  async function fetchSessions() {
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
  }

  async function handleSaveEdit() {
    if (!project || !editName.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
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
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSaveEdit} disabled={loading || !editName.trim()} size="sm">
                  Save
                </Button>
                <Button onClick={() => setEditing(false)} variant="secondary" size="sm">
                  Cancel
                </Button>
              </div>
            ) : (
              <>
                <span>{project.name}</span>
                <Button 
                  onClick={() => setEditing(true)} 
                  variant="ghost" 
                  size="sm"
                  className="ml-auto"
                >
                  Edit
                </Button>
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
              <CardHeader>
                <CardTitle className="text-lg">Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  {project.status === 'approved' ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>
                  ) : project.status === 'finished' ? (
                    <Badge variant="secondary">Submitted</Badge>
                  ) : (
                    <Badge variant="outline">Active</Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Total Time: {formatDuration(project.hoursSpent)}</span>
                </div>

                {project.status === 'finished' && (
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
                      <Card key={session.id} className="border-l-4 border-l-blue-500">
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
                              
                              {session.hoursSpent && (
                                <div className="flex items-center gap-2 mt-1">
                                  <Clock className="h-3 w-3" />
                                  <span className="text-sm font-medium">
                                    {formatDuration(session.hoursSpent)}
                                  </span>
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
                                  <Image className="h-3 w-3" />
                                  Screenshot
                                </a>
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
      </DialogContent>
    </Dialog>
  );
} 