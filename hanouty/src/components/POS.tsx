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
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const data = await invoke<Product[]>('get_products');
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  }

  function addToCart() {
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;
    
    if (quantity > product.stock) {
      setToast({ message: `Only ${product.stock} in stock`, type: 'error' });
      return;
    }
    
    const existingItem = cart.find(item => item.product_id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + quantity, total: (item.quantity + quantity) * item.price }
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
  }

  function removeFromCart(productId: number) {
    setCart(cart.filter(item => item.product_id !== productId));
  }

  function updateQuantity(productId: number, newQuantity: number) {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    const product = products.find(p => p.id === productId);
    if (product && newQuantity > product.stock) {
      setToast({ message: `Only ${product.stock} in stock`, type: 'error' });
      return;
    }
    
    setCart(cart.map(item =>
      item.product_id === productId
        ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
        : item
    ));
  }

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.2;
  const total = subtotal + tax;

  async function completeSale() {
    if (cart.length === 0) return;
    
    try {
      await invoke('create_sale', {
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
      
      setToast({ message: `Sale completed! Total: ${formatCurrency(total)}`, type: 'success' });
      setCart([]);
      loadProducts();
    } catch (error) {
      setToast({ message: 'Failed to complete sale', type: 'error' });
    }
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount);
  }

  const selectedProductObj = products.find(p => p.id === selectedProduct);

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
                      <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)}>+</button>
                      <button onClick={() => removeFromCart(item.product_id)}>🗑️</button>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="cart-totals">
                <div>Subtotal: {formatCurrency(subtotal)}</div>
                <div>VAT (20%): {formatCurrency(tax)}</div>
                <div className="total">Total: {formatCurrency(total)}</div>
              </div>
              
              <button className="btn-primary" onClick={completeSale}>
                Complete Sale
              </button>
            </>
          )}
        </div>
        
        <div className="pos-products">
          <h3>Add Products</h3>
          <div className="form-group">
            <label>Select Product</label>
            <select value={selectedProduct} onChange={(e) => setSelectedProduct(Number(e.target.value))}>
              <option value={0}>Choose a product...</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - {formatCurrency(product.price)} (Stock: {product.stock})
                </option>
              ))}
            </select>
          </div>
          
          {selectedProductObj && (
            <>
              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={selectedProductObj.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </div>
              
              <div className="product-preview">
                <div>Price: {formatCurrency(selectedProductObj.price)}</div>
                <div>Total: {formatCurrency(selectedProductObj.price * quantity)}</div>
              </div>
              
              <button 
                className="btn-primary" 
                onClick={addToCart}
                disabled={!selectedProduct || quantity < 1}
              >
                Add to Cart
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
