import cron from 'node-cron';
import { eventRepository } from '../src/repositories/EventRepository';

console.log('closeExpiredEvents scheduler started at', new Date().toISOString());

cron.schedule('0 0 * * *', async () => {
  const now = new Date();
  const expiredEvents = await eventRepository.findExpiredEvents(now);

  for (const event of expiredEvents) {
    await eventRepository.updateStatusToClosed(event.id);
  }

  console.log(
    `Closed ${expiredEvents.length} expired events at ${now.toISOString()}`
  );
}, {
  timezone: 'Europe/Paris'
});
