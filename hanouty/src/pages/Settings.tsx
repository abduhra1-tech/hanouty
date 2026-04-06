import { useState } from 'react'

export function Settings() {
  const [settings, setSettings] = useState({
    shopName: 'Hanouty',
    language: 'fr',
    currency: 'MAD'
  })

  return (
    <div className="dashboard">
      <h2>⚙️ Settings</h2>
      <div className="form-group">
        <label>Shop Name</label>
        <input 
          type="text" 
          value={settings.shopName}
          onChange={(e) => setSettings({...settings, shopName: e.target.value})}
        />
      </div>
      <div className="form-group">
        <label>Language</label>
        <select 
          value={settings.language}
          onChange={(e) => setSettings({...settings, language: e.target.value})}
        >
          <option value="fr">Français</option>
          <option value="ar">العربية</option>
        </select>
      </div>
      <div className="form-group">
        <label>Currency</label>
        <select 
          value={settings.currency}
          onChange={(e) => setSettings({...settings, currency: e.target.value})}
        >
          <option value="MAD">MAD - Moroccan Dirham</option>
          <option value="EUR">EUR - Euro</option>
        </select>
      </div>
      <button>Save Settings</button>
    </div>
  )
}
