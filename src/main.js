import { initCart, addToCart, getCartCount, getCartTotal, clearCart, renderCartItems } from './cart.js';

const catalogEl = document.getElementById('catalog');
const searchEl = document.getElementById('search');
const categoryEl = document.getElementById('categoryFilter');
const sortEl = document.getElementById('sortFilter');
const maxPriceEl = document.getElementById('maxPrice');

const cartBtn = document.getElementById('cartBtn');
const cartModal = document.getElementById('cartModal');
const closeCartBtn = document.getElementById('closeCart');
const clearCartBtn = document.getElementById('clearCart');
const checkoutBtn = document.getElementById('checkout');
const toastEl = document.getElementById('toast');

let products = [];
let cart = initCart();

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('toast--show');
  setTimeout(() => toastEl.classList.remove('toast--show'), 2000);
}

async function loadProducts() {
  try {
    const res = await fetch('/products.json');
    if (!res.ok) throw new Error('Ошибка загрузки');
    products = await res.json();
    renderCatalog();
  } catch (e) {
    catalogEl.innerHTML = '<p class="error">Не удалось загрузить каталог. Попробуйте позже.</p>';
    console.error(e);
  }
}

function getFilteredProducts() {
  const q = searchEl.value.trim().toLowerCase();
  const cat = categoryEl.value;
  const maxPrice = parseFloat(maxPriceEl.value);
  const sort = sortEl.value;

  let list = products.filter(p => {
    const matchQ = p.name.toLowerCase().includes(q);
    const matchCat = cat === 'all' || p.category === cat;
    const matchPrice = isNaN(maxPrice) || p.price <= maxPrice;
    return matchQ && matchCat && matchPrice;
  });

  if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
  if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));

  return list;
}

function renderCatalog() {
  const list = getFilteredProducts();

  if (list.length === 0) {
    catalogEl.innerHTML = '<p class="empty">Товары не найдены</p>';
    return;
  }

  catalogEl.innerHTML = list.map(p => `
    <article class="card" data-id="${p.id}">
      <div class="card__img">
        <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.style.display='none'">
      </div>
      <div class="card__body">
        <span class="card__cat">${p.category}</span>
        <h3 class="card__name">${p.name}</h3>
        <p class="card__meta">${p.form}</p>
        <div class="card__footer">
          <strong class="card__price">${p.price} ₽</strong>
          <button class="btn btn--primary add-btn" data-id="${p.id}">В корзину</button>
        </div>
      </div>
    </article>
  `).join('');

  catalogEl.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      const product = products.find(p => p.id === id);
      cart = addToCart(product);
      updateCartUI();
      showToast(`«${product.name}» добавлен в корзину`);
    });
  });
}

function updateCartUI() {
  const count = getCartCount(cart);
  const total = getCartTotal(cart);
  document.getElementById('cartCount').textContent = count;
  document.getElementById('cartTotal').textContent = total.toLocaleString('ru-RU') + ' ₽';
  document.getElementById('modalTotal').textContent = total.toLocaleString('ru-RU') + ' ₽';
  renderCartItems(cart, cartItemsEl);
}

const cartItemsEl = document.getElementById('cartItems');

function openCart() {
  updateCartUI();
  cartModal.classList.add('modal--open');
}
function closeCart() {
  cartModal.classList.remove('modal--open');
}

// События
searchEl.addEventListener('input', renderCatalog);
categoryEl.addEventListener('change', renderCatalog);
sortEl.addEventListener('change', renderCatalog);
maxPriceEl.addEventListener('input', renderCatalog);

cartBtn.addEventListener('click', openCart);
closeCartBtn.addEventListener('click', closeCart);
cartModal.addEventListener('click', e => { if (e.target === cartModal) closeCart(); });

clearCartBtn.addEventListener('click', () => {
  if (confirm('Очистить корзину?')) {
    cart = clearCart();
    updateCartUI();
    showToast('Корзина очищена');
  }
});

checkoutBtn.addEventListener('click', () => {
  if (getCartCount(cart) === 0) { showToast('Корзина пуста'); return; }
  cart = clearCart();
  updateCartUI();
  closeCart();
  showToast('Заказ успешно оформлен! Спасибо за покупку 💚');
});

cartItemsEl.addEventListener('click', e => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const action = btn.dataset.action;

  if (action === 'inc') {
    cart = addToCart({ id });
  } else if (action === 'dec') {
    const item = cart.find(i => i.id === id);
    if (item) {
      item.qty -= 1;
      if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
    }
  } else if (action === 'remove') {
    cart = cart.filter(i => i.id !== id);
  }
  updateCartUI();
});

loadProducts();
updateCartUI();