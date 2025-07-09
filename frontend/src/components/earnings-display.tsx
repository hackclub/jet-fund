"use client";
import { useState, useEffect } from "react";
import { PiggyBank } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

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
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-500">Loading earnings...</span>
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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PiggyBank className="h-5 w-5 text-green-600" />
          Available stipends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Approved: ${earningsData.approvedUsd.toFixed(2)}</span>
            <span>Pending approval: ${earningsData.pendingUsd.toFixed(2)}</span>
          </div>
          <Progress value={progressPercentage} className="w-full" variant="sparkly-gold" />
          <div className="text-xs text-gray-500 text-center">
            {progressPercentage.toFixed(1)}% of total earnings approved
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 