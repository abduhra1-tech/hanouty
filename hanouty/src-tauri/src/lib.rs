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
            get_settings,
            update_setting
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
