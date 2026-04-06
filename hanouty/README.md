# 🏪 Hanouty - حانوتي

**Smart Retail System for Moroccan Shops**  
**نظام البيع الذكي للمتاجر البريطانية**

## ✨ Features
- 📊 Dashboard & Analytics
- 📦 Product Management
- 💰 Point of Sale (POS)
- 📈 Sales Reports
- 🏷️ Barcode Scanner Ready
- 🧾 Receipt Printing
- 📶 100% Offline
- 🇲🇦 French & Arabic Support

## 🚀 Quick Start

### Install dependencies
```bash
bun install
```

### Run development server
```bash
bun run tauri dev
```

### Build for production
```bash
bun run build
bun run tauri build
```

## 🛠️ Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Desktop**: Tauri 2.0
- **Routing**: React Router v6
- **Styling**: CSS3 with gradient theme

## 📁 Project Structure
```
src/
├── components/     # Reusable UI components
├── pages/          # Page components (Dashboard, Products, Sales, Settings)
├── hooks/          # Custom React hooks
├── context/        # React context providers
├── lib/            # Utilities and helpers
├── App.tsx         # Main application component
├── main.tsx        # Application entry point
└── styles.css      # Global styles

src-tauri/
├── src/            # Rust backend
├── Cargo.toml      # Rust dependencies
└── tauri.conf.json # Tauri configuration
```

## 🌐 Supported Languages
- 🇫🇷 Français
- 🇸🇦 العربية

## 📄 License
MIT
