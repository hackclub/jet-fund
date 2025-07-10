"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { HelpCircle } from "lucide-react";

export function HelpModal() {
  const [open, setOpen] = useState(false);

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
              Here’s how it works:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <b>Log Your Work:</b> Create a project and use the session timer
                to log your coding hours.
              </li>
              <li>
                <b>Submit Proof:</b> At the end of each session, provide a Git
                commit link and a screenshot.
              </li>
              <li>
                <b>Ship Your Project:</b> When you're ready, submit your project
                for approval.
              </li>
              <li>
                <b>Get Reimbursed:</b> Once approved, you'll receive funds in
                your account that can be used to reimburse travel expenses
              </li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
