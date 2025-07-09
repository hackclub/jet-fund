import Link from 'next/link';
import { Plane, Menu } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

/**
 * Header: Contains the logo (links to home), theme toggle, and mobile menu.
 * No navigation links. Uses clear, minimal Tailwind classes.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo (links to home) */}
          <Logo />

          {/* Actions: Theme toggle and mobile menu */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {/* Mobile menu placeholder for future expansion */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/">Home</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

/**
 * Logo: Jet Fund logo and title, links to home.
 */
function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
      <Plane size={32} className="text-primary" />
      <div>
        <h1 className="text-2xl font-bold text-primary">Jet Fund</h1>
        <p className="text-xs text-muted-foreground -mt-1">Flight stipends for hackathons</p>
      </div>
    </Link>
  );
} 