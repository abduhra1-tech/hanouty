import { invoke } from "@tauri-apps/api/core";

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

export interface Sale {
  id: number;
  total: number;
  sale_date: string;
}

export interface Setting {
  key: string;
  value: string;
}

export async function getProducts(): Promise<Product[]> {
  return invoke<Product[]>("get_products");
}

export async function addProduct(name: string, price: number, stock: number = 0): Promise<void> {
  await invoke("add_product", { name, price, stock });
}

export async function updateProduct(id: number, name: string, price: number, stock: number): Promise<void> {
  await invoke("update_product", { id, name, price, stock });
}

export async function deleteProduct(id: number): Promise<void> {
  await invoke("delete_product", { id });
}

export async function getSales(): Promise<Sale[]> {
  return invoke<Sale[]>("get_sales");
}

export async function addSale(total: number): Promise<void> {
  await invoke("add_sale", { total });
}

export async function getSettings(): Promise<Setting[]> {
  return invoke<Setting[]>("get_settings");
}

export async function updateSetting(key: string, value: string): Promise<void> {
  await invoke("update_setting", { key, value });
}
