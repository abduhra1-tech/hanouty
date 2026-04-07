import { useState, useEffect } from 'react'
import { getProducts, getSales } from '../lib/db'

interface Stats {
  totalProducts: number;
  todaySales: number;
  lowStock: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    todaySales: 0,
    lowStock: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const products = await getProducts()
      const sales = await getSales()
      
      const today = new Date().toISOString().split('T')[0]
      const todaySalesTotal = sales
        .filter(s => s.sale_date.startsWith(today))
        .reduce((sum, s) => sum + s.total, 0)
      
      const lowStock = products.filter(p => p.stock < 5).length

      setStats({
        totalProducts: products.length,
        todaySales: todaySalesTotal,
        lowStock
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard">
      <h2>📊 Dashboard</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="stats">
          <div className="stat-card">
            <h3>Total Products</h3>
            <p>{stats.totalProducts}</p>
          </div>
          <div className="stat-card">
            <h3>Today's Sales</h3>
            <p>{stats.todaySales} MAD</p>
          </div>
          <div className="stat-card">
            <h3>Low Stock Alerts</h3>
            <p>{stats.lowStock}</p>
          </div>
        </div>
      )}
    </div>
  )
}
