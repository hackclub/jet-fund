"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SessionForm from "@/components/session-form";
import type { Session } from "@/lib/db/types";

interface SessionEditModalProps {
  session: Session | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SessionEditModal({ 
  session, 
  isOpen, 
  onClose, 
  onSuccess 
}: SessionEditModalProps) {
  async function handleSubmit(data: { gitCommitUrl: string; imageUrl: string }) {
    if (!session) return;

    const res = await fetch(`/api/sessions/${session.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (res.ok && result.success) {
      onSuccess();
      onClose();
    } else {
      throw new Error(result.error || "Failed to update session");
    }
  }

  if (!session) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Rejected Session</DialogTitle>
        </DialogHeader>
        
        <SessionForm
          sessionId={session.id}
          mode="edit"
          initialData={{
            gitCommitUrl: session.gitCommitUrl,
            imageUrl: session.imageUrl,
          }}
          rejectionReason={session.rejectionReason}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
} 