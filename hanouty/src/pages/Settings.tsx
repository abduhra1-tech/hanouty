import { useState, useEffect } from 'react'
import { getSettings, updateSetting } from '../lib/db'

export function Settings() {
  const [loading, setLoading] = useState(true)
  const [shopName, setShopName] = useState('Hanouty')
  const [language, setLanguage] = useState('fr')
  const [currency, setCurrency] = useState('MAD')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const data = await getSettings()
      
      const shopNameSetting = data.find(s => s.key === 'shop_name')
      const languageSetting = data.find(s => s.key === 'language')
      const currencySetting = data.find(s => s.key === 'currency')
      
      if (shopNameSetting) setShopName(shopNameSetting.value)
      if (languageSetting) setLanguage(languageSetting.value)
      if (currencySetting) setCurrency(currencySetting.value)
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    await updateSetting('shop_name', shopName)
    await updateSetting('language', language)
    await updateSetting('currency', currency)
    loadSettings()
  }

  return (
    <div className="dashboard">
      <h2>⚙️ Settings</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="form-group">
            <label>Shop Name</label>
            <input 
              type="text" 
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Language</label>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="fr">Français</option>
              <option value="ar">العربية</option>
            </select>
          </div>
          <div className="form-group">
            <label>Currency</label>
            <select 
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="MAD">MAD - Moroccan Dirham</option>
              <option value="EUR">EUR - Euro</option>
            </select>
          </div>
          <button onClick={handleSave}>Save Settings</button>
        </>
      )}
    </div>
  )
}
