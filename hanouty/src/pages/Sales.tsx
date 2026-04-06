import { useState } from 'react'

export function Sales() {
  const [sales, setSales] = useState([
    { id: 1, date: '2024-01-15', total: 450, items: 3 },
    { id: 2, date: '2024-01-14', total: 320, items: 2 },
    { id: 3, date: '2024-01-13', total: 890, items: 5 },
  ])

  const addSale = () => {
    const today = new Date().toISOString().split('T')[0]
    const newId = sales.length + 1
    setSales([...sales, { id: newId, date: today, total: 0, items: 0 }])
  }

  return (
    <div className="dashboard">
      <h2>💰 Sales</h2>
      <button style={{ marginBottom: '1rem' }} onClick={addSale}>+ New Sale</button>
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
              <td>{sale.date}</td>
              <td>{sale.total}</td>
              <td>{sale.items}</td>
              <td>
                <button>View Receipt</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
