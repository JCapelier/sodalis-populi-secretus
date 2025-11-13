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
  pgm.createTable('events', {
    id: 'id',
    title: { type: 'varchar(255)', notNull: true },
    description: { type: 'text' },
    starts_at: { type: 'timestamp', notNull: true },
    ends_at: { type: 'timestamp' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  exports.down = (pgm) => {
  pgm.dropTable('events');
};
};
