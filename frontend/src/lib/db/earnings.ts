import { getProjectsByUserId } from "./project";
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
      const pendingHours = project.pendingHours || 0;
      const approvedHours = project.approvedHours || 0;
      if (project.status === "approved") {
        approvedUsd += approvedHours * HOURS_TO_USD;
        pendingUsd += pendingHours * HOURS_TO_USD;
      } else {
        pendingUsd += (pendingHours + approvedHours) * HOURS_TO_USD;
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