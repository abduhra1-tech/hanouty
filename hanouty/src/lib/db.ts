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

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  created_at?: string;
}

export interface Sale {
  id: number;
  total: number;
  items: number;
  created_at: string;
}

export async function getProducts(): Promise<Product[]> {
  const database = await getDb();
  return database.select<Product[]>("SELECT * FROM products ORDER BY id DESC");
}

export async function addProduct(name: string, price: number, stock: number = 0): Promise<void> {
  const database = await getDb();
  await database.execute(
    "INSERT INTO products (name, price, stock) VALUES (?, ?, ?)",
    [name, price, stock]
  );
}

export async function updateProduct(id: number, name: string, price: number, stock: number): Promise<void> {
  const database = await getDb();
  await database.execute(
    "UPDATE products SET name = ?, price = ?, stock = ? WHERE id = ?",
    [name, price, stock, id]
  );
}

export async function deleteProduct(id: number): Promise<void> {
  const database = await getDb();
  await database.execute("DELETE FROM products WHERE id = ?", [id]);
}

export async function getSales(): Promise<Sale[]> {
  const database = await getDb();
  return database.select<Sale[]>("SELECT * FROM sales ORDER BY id DESC");
}

export async function addSale(total: number, items: number): Promise<void> {
  const database = await getDb();
  await database.execute(
    "INSERT INTO sales (total, items) VALUES (?, ?)",
    [total, items]
  );
}

export interface Setting {
  key: string;
  value: string;
}

export async function getSettings(): Promise<Setting[]> {
  const database = await getDb();
  return database.select<Setting[]>("SELECT * FROM settings");
}

export async function updateSetting(key: string, value: string): Promise<void> {
  const database = await getDb();
  await database.execute(
    "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
    [key, value]
  );
}
