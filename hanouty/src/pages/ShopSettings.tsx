import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

export function ShopSettings() {
  const [settings, setSettings] = useState({
    shop_name: '',
    shop_address: '',
    shop_phone: '',
    shop_email: ''
  });
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const data = await invoke<any>('get_shop_settings');
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  async function saveSetting(key: string, value: string) {
    try {
      await invoke('update_shop_setting', { key, value });
      setToast({ message: 'Setting saved successfully', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      setToast({ message: 'Failed to save setting', type: 'error' });
    }
  }

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    saveSetting(key, value);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>🏪 Shop Settings</h2>
      </div>

      <div className="settings-form">
        <div className="form-group">
          <label>Shop Name</label>
          <input
            type="text"
            value={settings.shop_name}
            onChange={(e) => handleChange('shop_name', e.target.value)}
            placeholder="Your shop name"
          />
        </div>

        <div className="form-group">
          <label>Address</label>
          <input
            type="text"
            value={settings.shop_address}
            onChange={(e) => handleChange('shop_address', e.target.value)}
            placeholder="Shop address"
          />
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            value={settings.shop_phone}
            onChange={(e) => handleChange('shop_phone', e.target.value)}
            placeholder="+212 6XX XXX XXX"
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={settings.shop_email}
            onChange={(e) => handleChange('shop_email', e.target.value)}
            placeholder="contact@shop.ma"
          />
        </div>
      </div>

      {toast && (
        <div className={`toast toast-${toast.type}`} onClick={() => setToast(null)}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
