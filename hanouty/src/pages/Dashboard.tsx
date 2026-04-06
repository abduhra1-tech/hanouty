import { useState, useEffect } from 'react'

export function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    todaySales: 0,
    lowStock: 0
  })

  useEffect(() => {
    setStats({
      totalProducts: 45,
      todaySales: 1250,
      lowStock: 3
    })
  }, [])

  return (
    <div className="dashboard">
      <h2>📊 Dashboard</h2>
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
    </div>
  )
}
