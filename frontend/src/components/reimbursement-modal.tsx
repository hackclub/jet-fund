import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ReimbursementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReimbursementModal({ open, onOpenChange }: ReimbursementModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Reimbursement</DialogTitle>
          <DialogDescription>
            The reimbursement flow isn't yet implemented, but should be soon. If you need to convert your funds to a reimbursement right now, message @Angad Behl
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 