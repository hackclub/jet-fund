import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Notice } from "@/components/ui/notice";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Project } from "@/lib/db/types";

interface ProjectSubmissionProps {
  project: Project;
  onClose: () => void;
  onSuccess: () => void;
  setShowAccountSettings?: React.Dispatch<React.SetStateAction<boolean>>;
}

interface SubmissionData {
  playableUrl: string;
  codeUrl: string;
  screenshot: File | null;
  description: string;
}

export default function ProjectSubmission({ project, onClose, onSuccess, setShowAccountSettings }: ProjectSubmissionProps) {
  const [formData, setFormData] = useState<SubmissionData>({
    playableUrl: "",
    codeUrl: "",
    screenshot: null,
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<React.ReactNode | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Upload screenshot first
      let screenshotUrl = "";
      if (formData.screenshot) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", formData.screenshot);
        
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });
        
        if (!uploadRes.ok) {
          throw new Error("Failed to upload screenshot");
        }
        
        const uploadData = await uploadRes.json();
        screenshotUrl = uploadData.url;
      }

      // Submit project
      const res = await fetch(`/api/projects/${project.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playableUrl: formData.playableUrl,
          codeUrl: formData.codeUrl,
          screenshotUrl,
          description: formData.description,
        }),
      });

      const result = await res.json();
      
      if (res.ok) {
        onSuccess();
      } else {
        if (result.error?.includes("Address must be set")) {
          setError(
            <span>
              Please complete your address in{" "}
              <Button 
                variant="link" 
                className="p-0 h-auto text-inherit hover:text-primary underline"
                onClick={() => {
                  onClose(); // Close submission modal
                  setShowAccountSettings?.(true); // Open settings modal
                }}
              >
                Account Settings
              </Button>
              {" "}before submitting a project.
            </span>
          );
        } else {
          setError(result.error || "Failed to submit project");
        }
      }
    } catch {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit Project: {project.name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="playableUrl">Playable URL *</Label>
            <Input
              type="url"
              id="playableUrl"
              value={formData.playableUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, playableUrl: e.target.value }))}
              placeholder="https://your-project.vercel.app"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="codeUrl">Code Repository URL *</Label>
            <Input
              type="url"
              id="codeUrl"
              value={formData.codeUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, codeUrl: e.target.value }))}
              placeholder="https://github.com/username/project"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="screenshot">Screenshot *</Label>
            <Input
              type="file"
              id="screenshot"
              accept="image/*"
              onChange={(e) => setFormData(prev => ({ ...prev, screenshot: e.target.files?.[0] || null }))}
              required
            />
            <p className="text-sm text-muted-foreground">
              Upload a screenshot of your project in action
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              placeholder="Describe your project, what it does, technologies used, etc."
              required
            />
          </div>

                {error && (
        <Notice variant="warning">
          {error}
        </Notice>
      )}

          <div className="flex gap-3 justify-end">
            <Button type="submit" disabled={loading} className="w-40 mx-auto py-1 text-sm font-bold shadow-md">
              {loading ? "Submitting..." : "Submit Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}