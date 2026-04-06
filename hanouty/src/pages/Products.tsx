import { useState } from 'react'

export function Products() {
  const [products, setProducts] = useState([
    { id: 1, name: 'Product 1', price: 100, stock: 10 },
    { id: 2, name: 'Product 2', price: 200, stock: 5 },
    { id: 3, name: 'Product 3', price: 150, stock: 15 },
  ])

  const addProduct = () => {
    const newId = products.length + 1
    setProducts([...products, { id: newId, name: 'New Product', price: 0, stock: 0 }])
  }

  return (
    <div className="dashboard">
      <h2>📦 Products</h2>
      <button style={{ marginBottom: '1rem' }} onClick={addProduct}>+ Add Product</button>
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
                <button className="btn-secondary">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
