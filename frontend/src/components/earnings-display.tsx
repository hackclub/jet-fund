"use client";
import { useState, useEffect } from "react";
import { PiggyBank } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ReimbursementModal } from "@/components/reimbursement-modal";
import type { EarningsData } from "@/lib/db/earnings";

export function EarningsHeaderSummary() {
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReimbursementModal, setShowReimbursementModal] = useState(false);

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
      <span className="flex items-center gap-1 text-xs text-gray-500">
        <PiggyBank className="h-4 w-4 text-green-600" /> Loading...
      </span>
    );
  }
  
  if (!earningsData) return null;
  
  const totalEarnings = earningsData.approvedUsd + earningsData.pendingUsd;
  const progressPercentage = totalEarnings > 0 
    ? (earningsData.approvedUsd / totalEarnings) * 100 
    : 0;
    
  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-center gap-2 lg:gap-6 w-full max-w-2xl mx-auto">
        <span className="flex items-center gap-2 text-xs bg-muted px-2 py-1 rounded justify-center">
          <PiggyBank className="h-4 w-4 text-green-600" />
          <span>Approved: ${earningsData.approvedUsd.toFixed(2)}</span>
          <span className="text-muted-foreground">|</span>
          <span>Pending: ${earningsData.pendingUsd.toFixed(2)}</span>
        </span>
        <div className="flex items-center gap-2 w-full sm:w-auto sm:min-w-[160px] sm:max-w-[220px] justify-center">
          <Progress value={progressPercentage} className="h-2 w-full sm:w-32" variant="sparkly-gold" />
          <span className="text-[10px] text-gray-500 w-10 text-center">{progressPercentage.toFixed(1)}%</span>
        </div>
        <Button
          onClick={() => setShowReimbursementModal(true)}
          className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap w-full sm:w-auto text-center"
          style={{ maxWidth: '100%' }}
          variant="default"
        >
          Request Reimbursement
        </Button>
      </div>
      <ReimbursementModal open={showReimbursementModal} onOpenChange={setShowReimbursementModal} />
    </>
  );
} 