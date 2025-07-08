import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Project } from "@/lib/db/types";

interface ProjectSubmissionProps {
  project: Project;
  onClose: () => void;
  onSuccess: () => void;
}

interface SubmissionData {
  playableUrl: string;
  codeUrl: string;
  screenshot: File | null;
  description: string;
}

export default function ProjectSubmission({ project, onClose, onSuccess }: ProjectSubmissionProps) {
  const [data, setData] = useState<SubmissionData>({
    playableUrl: "",
    codeUrl: "",
    screenshot: null,
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Upload screenshot first
      let screenshotUrl = "";
      if (data.screenshot) {
        const formData = new FormData();
        formData.append("file", data.screenshot);
        
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
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
          playableUrl: data.playableUrl,
          codeUrl: data.codeUrl,
          screenshotUrl,
          description: data.description,
        }),
      });

      const result = await res.json();
      
      if (res.ok) {
        onSuccess();
      } else {
        setError(result.error || "Failed to submit project");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Submit Project: {project.name}</h2>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="playableUrl" className="block text-sm font-medium mb-2">
                Playable URL *
              </label>
              <input
                type="url"
                id="playableUrl"
                value={data.playableUrl}
                onChange={(e) => setData(prev => ({ ...prev, playableUrl: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://your-project.vercel.app"
                required
              />
            </div>

            <div>
              <label htmlFor="codeUrl" className="block text-sm font-medium mb-2">
                Code Repository URL *
              </label>
              <input
                type="url"
                id="codeUrl"
                value={data.codeUrl}
                onChange={(e) => setData(prev => ({ ...prev, codeUrl: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://github.com/username/project"
                required
              />
            </div>

            <div>
              <label htmlFor="screenshot" className="block text-sm font-medium mb-2">
                Screenshot *
              </label>
              <input
                type="file"
                id="screenshot"
                accept="image/*"
                onChange={(e) => setData(prev => ({ ...prev, screenshot: e.target.files?.[0] || null }))}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Upload a screenshot of your project in action
              </p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                Description *
              </label>
              <textarea
                id="description"
                value={data.description}
                onChange={(e) => setData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Describe your project, what it does, technologies used, etc."
                required
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                {error}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Submit Project"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 