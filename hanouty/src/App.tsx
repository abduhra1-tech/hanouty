import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Dashboard } from './pages/Dashboard'
import { Products } from './pages/Products'
import { Sales } from './pages/Sales'
import { Settings } from './pages/Settings'
import { POS } from './components/POS'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <div className="app-header">
          <h1>🏪 HANOUTY</h1>
          <p>Smart Retail System for Moroccan Shops</p>
        </div>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/pos" element={<POS />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
