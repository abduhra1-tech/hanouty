import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'

interface Sale {
  id: number;
  total: number;
  sale_date: string;
}

export function Sales() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSales()
  }, [])

  const loadSales = async () => {
    try {
      const data = await invoke<Sale[]>('get_sales')
      setSales(data)
    } catch (error) {
      console.error('Failed to load sales:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="dashboard">Loading sales...</div>

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>💰 Sales</h2>
      </div>
      
      {sales.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💰</div>
          <h3>No sales yet</h3>
          <p>Your sales will appear here once you start making transactions</p>
        </div>
      ) : (
        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Total (MAD)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(sale => (
                <tr key={sale.id}>
                  <td>{sale.id}</td>
                  <td>{sale.sale_date.split('T')[0]}</td>
                  <td>{sale.total.toFixed(2)}</td>
                  <td>
                    <button className="btn-icon">🧾</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
