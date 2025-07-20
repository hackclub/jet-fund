import { useEffect, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import Image from 'next/image';

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
      } catch {
        setError('Failed to load hackathons.');
      } finally {
        setLoading(false);
      }
    }
    fetchHackathons();
  }, []);

  return (
    <section className="my-6">
      {loading ? (
        <div className="text-center py-4">Loading hackathons...</div>
      ) : error ? (
        <div className="text-center text-destructive py-4">{error}</div>
      ) : hackathons.length === 0 ? (
        <div className="text-center py-4">No in-person hackathons found.</div>
      ) : (
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-4 min-w-[320px]" style={{scrollSnapType: 'x mandatory'}}>
            {hackathons.map(h => (
              <HackathonCard key={h.id} hackathon={h} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}



/**
 * HackathonCard: Displays a single hackathon's info in a shadcn-ui Card.
 */
function HackathonCard({ hackathon }: { hackathon: Hackathon }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const imgSrc = hackathon.banner || hackathon.logo;

  return (
    <Card className="w-64 flex-shrink-0 scroll-snap-align-start overflow-hidden p-0">
      {/* Image section */}
      <div className="relative h-36 w-full flex items-end justify-start bg-muted">
        {/* Skeleton loader */}
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 w-full h-full bg-muted animate-pulse flex items-center justify-center z-10">
            <span className="text-muted-foreground text-lg">&nbsp;</span>
          </div>
        )}
        {/* Actual image */}
        {imgSrc && !imgError && (
          <Image
            src={imgSrc}
            alt={hackathon.name}
            fill
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            className={imgLoaded ? 'transition-opacity duration-300 opacity-100' : 'opacity-0'}
            priority={false}
          />
        )}
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-black/40 z-10" aria-hidden="true" />
        {/* Content overlay: name, date, location */}
        <div className="relative z-20 p-3 w-full flex flex-col gap-1">
          <span className="text-white text-lg font-bold drop-shadow-md truncate">{hackathon.name}</span>
          <span className="text-white text-xs font-medium drop-shadow-md truncate">
            {hackathon.city && hackathon.country
              ? `${hackathon.city}${hackathon.state ? ', ' + hackathon.state : ''}, ${hackathon.country}`
              : 'Location TBA'}
          </span>
          <span className="text-white text-xs drop-shadow-md">
            {formatDateRange(hackathon.start, hackathon.end)}
          </span>
        </div>
      </div>
      {/* Only the button below the image */}
      <CardContent className="pt-3 pb-4 px-4">
        <Button asChild variant="outline" size="sm" className="w-full">
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