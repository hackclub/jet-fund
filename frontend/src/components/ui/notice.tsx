import * as React from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

interface NoticeProps {
  variant?: "success" | "warning" | "info" | "destructive"
  title?: string
  children: React.ReactNode
  className?: string
}

const noticeVariants = {
  success: "text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800 [&>svg]:text-green-600 dark:text-green-400",
  warning: "text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-950 dark:border-yellow-800 [&>svg]:text-yellow-600 dark:text-yellow-400",
  info: "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950 dark:border-blue-800 [&>svg]:text-blue-600 dark:text-blue-400",
  destructive: "text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90",
}

export function Notice({ variant = "warning", title, children, className }: NoticeProps) {
  // Don't render if no children are provided
  if (!children) {
    return null
  }

  return (
    <Alert className={cn(noticeVariants[variant], className)}>
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  )
} 