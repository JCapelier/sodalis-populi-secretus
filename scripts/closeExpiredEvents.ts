import 'dotenv/config';
import cron from 'node-cron';
import { eventRepository } from '../src/repositories/EventRepository';

async function closeExpiredEventsOnce() {
  const now = new Date();
  const expiredEvents = await eventRepository.findExpiredEvents(now);
  for (const event of expiredEvents) {
    await eventRepository.updateStatusToClosed(event.id);
  }
  console.log(`Closed ${expiredEvents.length} expired events at ${now.toISOString()}`);
}

console.log('closeExpiredEvents scheduler started at', new Date().toISOString());

await closeExpiredEventsOnce();

cron.schedule('0 0 * * *', closeExpiredEventsOnce, { timezone: 'Europe/Paris' });
