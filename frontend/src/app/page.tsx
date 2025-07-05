"use client";
import { Plane } from "lucide-react";
import SignIn from "@/components/sign-in";
import { SessionProvider } from "next-auth/react";
export default function Home() {
  return (
    <div className="min-h-screen p-0 m-0 bg-white">
      <div className="flex justify-center items-center h-screen">
        <SessionProvider>
          <SignIn />
        </SessionProvider>
      </div>
    </div>
  );
} 
