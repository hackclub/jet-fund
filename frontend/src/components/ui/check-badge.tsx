import { Badge } from "@/components/ui/badge";
import { CheckIcon } from "lucide-react";
import React from "react";

interface CheckBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export default function CheckBadge({ children, className }: CheckBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={`bg-green-500 text-white dark:bg-green-600 flex items-center gap-1 ${className || ""}`}
    >
      <CheckIcon className="w-4 h-4" />
      {children}
    </Badge>
  );
} 