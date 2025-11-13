/**
 * @type {import('node-pg-migrate').ColumnDefinitions}
 */
export const shorthands = {
  id: {
    type: "serial",
    primaryKey: true,
  },
  timestamps: {
    created_at: {
      type: "timestamp",
      notNull: true,
      default: { raw: "CURRENT_TIMESTAMP" },
    },
    updated_at: {
      type: "timestamp",
      notNull: true,
      default: { raw: "CURRENT_TIMESTAMP" },
    }
  }
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const up = (pgm) => {
  // USERS
  pgm.createTable("users", {
    id: "id",
    email: { type: "varchar(255)", notNull: true, unique: true },
    name: { type: "varchar(255)", notNull: true },
    password_hash: { type: "text", notNull: true },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp")
    },
  });

  // EVENTS
  pgm.createTable("events", {
    id: "id",
    name: { type: "varchar(255)", notNull: true },
    admin_id: {
      type: "integer",
      notNull: true,
      references: "users(id)",
      onDelete: "cascade",
    },
    status: {
      type: "varchar(50)",
      notNull: true,
      default: "pending",
    },
    price_limit_cents: { type: "integer" },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp")
    },
  });

  // EVENT PARTICIPANTS
  pgm.createTable("event_participants", {
    id: "id",
    event_id: {
      type: "integer",
      notNull: true,
      references: "events(id)",
      onDelete: "cascade",
    },
    user_id: {
      type: "integer",
      notNull: true,
      references: "users(id)",
      onDelete: "cascade",
    },
    display_name: { type: "varchar(255)", notNull: true },
    email: { type: "varchar(255)", notNull: true },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp")
    },
  });

  // EXCLUSIONS (users who cannot gift each other)
  pgm.createTable("exclusions", {
    id: "id",
    event_id: {
      type: "integer",
      notNull: true,
      references: "events(id)",
      onDelete: "cascade",
    },
    user_id: {
      type: "integer",
      notNull: true,
      references: "users(id)",
      onDelete: "cascade",
    },
    excluded_user_id: {
      type: "integer",
      notNull: true,
      references: "users(id)",
      onDelete: "cascade",
    },
  });

  // PAIRINGS (gift assignments)
  pgm.createTable("pairings", {
    id: "id",
    event_id: {
      type: "integer",
      notNull: true,
      references: "events(id)",
      onDelete: "cascade",
    },
    giver_id: {
      type: "integer",
      notNull: true,
      references: "users(id)",
      onDelete: "cascade",
    },
    receiver_id: {
      type: "integer",
      notNull: true,
      references: "users(id)",
      onDelete: "cascade",
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp")
    },
  });
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const down = (pgm) => {
  pgm.dropTable("pairings");
  pgm.dropTable("exclusions");
  pgm.dropTable("event_participants");
  pgm.dropTable("events");
  pgm.dropTable("users");
};
