import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { ProductModal } from '../components/ProductModal'

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

export function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const data = await invoke<Product[]>('get_products')
      setProducts(data)
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = () => {
    setEditingProduct(null)
    setModalOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setModalOpen(true)
  }

  const handleDeleteProduct = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await invoke('delete_product', { id })
      loadProducts()
    }
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setEditingProduct(null)
  }

  const handleModalSuccess = () => {
    loadProducts()
  }

  return (
    <div className="dashboard">
      <h2>📦 Products</h2>
      <button style={{ marginBottom: '1rem' }} onClick={handleAddProduct}>+ Add Product</button>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="products-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Price (MAD)</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{product.price}</td>
                <td>{product.stock}</td>
                <td>
                  <button style={{ marginRight: '0.5rem' }} onClick={() => handleEditProduct(product)}>Edit</button>
                  <button className="btn-secondary" onClick={() => handleDeleteProduct(product.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <ProductModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        product={editingProduct}
      />
    </div>
  )
}
