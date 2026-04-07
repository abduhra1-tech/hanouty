mod db;

use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Product {
    pub id: i32,
    pub name: String,
    pub price: f64,
    pub stock: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Sale {
    pub id: i32,
    pub total: f64,
    pub sale_date: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SaleItem {
    pub product_id: i32,
    pub product_name: String,
    pub quantity: i32,
    pub price: f64,
    pub total: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NewSale {
    pub items: Vec<SaleItem>,
    pub total: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SaleHistoryItem {
    pub id: i32,
    pub total: f64,
    pub date: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Setting {
    pub key: String,
    pub value: String,
}

fn get_conn() -> Result<Connection, String> {
    Connection::open("hanouty.db").map_err(|e| e.to_string())
}

#[tauri::command]
fn get_products() -> Result<Vec<Product>, String> {
    let conn = get_conn()?;
    let mut stmt = conn.prepare("SELECT id, name, price, stock FROM products ORDER BY id DESC")
        .map_err(|e| e.to_string())?;
    let products = stmt.query_map([], |row| {
        Ok(Product {
            id: row.get(0)?,
            name: row.get(1)?,
            price: row.get(2)?,
            stock: row.get(3)?,
        })
    }).map_err(|e| e.to_string())?;
    
    let mut result = Vec::new();
    for product in products {
        result.push(product.map_err(|e| e.to_string())?);
    }
    Ok(result)
}

#[tauri::command]
fn add_product(name: String, price: f64, stock: i32) -> Result<(), String> {
    let conn = get_conn()?;
    conn.execute(
        "INSERT INTO products (name, price, stock) VALUES (?1, ?2, ?3)",
        params![name, price, stock],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn update_product(id: i32, name: String, price: f64, stock: i32) -> Result<(), String> {
    let conn = get_conn()?;
    conn.execute(
        "UPDATE products SET name = ?1, price = ?2, stock = ?3 WHERE id = ?4",
        params![name, price, stock, id],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn delete_product(id: i32) -> Result<(), String> {
    let conn = get_conn()?;
    conn.execute("DELETE FROM products WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn get_sales() -> Result<Vec<Sale>, String> {
    let conn = get_conn()?;
    let mut stmt = conn.prepare("SELECT id, total, sale_date FROM sales ORDER BY id DESC")
        .map_err(|e| e.to_string())?;
    let sales = stmt.query_map([], |row| {
        Ok(Sale {
            id: row.get(0)?,
            total: row.get(1)?,
            sale_date: row.get(2)?,
        })
    }).map_err(|e| e.to_string())?;
    
    let mut result = Vec::new();
    for sale in sales {
        result.push(sale.map_err(|e| e.to_string())?);
    }
    Ok(result)
}

#[tauri::command]
fn add_sale(total: f64) -> Result<(), String> {
    let conn = get_conn()?;
    conn.execute(
        "INSERT INTO sales (total) VALUES (?1)",
        params![total],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn create_sale(sale: NewSale) -> Result<serde_json::Value, String> {
    let conn = Connection::open("hanouty.db").map_err(|e| e.to_string())?;
    
    let tx = conn.transaction().map_err(|e| e.to_string())?;
    
    for item in &sale.items {
        let current_stock: i32 = tx.query_row(
            "SELECT stock FROM products WHERE id = ?1",
            params![item.product_id],
            |row| row.get(0)
        ).map_err(|e| e.to_string())?;
        
        if current_stock < item.quantity {
            return Err(format!("Insufficient stock for product ID {}: available {}, requested {}", 
                item.product_id, current_stock, item.quantity));
        }
    }
    
    tx.execute(
        "INSERT INTO sales (total) VALUES (?1)",
        params![sale.total],
    ).map_err(|e| e.to_string())?;
    
    let sale_id = tx.last_insert_rowid();
    
    for item in &sale.items {
        tx.execute(
            "INSERT INTO sale_items (sale_id, product_id, quantity, price_at_sale) 
             VALUES (?1, ?2, ?3, ?4)",
            params![sale_id, item.product_id, item.quantity, item.price],
        ).map_err(|e| e.to_string())?;
        
        let updated = tx.execute(
            "UPDATE products SET stock = stock - ?1 
             WHERE id = ?2 AND stock >= ?1",
            params![item.quantity, item.product_id],
        ).map_err(|e| e.to_string())?;
        
        if updated == 0 {
            tx.rollback().map_err(|e| e.to_string())?;
            return Err(format!("Stock update failed for product {}", item.product_id));
        }
    }
    
    tx.commit().map_err(|e| e.to_string())?;
    
    Ok(serde_json::json!({
        "success": true,
        "sale_id": sale_id,
        "total": sale.total
    }))
}

#[tauri::command]
fn get_sales_history() -> Result<Vec<SaleHistoryItem>, String> {
    let conn = get_conn()?;
    let mut stmt = conn.prepare(
        "SELECT id, total, sale_date FROM sales ORDER BY sale_date DESC LIMIT 50"
    ).map_err(|e| e.to_string())?;
    
    let sales = stmt.query_map([], |row| {
        Ok(SaleHistoryItem {
            id: row.get(0)?,
            total: row.get(1)?,
            date: row.get(2)?,
        })
    }).map_err(|e| e.to_string())?;
    
    let mut result = Vec::new();
    for sale in sales {
        result.push(sale.map_err(|e| e.to_string())?);
    }
    Ok(result)
}

#[tauri::command]
fn get_vat_rate() -> Result<f64, String> {
    let conn = Connection::open("hanouty.db").map_err(|e| e.to_string())?;
    let vat: String = conn.query_row(
        "SELECT value FROM settings WHERE key = 'vat_rate'",
        [],
        |row| row.get(0)
    ).unwrap_or_else(|_| "20".to_string());
    
    Ok(vat.parse::<f64>().unwrap_or(20.0))
}

#[tauri::command]
fn get_shop_settings() -> Result<serde_json::Value, String> {
    let conn = Connection::open("hanouty.db").map_err(|e| e.to_string())?;
    
    let settings = [
        "shop_name", "shop_address", "shop_phone", "shop_email"
    ];
    
    let mut result = serde_json::Map::new();
    for key in settings {
        let value: String = conn.query_row(
            "SELECT value FROM settings WHERE key = ?1",
            params![key],
            |row| row.get(0)
        ).unwrap_or_else(|_| "".to_string());
        result.insert(key.to_string(), serde_json::Value::String(value));
    }
    
    Ok(serde_json::Value::Object(result))
}

#[tauri::command]
fn update_shop_setting(key: String, value: String) -> Result<(), String> {
    let conn = Connection::open("hanouty.db").map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT OR REPLACE INTO settings (key, value) VALUES (?1, ?2)",
        params![key, value],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn get_settings() -> Result<Vec<Setting>, String> {
    let conn = get_conn()?;
    let mut stmt = conn.prepare("SELECT key, value FROM settings")
        .map_err(|e| e.to_string())?;
    let settings = stmt.query_map([], |row| {
        Ok(Setting {
            key: row.get(0)?,
            value: row.get(1)?,
        })
    }).map_err(|e| e.to_string())?;
    
    let mut result = Vec::new();
    for setting in settings {
        result.push(setting.map_err(|e| e.to_string())?);
    }
    Ok(result)
}

#[tauri::command]
fn update_setting(key: String, value: String) -> Result<(), String> {
    let conn = get_conn()?;
    conn.execute(
        "INSERT OR REPLACE INTO settings (key, value) VALUES (?1, ?2)",
        params![key, value],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            greet,
            get_products,
            add_product,
            update_product,
            delete_product,
            get_sales,
            add_sale,
            create_sale,
            get_sales_history,
            get_vat_rate,
            get_shop_settings,
            update_shop_setting,
            get_settings,
            update_setting
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
