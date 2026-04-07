import { useState, useEffect } from 'react'
import { getProducts, addProduct, deleteProduct, Product } from '../lib/db'

export function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const data = await getProducts()
      setProducts(data)
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = async () => {
    await addProduct('New Product', 0, 0)
    loadProducts()
  }

  const handleDeleteProduct = async (id: number) => {
    await deleteProduct(id)
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
                  <button style={{ marginRight: '0.5rem' }}>Edit</button>
                  <button className="btn-secondary" onClick={() => handleDeleteProduct(product.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
