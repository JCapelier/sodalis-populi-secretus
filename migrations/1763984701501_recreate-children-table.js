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
	pgm.createTable('children', {
		id: {
			type: 'serial',
			primaryKey: true,
		},
		parent_id: {
			type: 'integer',
			notNull: true,
			references: 'users(id)',
			onDelete: 'CASCADE',
		},
		username: {
			type: 'varchar(64)',
			notNull: true,
		},
		other_parent_id: {
			type: 'integer',
			references: 'users(id)',
			onDelete: 'SET NULL',
		},
	});
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
	pgm.dropTable('children');
};
