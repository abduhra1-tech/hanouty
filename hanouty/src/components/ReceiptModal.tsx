import { useRef } from 'react';

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface ReceiptData {
  sale_id: number;
  items: ReceiptItem[];
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  total: number;
  date: string;
}

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: ReceiptData | null;
}

export function ReceiptModal({ isOpen, onClose, receipt }: ReceiptModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !receipt) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount);
  };

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML;
    const printWindow = window.open('', '_blank');
    if (printWindow && printContent) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Receipt #${receipt.sale_id}</title>
            <style>
              body {
                font-family: 'Courier New', monospace;
                padding: 20px;
                max-width: 300px;
                margin: 0 auto;
              }
              .header {
                text-align: center;
                margin-bottom: 20px;
              }
              .divider {
                border-top: 1px dashed #000;
                margin: 10px 0;
              }
              .items {
                margin: 15px 0;
              }
              .item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
              }
              .totals {
                margin-top: 15px;
              }
              .total {
                font-weight: bold;
                font-size: 1.2em;
                margin-top: 10px;
                padding-top: 10px;
                border-top: 1px solid #000;
              }
              .footer {
                text-align: center;
                margin-top: 20px;
                font-size: 0.9em;
              }
              @media print {
                body {
                  margin: 0;
                  padding: 10px;
                }
              }
            </style>
          </head>
          <body>${printContent}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🧾 Sale Receipt</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div ref={printRef} className="receipt-content">
            <div className="receipt-header">
              <h3>🏪 HANOUTY</h3>
              <p>Smart Retail System</p>
              <p>------------------</p>
            </div>
            
            <div className="receipt-info">
              <p>Receipt #: {receipt.sale_id}</p>
              <p>Date: {new Date(receipt.date).toLocaleString('fr-MA')}</p>
            </div>
            
            <div className="divider"></div>
            
            <div className="receipt-items">
              {receipt.items.map((item, idx) => (
                <div key={idx} className="receipt-item">
                  <div>{item.name}</div>
                  <div>{item.quantity} × {formatCurrency(item.price)}</div>
                  <div className="item-total">{formatCurrency(item.total)}</div>
                </div>
              ))}
            </div>
            
            <div className="divider"></div>
            
            <div className="receipt-totals">
              <div className="total-line">
                <span>Subtotal:</span>
                <span>{formatCurrency(receipt.subtotal)}</span>
              </div>
              <div className="total-line">
                <span>VAT ({receipt.vat_rate}%):</span>
                <span>{formatCurrency(receipt.vat_amount)}</span>
              </div>
              <div className="total-line grand-total">
                <span>TOTAL:</span>
                <span>{formatCurrency(receipt.total)}</span>
              </div>
            </div>
            
            <div className="divider"></div>
            
            <div className="receipt-footer">
              <p>Thank you for your purchase!</p>
              <p>شكراً لزيارتكم</p>
              <p>------------------</p>
              <p style={{ fontSize: '0.8em' }}>No returns without receipt</p>
            </div>
          </div>
        </div>
        
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Close</button>
          <button className="btn-primary" onClick={handlePrint}>🖨️ Print Receipt</button>
        </div>
      </div>
    </div>
  );
}
