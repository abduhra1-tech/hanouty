import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

interface CartItem {
  product_id: number;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export function POS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [vatRate, setVatRate] = useState<number>(20);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

  useEffect(() => {
    loadProducts();
    loadVatRate();
  }, []);

  async function loadProducts() {
    try {
      const data = await invoke<Product[]>('get_products');
      setProducts(data);
    } catch (error) {
      showToast('Failed to load products', 'error');
    }
  }

  async function loadVatRate() {
    try {
      const rate = await invoke<number>('get_vat_rate');
      setVatRate(rate);
    } catch (error) {
      console.error('Failed to load VAT rate:', error);
    }
  }

  function showToast(message: string, type: string) {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function addToCart() {
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;
    
    if (quantity > product.stock) {
      showToast(`Only ${product.stock} in stock`, 'error');
      return;
    }
    
    const existingItem = cart.find(item => item.product_id === product.id);
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        showToast(`Cannot add ${quantity}. Only ${product.stock - existingItem.quantity} available`, 'error');
        return;
      }
      setCart(cart.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
          : item
      ));
    } else {
      setCart([...cart, {
        product_id: product.id,
        name: product.name,
        quantity: quantity,
        price: product.price,
        total: product.price * quantity
      }]);
    }
    
    setSelectedProduct(0);
    setQuantity(1);
    showToast(`Added ${product.name} to cart`, 'success');
  }

  async function completeSale() {
    if (cart.length === 0) {
      showToast('Cart is empty', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
      const tax = subtotal * (vatRate / 100);
      const total = subtotal + tax;
      
      const result = await invoke<{ success: boolean; sale_id: number; total: number }>('create_safe_sale', {
        sale: {
          items: cart.map(item => ({
            product_id: item.product_id,
            product_name: item.name,
            quantity: item.quantity,
            price: item.price,
            total: item.total
          })),
          total: total
        }
      });
      
      if (result.success) {
        showToast(`Sale completed! Total: ${formatCurrency(result.total)}`, 'success');
        setCart([]);
        await loadProducts();
      }
    } catch (error) {
      showToast(`Sale failed: ${error}`, 'error');
    } finally {
      setLoading(false);
    }
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount);
  }

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * (vatRate / 100);
  const total = subtotal + tax;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>💰 Point of Sale</h2>
      </div>
      
      <div className="pos-grid">
        <div className="pos-cart">
          <h3>Shopping Cart</h3>
          {cart.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🛒</div>
              <p>Cart is empty</p>
            </div>
          ) : (
            <>
              {cart.map(item => (
                <div key={item.product_id} className="cart-item">
                  <div>
                    <strong>{item.name}</strong>
                    <div>{formatCurrency(item.price)} × {item.quantity}</div>
                  </div>
                  <div>
                    <div>{formatCurrency(item.total)}</div>
                    <div className="cart-actions">
                      <button onClick={() => {
                        const newQuantity = item.quantity - 1;
                        if (newQuantity > 0) {
                          setCart(cart.map(i =>
                            i.product_id === item.product_id
                              ? { ...i, quantity: newQuantity, total: newQuantity * i.price }
                              : i
                          ));
                        } else {
                          setCart(cart.filter(i => i.product_id !== item.product_id));
                        }
                      }}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => {
                        const product = products.find(p => p.id === item.product_id);
                        if (product && item.quantity + 1 <= product.stock) {
                          setCart(cart.map(i =>
                            i.product_id === item.product_id
                              ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.price }
                              : i
                          ));
                        } else {
                          showToast(`Only ${product?.stock} in stock`, 'error');
                        }
                      }}>+</button>
                      <button onClick={() => setCart(cart.filter(i => i.product_id !== item.product_id))}>🗑️</button>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="cart-totals">
                <div>Subtotal: {formatCurrency(subtotal)}</div>
                <div>VAT ({vatRate}%): {formatCurrency(tax)}</div>
                <div className="total">Total: {formatCurrency(total)}</div>
              </div>
              
              <button 
                className="btn-primary" 
                onClick={completeSale}
                disabled={loading || cart.length === 0}
              >
                {loading ? 'Processing...' : 'Complete Sale'}
              </button>
            </>
          )}
        </div>
        
        <div className="pos-products">
          <h3>Add Products</h3>
          <div className="form-group">
            <label>Select Product</label>
            <select 
              value={selectedProduct} 
              onChange={(e) => setSelectedProduct(Number(e.target.value))}
              autoFocus
            >
              <option value={0}>Choose a product...</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - {formatCurrency(product.price)} (Stock: {product.stock})
                </option>
              ))}
            </select>
          </div>
          
          {selectedProduct > 0 && (
            <>
              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addToCart();
                    }
                  }}
                />
              </div>
              
              <button 
                className="btn-primary" 
                onClick={addToCart}
                disabled={selectedProduct === 0}
              >
                Add to Cart (Enter)
              </button>
            </>
          )}
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
