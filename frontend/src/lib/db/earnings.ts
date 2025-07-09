import { getProjectsByUserId } from "./project";
import { getTotalTimeForProject } from "./session";
import { getUserByRecordId } from "./user";

const HOURS_TO_USD = 5; // Constant for converting hours to USD

export interface EarningsData {
  approvedUsd: number;
  pendingUsd: number;
}

/**
 * Calculate earnings data for a user
 * @param userId Airtable user record ID
 * @returns Object with approvedUsd and pendingUsd values
 */
export async function getEarningsData(userId: string): Promise<EarningsData> {
  try {
    const projects = await getProjectsByUserId(userId);
    const user = await getUserByRecordId(userId);
    
    if (!user) {
      return {
        approvedUsd: 0,
        pendingUsd: 0,
      };
    }
    
    let approvedUsd = 0;
    let pendingUsd = 0;
    
    for (const project of projects) {
      // Use total hours directly from the Project's hoursSpent rollup field
      const totalHours = project.hoursSpent || 0;
      const projectValue = totalHours * HOURS_TO_USD;
      
      // Add to approved USD (only approved projects)
      if (project.status === "approved") {
        approvedUsd += projectValue;
      }
      // Add to pending USD (only submitted/finished projects awaiting approval)
      else if (project.status === "finished") {
        pendingUsd += projectValue;
      }
    }
    
    // Subtract spent USD from approved earnings only
    const spentUsd = user.spentUsd || 0;
    approvedUsd = Math.max(0, approvedUsd - spentUsd);
    // Don't subtract spentUsd from pendingUsd since pending projects haven't been paid out yet
    
    return {
      approvedUsd: Math.round(approvedUsd * 100) / 100, // Round to 2 decimal places
      pendingUsd: Math.round(pendingUsd * 100) / 100, // Round to 2 decimal places
    };
  } catch (err) {
    console.error("Error calculating earnings data:", err);
    return {
      approvedUsd: 0,
      pendingUsd: 0,
    };
  }
} 