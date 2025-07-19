export interface HackatimeProject {
  name: string;
  total_seconds: number;
  text: string;
  hours: number;
  minutes: number;
  percent: number;
  digital: string;
}

export interface HackatimeUserStats {
  username: string;
  user_id: string;
  is_coding_activity_visible: boolean;
  is_other_usage_visible: boolean;
  status: string;
  start: string;
  end: string;
  range: string;
  human_readable_range: string;
  total_seconds: number;
  daily_average: number;
  human_readable_total: string;
  human_readable_daily_average: string;
  projects: HackatimeProject[];
}

export interface HackatimeResponse {
  data: HackatimeUserStats;
  trust_factor: {
    trust_level: string;
    trust_value: number;
  };
}

const HACKATIME_BASE_URL = "https://hackatime.hackclub.com/api/v1";

/**
 * Fetch user stats from Hackatime API using Slack ID
 */
export async function fetchHackatimeUserStats(slackId: string): Promise<HackatimeResponse | null> {
  try {
    const response = await fetch(`${HACKATIME_BASE_URL}/users/${slackId}/stats?features=projects`);
    
    if (!response.ok) {
      console.error(`Hackatime API error: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data: HackatimeResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching Hackatime user stats:", error);
    return null;
  }
}

/**
 * Get a specific project from Hackatime user stats
 */
export function getHackatimeProject(stats: HackatimeUserStats, projectName: string): HackatimeProject | null {
  return stats.projects.find(project => project.name === projectName) || null;
} 