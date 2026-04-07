import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { ProductModal } from '../components/ProductModal';
import { Toast } from '../components/Toast';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const data = await invoke<Product[]>('get_products');
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
      setToast({ message: 'Failed to load products', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await invoke('delete_product', { id });
        await loadProducts();
        setToast({ message: 'Product deleted successfully', type: 'success' });
      } catch (error) {
        console.error('Failed to delete product:', error);
        setToast({ message: 'Failed to delete product', type: 'error' });
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

  function handleModalSuccess() {
    loadProducts();
    setToast({ message: editingProduct ? 'Product updated' : 'Product added', type: 'success' });
  }

  if (loading) return <div className="dashboard">Loading products...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>📦 Products</h2>
        <button className="btn-primary" onClick={handleAdd}>+ Add Product</button>
      </div>
      
      {products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h3>No products yet</h3>
          <p>Start by adding your first product to inventory</p>
          <button className="btn-primary" onClick={handleAdd}>+ Add First Product</button>
        </div>
      ) : (
        <div className="products-table-container">
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
                    <button className="btn-icon" onClick={() => handleEdit(product)}>✏️</button>
                    <button className="btn-icon" onClick={() => handleDelete(product.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <ProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleModalSuccess}
        product={editingProduct}
      />
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
