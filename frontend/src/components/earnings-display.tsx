"use client";
import { useState, useEffect } from "react";
import { PiggyBank } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface EarningsData {
  approvedUsd: number;
  pendingUsd: number;
}

export default function EarningsDisplay() {
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const response = await fetch("/api/earnings");
        if (response.ok) {
          const data = await response.json();
          setEarningsData(data);
        }
      } catch (error) {
        console.error("Error fetching earnings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2">
            <PiggyBank className="h-4 w-4 text-green-600" />
            <span className="text-xs text-gray-500">Loading earnings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!earningsData) {
    return null;
  }

  const totalEarnings = earningsData.approvedUsd + earningsData.pendingUsd;
  const progressPercentage = totalEarnings > 0 
    ? (earningsData.approvedUsd / totalEarnings) * 100 
    : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <PiggyBank className="h-4 w-4 text-green-600" />
          Available stipends
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex justify-between text-xs">
            <span>Approved: ${earningsData.approvedUsd.toFixed(2)}</span>
            <span>Pending: ${earningsData.pendingUsd.toFixed(2)}</span>
          </div>
          <Progress value={progressPercentage} className="w-full" variant="sparkly-gold" />
          <div className="text-xs text-gray-500 text-center">
            {progressPercentage.toFixed(1)}% approved
          </div>
          <div className="flex justify-center">
            <Button asChild variant="default" size="sm">
              <a href="https://example.com" target="_blank" rel="noopener noreferrer">
                Request Reimbursement
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 