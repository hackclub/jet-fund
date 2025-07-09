import { Settings } from 'lucide-react';
import { Button } from './ui/button';

/**
 * AccountSettingsButton: Large button to open the Account Settings modal.
 * Props: onClick (function)
 */
export function AccountSettingsButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="outline"
      size="lg"
      className="w-full flex items-center justify-start gap-4 py-6 px-6 text-left rounded-xl border-2 border-muted hover:border-primary transition-colors shadow-sm"
      onClick={onClick}
    >
      <Settings className="w-6 h-6 text-muted-foreground" />
      <div>
        <div className="text-base font-semibold">Account Settings</div>
        <div className="text-xs text-muted-foreground">Manage your profile and preferences</div>
      </div>
    </Button>
  );
} 