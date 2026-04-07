import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { ProductModal } from '../components/ProductModal';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const data = await invoke<Product[]>('get_products');
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await invoke('delete_product', { id });
        await loadProducts();
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
  }

  function handleEdit(product: Product) {
    setEditingProduct(product);
    setModalOpen(true);
  }

  function handleAdd() {
    setEditingProduct(null);
    setModalOpen(true);
  }

  if (loading) return <div className="dashboard">Loading products...</div>;

  return (
    <div className="dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>📦 Products</h2>
        <button onClick={handleAdd}>+ Add Product</button>
      </div>
      
      <table className="products-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Price (MAD)</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.price.toFixed(2)}</td>
              <td>{product.stock}</td>
              <td>
                <button onClick={() => handleEdit(product)} style={{ marginRight: '0.5rem' }}>Edit</button>
                <button className="btn-secondary" onClick={() => handleDelete(product.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <ProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={loadProducts}
        product={editingProduct}
      />
    </div>
  );
}
