import { useState, useEffect } from 'react'
import { getSales, addSale, Sale } from '../lib/db'

export function Sales() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSales()
  }, [])

  const loadSales = async () => {
    try {
      const data = await getSales()
      setSales(data)
    } catch (error) {
      console.error('Failed to load sales:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSale = async () => {
    await addSale(0, 0)
    loadSales()
  }

  return (
    <div className="dashboard">
      <h2>💰 Sales</h2>
      <button style={{ marginBottom: '1rem' }} onClick={handleAddSale}>+ New Sale</button>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="products-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Total (MAD)</th>
              <th>Items</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sales.map(sale => (
              <tr key={sale.id}>
                <td>{sale.id}</td>
                <td>{sale.created_at.split('T')[0]}</td>
                <td>{sale.total}</td>
                <td>{sale.items}</td>
                <td>
                  <button>View Receipt</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
