/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const up = (pgm) => {
  // Add ends_at (date) to events
  pgm.addColumn("events", {
    ends_at: {
      type: "date",
      notNull: false,
    },
  });

  // Add status to event_participants
  // Example statuses you can use in the app: 'invited', 'drafted', 'completed'
  pgm.addColumn("event_participants", {
    status: {
      type: "varchar(50)",
      notNull: true,
      default: "invited",
    },
  });
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const down = (pgm) => {
  pgm.dropColumn("event_participants", "status");
  pgm.dropColumn("events", "ends_at");
};
