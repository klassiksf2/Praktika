const STORAGE_KEY = 'apteka_cart';

export function initCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(cart) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

export function addToCart(product) {
  let cart = initCart();
  if (!product.name) {
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
      existing.qty += 1;
    }
    save(cart);
    return cart;
  }

  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  save(cart);
  return cart;
}

export function getCartCount(cart) {
  return cart.reduce((s, i) => s + i.qty, 0);
}

export function getCartTotal(cart) {
  return cart.reduce((s, i) => s + i.price * i.qty, 0);
}

export function clearCart() {
  save([]);
  return [];
}

export function renderCartItems(cart, container) {
  if (cart.length === 0) {
    container.innerHTML = '<p class="empty">Корзина пуста</p>';
    return;
  }
  container.innerHTML = cart.map(i => `
    <div class="cart-item">
      <div class="cart-item__info">
        <strong>${i.name}</strong>
        <span>${i.price} ₽ × ${i.qty}</span>
      </div>
      <div class="cart-item__controls">
        <button data-action="dec" data-id="${i.id}">−</button>
        <span>${i.qty}</span>
        <button data-action="inc" data-id="${i.id}">+</button>
        <button data-action="remove" data-id="${i.id}" class="remove">✕</button>
      </div>
    </div>
  `).join('');
}