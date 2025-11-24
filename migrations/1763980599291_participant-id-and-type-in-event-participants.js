/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  // Add 'type' column (user or child)

  pgm.addColumn('event_participants', {
    type: { type: 'varchar(16)', notNull: true, default: 'user' },
  });
  // Add CHECK constraint for type
  pgm.addConstraint('event_participants', 'event_participants_type_check', {
    check: `type IN ('user', 'child')`
  });

  // Rename 'user_id' to 'invitee_id'
  pgm.renameColumn('event_participants', 'user_id', 'invitee_id');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  // Rename 'invitee_id' back to 'user_id'
  pgm.renameColumn('event_participants', 'invitee_id', 'user_id');
  // Remove CHECK constraint first
  pgm.dropConstraint('event_participants', 'event_participants_type_check');
  // Remove 'type' column
  pgm.dropColumn('event_participants', 'type');
};
