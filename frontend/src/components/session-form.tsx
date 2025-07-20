"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import type { Session } from "@/lib/db/types";

interface SessionFormData {
  gitCommitUrl: string;
  image: File | null;
}

interface SessionFormProps {
  sessionId: string;
  projectName?: string;
  mode: "submit" | "edit";
  initialData?: {
    gitCommitUrl?: string;
    imageUrl?: string;
  };
  rejectionReason?: string;
  onSubmit: (data: { gitCommitUrl: string; imageUrl: string }) => Promise<void>;
  onCancel?: () => void;
  submitButtonText?: string;
  cancelButtonText?: string;
}

export default function SessionForm({
  sessionId,
  projectName,
  mode,
  initialData,
  rejectionReason,
  onSubmit,
  onCancel,
  submitButtonText,
  cancelButtonText,
}: SessionFormProps) {
  const [formData, setFormData] = useState<SessionFormData>({
    gitCommitUrl: "",
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form data when component mounts or initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        gitCommitUrl: initialData.gitCommitUrl || "",
        image: null,
      });
    }
  }, [initialData]);

  // Helper: Upload file to Bucky and then to Hack Club CDN
  async function uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      console.error(response);
      throw new Error("Image upload failed");
    }
    const data = await response.json();
    return data.url;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Upload image first if provided
      let imageUrl = initialData?.imageUrl || ""; // Keep existing if no new image
      if (formData.image) {
        try {
          imageUrl = await uploadImage(formData.image);
        } catch {
          setError("Image upload failed.");
          setLoading(false);
          return;
        }
      }

      // Call the parent's onSubmit handler
      await onSubmit({
        gitCommitUrl: formData.gitCommitUrl,
        imageUrl,
      });
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  }

  const isEditMode = mode === "edit";
  const defaultSubmitText = isEditMode ? "Update Session" : "Submit Session Details";
  const defaultCancelText = "Cancel";

  return (
    <Card>
      <CardContent className="pt-6">
        {/* Header Alert */}
        <div className="mb-4">
          <Alert>
            <AlertDescription>
              {isEditMode ? (
                <>
                  <strong>Update Rejected Session:</strong> Please provide updated commit URL and screenshot for{" "}
                  <strong>{projectName || "this project"}</strong>
                </>
              ) : (
                <>
                  <strong>Session Finished:</strong> Please provide the commit URL and screenshot to complete your session submission for{" "}
                  <strong>{projectName || "this project"}</strong>
                </>
              )}
            </AlertDescription>
          </Alert>
        </div>

        {/* Rejection Reason (edit mode only) */}
        {isEditMode && rejectionReason && (
          <Alert className="mb-4">
            <AlertDescription>
              <strong>Rejection Reason:</strong> {rejectionReason}
            </AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="gitCommitUrl">Git Commit URL *</Label>
            <Input
              type="url"
              id="gitCommitUrl"
              placeholder="https://github.com/mojombo/grit/commit/634396b2f541a9f2d58b00be1a07f0c358b999b3"
              value={formData.gitCommitUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, gitCommitUrl: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Screenshot *</Label>
            <Input
              type="file"
              id="image"
              accept="image/*"
              onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.files?.[0] || null }))}
              required={!isEditMode} // Only required for new submissions, not edits
            />
            <p className="text-sm text-muted-foreground">
              {isEditMode 
                ? "Upload a new screenshot for this session (optional if keeping existing)"
                : "Upload a screenshot of your work"
              }
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            {onCancel && (
              <Button 
                type="button" 
                variant="secondary" 
                onClick={onCancel}
                disabled={loading}
              >
                {cancelButtonText || defaultCancelText}
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={loading}
              className={!onCancel ? "w-full" : ""}
            >
              {loading ? (isEditMode ? "Updating..." : "Submitting...") : (submitButtonText || defaultSubmitText)}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 