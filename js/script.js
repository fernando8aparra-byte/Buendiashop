/* ===== VARIABLES (Dark Mode) ===== */
:root {
  --bg: #fff;
  --text: #111;
  --muted: #777;
  --card-bg: #fff;
  --accent: #7c4dff;
  --accent-gradient: linear-gradient(135deg, #7c4dff 0%, #5b21b6 100%);
  --shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  --shadow-soft: 0 4px 12px rgba(124, 77, 255, 0.1);
  --border-radius: 12px;
  --transition: all 0.25s ease;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0f0f0f;
    --text: #f0f0f0;
    --muted: #aaa;
    --card-bg: #1a1a1a;
    --shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    --shadow-soft: 0 4px 12px rgba(124, 77, 255, 0.2);
  }
}

/* ===== BASE ===== */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: 'Inter', system-ui, sans-serif;
}

body {
  background: var(--bg);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
  line-height: 1.6;
}

img { max-width: 100%; height: auto; display: block; }

/* ===== HEADER ANIMADO ===== */
.header-animated {
  animation: slideDown 0.6s ease-out;
  background: var(--card-bg);
  border-bottom: 1px solid rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 40;
}

@keyframes slideDown {
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  height: 60px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-btn {
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
}

.icon-btn:hover {
  background: rgba(124, 77, 255, 0.1);
  transform: scale(1.05);
}

#cartBadge {
  position: absolute;
  top: 6px;
  right: 6px;
  background: var(--accent);
  color: #fff;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 11px;
  display: none;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.logo {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-weight: 900;
  font-size: clamp(18px, 4vw, 22px);
  letter-spacing: 1px;
  white-space: nowrap;
  transition: opacity 0.3s ease;
}

.logo.hidden {
  opacity: 0;
  pointer-events: none;
}

/* Búsqueda */
.search-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: var(--card-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 30;
  padding: 0 16px;
}

.search-container.active {
  opacity: 1;
  visibility: visible;
}

.search-bar {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 500px;
  position: relative;
}

.search-bar input {
  flex: 1;
  padding: 10px 40px 10px 12px;
  border: 1.5px solid var(--text);
  border-radius: 8px;
  font-size: 15px;
  background: var(--bg);
  color: var(--text);
  min-height: 44px;
}

.search-bar input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(124, 77, 255, 0.2);
}

#closeSearch {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  color: var(--muted);
}

/* ===== MAIN, GALERÍA, CARRITO, ETC. (sin cambios) ===== */
main { max-width: 1200px; margin: 24px auto; padding: 0 16px 80px; }

.breadcrumbs { font-size: 13px; color: var(--muted); margin-bottom: 16px; text-transform: uppercase; }
.breadcrumbs a { color: var(--muted); text-decoration: none; }
.breadcrumbs a:hover { color: var(--accent); }

.product-wrap { display: flex; gap: 24px; flex-wrap: wrap; align-items: flex-start; }
.product-gallery { flex: 1 1 420px; min-width: 300px; max-width: 520px; position: relative; overflow: hidden; border-radius: var(--border-radius); box-shadow: var(--shadow-soft); background: #fafafa; }
.gallery-track { display: flex; transition: transform 0.4s ease; }
.gallery-img { width: 100%; height: auto; object-fit: contain; flex-shrink: 0; }
.gallery-nav { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.95); border: 1px solid #ddd; width: 44px; height: 44px; border-radius: 50%; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.15); z-index: 10; transition: var(--transition); color: #000; }
.gallery-nav:hover { background: #fff; transform: translateY(-50%) scale(1.1); }
.gallery-nav.prev { left: 12px; }
.gallery-nav.next { right: 12px; }
.gallery-dots { position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(0,0,0,0.3); cursor: pointer; transition: var(--transition); }
.dot.active { background: var(--accent); transform: scale(1.3); }
.gallery-thumbs { display: flex; gap: 8px; padding: 12px; justify-content: center; background: rgba(255,255,255,0.9); flex-wrap: wrap; }
.thumb { width: 60px; height: 60px; object-fit: cover; border-radius: 8px; cursor: pointer; opacity: 0.6; transition: var(--transition); border: 2px solid transparent; }
.thumb.active { opacity: 1; border-color: var(--accent); }

.product-info { flex: 1 1 420px; min-width: 300px; }
.page-title { font-size: clamp(24px, 5vw, 34px); margin-bottom: 8px; font-weight: 900; line-height: 1.2; background: var(--accent-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.price { font-size: clamp(22px, 5vw, 28px); font-weight: 800; color: var(--accent); margin-bottom: 12px; }
.desc { color: var(--muted); line-height: 1.7; margin-bottom: 20px; font-size: clamp(14px, 3.5vw, 16px); }
.qty-row { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.qty-row input { width: 90px; padding: 10px; border-radius: 8px; border: 1.5px solid #ddd; text-align: center; font-size: 16px; font-weight: 600; min-height: 44px; }
.add-btn, .pay-btn { background: var(--accent-gradient); color: #fff; border: none; padding: 14px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; transition: var(--transition); box-shadow: var(--shadow-soft); font-size: 15px; min-height: 48px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
.add-btn:hover, .pay-btn:hover { opacity: 0.95; transform: translateY(-1px); }
.payment-options { display: none; flex-direction: column; gap: 12px; margin-top: 12px; max-width: 340px; }
.payment-options.show { display: flex; }

.related h2 { font-size: clamp(20px, 4vw, 24px); margin-bottom: 16px; font-weight: 800; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 18px; }
.card { background: var(--card-bg); border-radius: var(--border-radius); box-shadow: var(--shadow-soft); overflow: hidden; cursor: pointer; transition: transform 0.2s ease; }
.card:hover { transform: translateY(-6px); box-shadow: 0 12px 24px rgba(124, 77, 255, 0.15); }
.card img { width: 100%; height: 220px; object-fit: contain; background: #fafafa; }
.meta { padding: 14px; flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between; }
.meta .title { font-weight: 700; font-size: 14px; margin-bottom: 8px; line-height: 1.3; }
.meta .price { font-weight: 800; color: var(--text); font-size: 16px; }

.menu-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 30; opacity: 0; visibility: hidden; transition: 0.25s; backdrop-filter: blur(6px); }
.menu-overlay.show { opacity: 1; visibility: visible; }
.menu-dropdown { position: fixed; top: 0; left: -100%; width: 300px; max-width: 90vw; height: 100%; background: var(--card-bg); box-shadow: 2px 0 20px rgba(0,0,0,0.1); padding: 80px 20px 20px; z-index: 35; transition: left 0.3s ease; border-right: 1px solid #eee; }
.menu-dropdown.open { left: 0; }
.menu-close { position: absolute; top: 16px; right: 16px; font-size: 28px; cursor: pointer; color: var(--muted); width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: var(--transition); }
.menu-close:hover { background: rgba(0,0,0,0.05); }
.menu-item { padding: 16px 0; border-bottom: 1px solid #f5f5f5; font-weight: 600; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: space-between; transition: color 0.2s; }
.menu-item:hover { color: var(--accent); }
.menu-item.prox { color: var(--muted); opacity: 0.7; }
.menu-item.prox small { font-size: 12px; font-weight: 500; }

.cart-panel { position: fixed; top: 0; right: -100%; width: 380px; max-width: 100vw; height: 100%; background: var(--card-bg); box-shadow: -6px 0 30px rgba(0,0,0,0.12); transition: right 0.3s ease; display: flex; flex-direction: column; z-index: 45; }
.cart-panel.open { right: 0; }
.cart-header { padding: 16px; font-weight: 800; border-bottom: 1px solid #e6e6e6; display: flex; justify-content: space-between; align-items: center; font-size: 18px; }
.cart-items { flex: 1; overflow: auto; padding: 16px; }
.cart-empty { text-align: center; color: var(--muted); padding: 60px 16px; font-weight: 600; font-size: 15px; }
.cart-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f2f2f2; font-size: 14px; }
.cart-item button { background: none; border: none; color: var(--accent); font-weight: 700; cursor: pointer; font-size: 20px; }
.cart-footer { padding: 16px; border-top: 1px solid #eee; }
.cart-total { font-weight: 900; text-align: right; margin-bottom: 12px; font-size: 18px; }
.payment-area { display: none; flex-direction: column; gap: 12px; }
.payment-area.show { display: flex; }

.toast {
  position: fixed;
  left: 50%;
  transform: translateX(-50%) translateY(30px);
  bottom: 20px;
  background: var(--accent);
  color: #fff;
  padding: 14px 24px;
  border-radius: 12px;
  font-weight: 800;
  box-shadow: 0 8px 30px rgba(0,0,0,0.15);
  opacity: 0;
  pointer-events: none;
  transition: all 0.35s;
  z-index: 60;
  font-size: 15px;
  max-width: 90vw;
  text-align: center;
}
.toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

@keyframes shake {
  0% { transform: rotate(0deg); }
  20% { transform: rotate(-12deg); }
  40% { transform: rotate(12deg); }
  60% { transform: rotate(-8deg); }
  80% { transform: rotate(8deg); }
  100% { transform: rotate(0deg); }
}
.shake { animation: shake 0.45s ease; }

/* Responsive */
@media (max-width: 480px) {
  .header-inner { padding: 10px 12px; }
  .logo { font-size: 17px; }
  .search-bar input { font-size: 14px; }
}
