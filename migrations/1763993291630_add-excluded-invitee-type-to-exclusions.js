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
  pgm.addColumn('exclusions', {
    invitee_type: { type: 'varchar(16)', notNull: true, default: 'user' },
    excluded_invitee_type: { type: 'varchar(16)', notNull: true, default: 'user' },
  });

  pgm.addConstraint('exclusions', 'exclusions_invitee_type_check', {
    check: `invitee_type IN ('user', 'child')`
  });
  pgm.addConstraint('exclusions', 'exclusions_excluded_invitee_type_check', {
    check: `excluded_invitee_type IN ('user', 'child')`
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropConstraint('exclusions', 'exclusions_invitee_type_check');
  pgm.dropConstraint('exclusions', 'exclusions_excluded_invitee_type_check');
  pgm.dropColumn('exclusions', 'invitee_type');
  pgm.dropColumn('exclusions', 'excluded_invitee_type');
};
