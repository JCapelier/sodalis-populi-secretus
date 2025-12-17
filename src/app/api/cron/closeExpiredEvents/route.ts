import { eventRepository } from '@/repositories/EventRepository';

export async function GET() {
  const now = new Date();
  const expiredEvents = await eventRepository.findExpiredEvents(now);

  for (const event of expiredEvents) {
    await eventRepository.updateStatusToClosed(event.id);
  }

  const message = `Closed ${expiredEvents.length} expired events at ${now.toISOString()}`;
  console.log(message);

  return new Response(JSON.stringify({ closed: expiredEvents.length, timestamp: now.toISOString() }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
