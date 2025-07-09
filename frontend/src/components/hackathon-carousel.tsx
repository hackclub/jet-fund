import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface Hackathon {
  id: string;
  name: string;
  website: string;
  start: string;
  end: string;
  logo: string;
  banner: string;
  city?: string;
  state?: string;
  country?: string;
  virtual: boolean;
  hybrid: boolean;
}

/**
 * HackathonCarousel: Fetches and displays in-person hackathons in a horizontal scrollable carousel.
 */
export function HackathonCarousel() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHackathons() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/hackathons');
        const data: Hackathon[] = await res.json();
        // Filter for in-person events only
        const inPerson = data.filter(h => !h.virtual && !h.hybrid);
        setHackathons(inPerson);
      } catch (e) {
        setError('Failed to load hackathons.');
      } finally {
        setLoading(false);
      }
    }
    fetchHackathons();
  }, []);

  return (
    <section className="my-10">
      <h2 className="text-xl font-bold mb-2 text-center">
        Jet Fund allows you to go to any community-ran hackathon on{' '}
        <a href="https://hackathons.hackclub.com/" target="_blank" rel="noopener noreferrer" className="underline text-primary">hackathons.hackclub.com</a>
      </h2>
      {loading ? (
        <div className="text-center py-8">Loading hackathons...</div>
      ) : error ? (
        <div className="text-center text-destructive py-8">{error}</div>
      ) : hackathons.length === 0 ? (
        <div className="text-center py-8">No in-person hackathons found.</div>
      ) : (
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-6 min-w-[320px]" style={{scrollSnapType: 'x mandatory'}}>
            {hackathons.map(h => (
              <HackathonCard key={h.id} hackathon={h} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

// Helper to proxy images through images.weserv.nl for faster loading
function weservUrl(url: string, width = 400, height = 160) {
  // Remove protocol for weserv
  const cleanUrl = url.replace(/^https?:\/\//, '');
  return `https://images.weserv.nl/?url=${encodeURIComponent(cleanUrl)}&w=${width}&h=${height}&fit=cover`;
}

/**
 * HackathonCard: Displays a single hackathon's info in a shadcn-ui Card.
 */
function HackathonCard({ hackathon }: { hackathon: Hackathon }) {
  // Skeleton loader state
  const [imgLoaded, setImgLoaded] = useState(false);
  const [weservError, setWeservError] = useState(false);
  const [directError, setDirectError] = useState(false);
  const rawImg = hackathon.banner || hackathon.logo;
  const weservImg = weservUrl(rawImg);

  // Decide which image src to use
  let imgSrc = !weservError ? weservImg : (!directError ? rawImg : undefined);

  return (
    <Card className="w-80 flex-shrink-0 scroll-snap-align-start">
      <CardHeader>
        <CardTitle className="text-lg font-semibold truncate">{hackathon.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <a href={hackathon.website} target="_blank" rel="noopener noreferrer" className="block w-full h-32 mb-2 relative">
          {/* Skeleton loader or placeholder */}
          {!imgLoaded && !directError && (
            <div className="absolute inset-0 w-full h-full bg-muted animate-pulse rounded flex items-center justify-center">
              {/* If both images fail, show a placeholder icon */}
              {weservError && directError && (
                <span className="text-muted-foreground text-2xl">🏁</span>
              )}
            </div>
          )}
          {imgSrc && (
            <img
              src={imgSrc}
              alt={hackathon.name}
              className={cn(
                "w-full h-32 object-cover rounded transition-opacity",
                imgLoaded ? "opacity-100" : "opacity-0"
              )}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={() => {
                if (!weservError) setWeservError(true);
                else setDirectError(true);
              }}
              style={{ position: 'absolute', top: 0, left: 0 }}
            />
          )}
        </a>
        <div className="text-sm mb-2">
          <span className="block font-medium">
            {hackathon.city && hackathon.country
              ? `${hackathon.city}${hackathon.state ? ', ' + hackathon.state : ''}, ${hackathon.country}`
              : 'Location TBA'}
          </span>
          <span className="block text-muted-foreground">
            {formatDateRange(hackathon.start, hackathon.end)}
          </span>
        </div>
        <Button asChild variant="outline" className="w-full mt-2">
          <a href={hackathon.website} target="_blank" rel="noopener noreferrer">
            Learn More
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * formatDateRange: Formats start and end ISO strings as a readable date range.
 */
function formatDateRange(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  if (startDate.toDateString() === endDate.toDateString()) {
    return startDate.toLocaleDateString(undefined, options);
  }
  return `${startDate.toLocaleDateString(undefined, options)} - ${endDate.toLocaleDateString(undefined, options)}`;
} 