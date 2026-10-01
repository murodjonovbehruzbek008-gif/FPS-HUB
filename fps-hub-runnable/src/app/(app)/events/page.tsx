'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';

interface EventItem {
  id: string;
  title: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt: string | null;
  organizer: string;
  club?: { name: string; slug: string; iconEmoji: string } | null;
  attendeeCount: number;
  myRsvp: 'INTERESTED' | 'GOING' | 'NOT_GOING' | null;
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/events')
      .then((r) => r.json())
      .then((d) => setEvents(d.events ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function handleRsvp(eventId: string, status: 'GOING' | 'INTERESTED' | 'NOT_GOING') {
    const res = await fetch(`/api/events/${eventId}/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const { status: s, attendeeCount } = await res.json();
      setEvents((prev) => prev.map((e) => e.id === eventId ? { ...e, myRsvp: s, attendeeCount } : e));
    }
  }

  const now = new Date();
  const upcoming = events.filter((e) => new Date(e.startsAt) >= now);
  const past = events.filter((e) => new Date(e.startsAt) < now);

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[hsl(var(--fg))]">Events</h1>
        <p className="text-sm text-[hsl(var(--fg-muted))]">Upcoming school events and activities</p>
      </div>

      {upcoming.length === 0 && past.length === 0 ? (
        <div className="text-center py-16 text-[hsl(var(--fg-muted))]">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No events scheduled yet.</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section className="mb-8">
              <h2 className="text-sm font-semibold text-[hsl(var(--fg-muted))] uppercase tracking-wide mb-3">Upcoming</h2>
              <div className="space-y-4">
                {upcoming.map((event) => <EventCard key={event.id} event={event} onRsvp={handleRsvp} />)}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-[hsl(var(--fg-muted))] uppercase tracking-wide mb-3">Past Events</h2>
              <div className="space-y-4 opacity-75">
                {past.map((event) => <EventCard key={event.id} event={event} onRsvp={handleRsvp} isPast />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function EventCard({ event, onRsvp, isPast }: { event: EventItem; onRsvp: (id: string, status: 'GOING' | 'INTERESTED' | 'NOT_GOING') => void; isPast?: boolean }) {
  const start = new Date(event.startsAt);
  const month = start.toLocaleString('en', { month: 'short' }).toUpperCase();
  const day = start.getDate();

  return (
    <div className={cn('card p-4 flex gap-4', isPast && 'opacity-70')}>
      {/* Date badge */}
      <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-[hsl(var(--brand)/0.1)] flex flex-col items-center justify-center">
        <span className="text-[10px] font-bold text-[hsl(var(--brand))] uppercase">{month}</span>
        <span className="text-xl font-bold text-[hsl(var(--brand))] leading-none">{day}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-sm text-[hsl(var(--fg))]">{event.title}</h3>
          {event.club && (
            <Link href={`/clubs/${event.club.slug}`} className="flex-shrink-0 text-xs text-[hsl(var(--brand))] hover:underline">
              {event.club.iconEmoji} {event.club.name}
            </Link>
          )}
        </div>

        <p className="text-xs text-[hsl(var(--fg-muted))] line-clamp-2 mb-2">{event.description}</p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[hsl(var(--fg-muted))] mb-3">
          <span className="flex items-center gap-1"><Clock size={11} />
            {start.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
          </span>
          {event.location && <span className="flex items-center gap-1"><MapPin size={11} />{event.location}</span>}
          <span className="flex items-center gap-1"><Users size={11} />{event.attendeeCount} going</span>
        </div>

        {!isPast && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={event.myRsvp === 'GOING' ? 'primary' : 'secondary'}
              onClick={() => onRsvp(event.id, 'GOING')}
              className="text-xs"
            >
              {event.myRsvp === 'GOING' ? '✓ Going' : "I'm going"}
            </Button>
            <Button
              size="sm"
              variant={event.myRsvp === 'INTERESTED' ? 'secondary' : 'ghost'}
              onClick={() => onRsvp(event.id, 'INTERESTED')}
              className="text-xs"
            >
              Interested
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
