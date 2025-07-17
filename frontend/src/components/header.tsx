"use client";
import { Menu, Settings, User, LogOut } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from './theme-toggle';
import { Button } from './ui/button'; 
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { EarningsHeaderSummary } from './earnings-display';
import { useSession, signOut } from "next-auth/react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import AccountSettings from "@/components/account-settings";


function Logo() {
  return (
    <Link
      href="/"
      className="flex flex-row items-center gap-2 hover:opacity-80 transition-opacity min-w-0 max-w-full"
    >
      <Image 
        src="/assets/Jet_Fund.png" 
        alt="Jet Fund Logo"
        width={60} 
        height={60} 
        className="shrink-0"
      />
      <div className="flex flex-col min-w-0">
        <h1 className="text-lg sm:text-2xl font-bold text-primary whitespace-nowrap flex-shrink">
          Jet Fund
        </h1>
        <p className="text-[10px] sm:text-xs text-muted-foreground -mt-1 leading-tight hidden xs:block">
          Flight stipends for hackathons
        </p>
      </div>
    </Link>
  );
}

export function Header() {
  const { data: session } = useSession();
  const [showAccountSettings, setShowAccountSettings] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top row: logo and actions (desktop), logo and menu (mobile) */}
        <div className="flex h-16 items-center justify-between gap-4 w-full max-w-5xl mx-auto">
          {/* Logo (links to home) */}
          <Logo />

          {/* Desktop: Actions and stipend summary */}
          <div className="hidden md:flex items-center flex-1 justify-center">
            <EarningsHeaderSummary />
          </div>

          {/* Desktop: Actions */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            {session?.user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <User className="h-5 w-5" />
                      <span className="sr-only">Account menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2 border-b mb-1">
                      <div className="font-medium truncate text-sm">{session.user.name || session.user.email}</div>
                      <div className="text-xs text-muted-foreground truncate">{session.user.email}</div>
                    </div>
                    <DropdownMenuItem onClick={() => setShowAccountSettings(true)}>
                      <Settings className="w-4 h-4 mr-2" />
                      Account Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => signOut()}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Dialog open={showAccountSettings} onOpenChange={setShowAccountSettings}>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogTitle>Account Settings</DialogTitle>
                    <AccountSettings onClose={() => setShowAccountSettings(false)} />
                  </DialogContent>
                </Dialog>
              </>
            ) : null}
          </div>

          {/* Mobile: Hamburger menu with all actions inside */}
          <div className="md:hidden flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/">Home</Link>
                </DropdownMenuItem>
                {/* Centered theme toggle */}
                <div className="flex justify-center items-center py-2">
                  <ThemeToggle />
                </div>
                {session?.user && (
                  <>
                    <DropdownMenuItem onClick={() => setShowAccountSettings(true)}>
                      <Settings className="w-4 h-4 mr-2" />
                      Account Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => signOut()}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={showAccountSettings} onOpenChange={setShowAccountSettings}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogTitle>Account Settings</DialogTitle>
                <AccountSettings onClose={() => setShowAccountSettings(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        {/* Mobile: stipend summary below nav */}
        <div className="flex md:hidden flex-col items-center py-2 gap-2">
          <EarningsHeaderSummary />
        </div>
      </div>
    </header>
  );
}