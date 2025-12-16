/**
 * Migration to add status restrictions to events and event_participants tables
 * @type {import('node-pg-migrate').MigrationBuilder}
 */

export const up = (pgm) => {
  // Add CHECK constraint for event status
  pgm.addConstraint('events', 'events_status_check', {
    check: "status IN ('pending', 'active', 'closed')"
  });

  // Add CHECK constraint for event_participants status
  pgm.addConstraint('event_participants', 'event_participants_status_check', {
    check: "status IN ('invited', 'notified')"
  });
};

export const down = (pgm) => {
  pgm.dropConstraint('events', 'events_status_check');
  pgm.dropConstraint('event_participants', 'event_participants_status_check');
};
