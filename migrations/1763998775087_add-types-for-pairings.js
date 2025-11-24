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
  pgm.addColumn('pairings', {
    giver_type: { type: 'varchar(16)', notNull: true, default: 'user' }
  });
  pgm.addConstraint('pairings', 'pairings_giver_type_check', {
    check: `giver_type IN ('user', 'child')`
  });

  pgm.addColumn('pairings', {
    receiver_type: { type: 'varchar(16)', notNull: true, default: 'user' }
  });
  pgm.addConstraint('pairings', 'pairings_receiver_type_check', {
    check: `receiver_type IN ('user', 'child')`
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {};
