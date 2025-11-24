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
  pgm.dropTable('children')
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.createTable('children', {
    id: 'id',
    parent_id: {
      type: 'integer',
      notNull: true,
      references: 'users(id)',
      onDelete: 'cascade'
    },
    username: {type: 'varchar(255)', notNull: true},
    other_parent_id: {
      type: 'integer',
      references: 'users(id)',
      delete: 'set null',
    }
  })
};
