import Database from "@tauri-apps/plugin-sql";

let db: Database | null = null;

export async function initDatabase(): Promise<Database> {
  if (db) return db;

  db = await Database.load("sqlite:hanouty.db");

  await db.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      stock INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total REAL NOT NULL,
      items INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  const settings = await db.select<{ key: string }[]>(
    "SELECT key FROM settings LIMIT 1"
  );
  if (settings.length === 0) {
    await db.execute(
      "INSERT INTO settings (key, value) VALUES ('shop_name', 'Hanouty')"
    );
    await db.execute(
      "INSERT INTO settings (key, value) VALUES ('language', 'fr')"
    );
    await db.execute(
      "INSERT INTO settings (key, value) VALUES ('currency', 'MAD')"
    );
  }

  return db;
}

export async function getDb(): Promise<Database> {
  if (!db) {
    return initDatabase();
  }
  return db;
}
