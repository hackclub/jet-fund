"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { HelpCircle } from "lucide-react";
import { ReimbursementModal } from "@/components/reimbursement-modal";

export function HelpModal() {
  const [open, setOpen] = useState(false);
  const [reimbursementOpen, setReimbursementOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-background/80 rounded-full p-2 shadow-md hover:bg-background/90 transition-colors"
        aria-label="Open help modal"
        type="button"
      >
        <HelpCircle className="w-6 h-6 text-primary" />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogTitle>How Jet Fund Works</DialogTitle>
          <div className="space-y-3 text-muted-foreground text-sm">
            <p>
              Jet Fund is a{" "}
              <a
                href="https://hackclub.com"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Hack Club
              </a>{" "}
              program providing travel stipends for high school hackathons.
              Here's how it works:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <b>Log Your Work:</b> Create a project and track your coding hours using either:
                <ul className="list-disc space-y-1 pl-5 mt-1">
                  <li>
                    <b>Hackatime:</b> Connect your project to{" "}
                    <a
                      href="https://hackatime.hackclub.com/"
                      className="text-primary hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Hackatime
                    </a>{" "}
                    for automatic time tracking (manual sessions disabled)
                  </li>
                  <li>
                    <b>Manual Sessions:</b> Use the session timer to manually log your coding hours (when not connected to Hackatime)
                  </li>
                </ul>
              </li>
              <li>
                <b>Submit Proof:</b> At the end of each session, provide a Git
                commit link and a screenshot (only required for manual sessions).
              </li>
              <li>
                <b>Ship Your Project:</b> When you&apos;re ready, submit your project
                for approval.
              </li>
              <li>
                <b>Get Reimbursed:</b> Once approved, you&apos;ll receive funds in
                your account that can be used to{" "}
                <button
                  onClick={() => setReimbursementOpen(true)}
                  className="text-primary hover:underline bg-transparent border-none p-0 cursor-pointer"
                >
                  reimburse travel expenses
                </button>
              </li>
            </ul>
            <p>Need help? DM @Angad Behl on the Hack Club Slack or email <a href="mailto:angad@hackclub.com">angad@hackclub.com</a></p>
          </div>
        </DialogContent>
      </Dialog>
      <ReimbursementModal open={reimbursementOpen} onOpenChange={setReimbursementOpen} />
    </>
  );
}
