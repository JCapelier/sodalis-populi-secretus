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

  pgm.addColumn('exclusions', {
    type: { type: 'varchar(16)', notNull: true, default: 'user' },
  });
  // Add CHECK constraint for type
  pgm.addConstraint('exclusions', 'exclusions_type_check', {
    check: `type IN ('user', 'child')`
  });

  // Rename 'user_id' to 'invitee_id'
  pgm.renameColumn('exclusions', 'user_id', 'invitee_id');
  pgm.renameColumn('exclusions', 'excluded_user_id', 'excluded_invitee_id')
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  // Rename 'invitee_id' back to 'user_id'
  pgm.renameColumn('exclusions', 'invitee_id', 'user_id');
  pgm.renameColumn('exclusions', 'excluded_invitee_id', 'excluded_user_id')
  // Remove CHECK constraint first
  pgm.dropConstraint('exclusions', 'exclusions_type_check');
  // Remove 'type' column
  pgm.dropColumn('exclusions', 'type');
};
