import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { base, USERS_TABLE } from "@/lib/db/airtable"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
