let motorcycles = [];
let flippedCards = new Set();
let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];     
let wishlistItems = JSON.parse(localStorage.getItem('wishlistItems')) || [];

document.addEventListener('DOMContentLoaded', function () {
  const slides = document.querySelectorAll('.slide');
  let currentSlide = 0;
  if (slides.length > 0) {
    slides[currentSlide].classList.add('active');
    setInterval(() => {
      slides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add('active');
    }, 5000);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const isIndex = location.pathname.endsWith('index.html') || location.pathname === '/';

  Promise.all([
    fetch('products/motorcycles.json').then(res => res.json()),
    fetch('products/spareparts.json').then(res => res.json())
  ])
    .then(([motorcyclesData, sparepartsData]) => {
      motorcycles = [...motorcyclesData, ...sparepartsData];
      if (isIndex) {
        renderHotProducts();
      } else if (location.pathname.endsWith('products.html')) {
        renderCards();
      } else if (location.pathname.endsWith('cart.html')) {
        renderWishlist(); 
  }
    })
    .catch(err => console.error('Fetch error:', err));

  const categoryFilter = document.getElementById('category-filter');
  const sortFilter = document.getElementById('sort-filter');

  if (categoryFilter && sortFilter) {
    categoryFilter.addEventListener('change', renderCards);
    sortFilter.addEventListener('change', renderCards);
  }

  const burger = document.querySelector('.burger-menu');
  const nav = document.querySelector('.nav-center');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      nav.classList.toggle('active');
      burger.classList.toggle('active');
    });
  }
  const navLinks = document.querySelectorAll('.nav-center a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('active');
      burger.classList.remove('active');
    });
  });
});

function renderCards() {
  const container = document.getElementById('card-container');
  if (!container) return;

  const category = document.getElementById('category-filter')?.value || 'all';
  const sort = document.getElementById('sort-filter')?.value || 'none';

  let filtered = [...motorcycles];

  if (category !== 'all') {
    filtered = filtered.filter(item => (item.category || '').toLowerCase() === category.toLowerCase());
  }

  switch (sort) {
    case 'price-asc':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'name-asc':
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-desc':
      filtered.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'year-new':
      filtered.sort((a, b) => (b.year || 0) - (a.year || 0));
      break;
    case 'year-old':
      filtered.sort((a, b) => (a.year || 9999) - (b.year || 9999));
      break;
  }

  container.innerHTML = '';
  filtered.forEach(moto => {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <div class="wishlist-heart" data-id="${moto.id}">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
          2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81
          14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4
          6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </div>
      <img src="${moto.image}" alt="${moto.name}" />
      <h2>${moto.name}</h2>
      ${moto.year ? `<p>Year: ${moto.year}</p>` : ''}
      <p style="color: red; font-weight: bold;">${moto.price.toFixed(2)} €</p>
      <a href="product.html?id=${moto.id}" class="see-more-btn">See More</a>
    `;

    container.appendChild(card);
  });

  document.querySelectorAll('.wishlist-heart').forEach(heart => {
    heart.addEventListener('click', function (event) {
      event.stopPropagation();
      const productId = this.getAttribute('data-id');
      this.classList.toggle('active');
      showAlert(`Product ${this.classList.contains('active') ? 'added to' : 'removed from'} wishlist.`);
    });
  });
}

function renderHotProducts() {
  const container = document.querySelector('.new_products-grid');
  if (!container) return;
  const hotProducts = motorcycles.slice(0, 4);

  container.innerHTML = '';
  hotProducts.forEach(product => {
    const card = document.createElement('div');
    card.className = 'new_products-card';
    card.onclick = () => location.href = `product.html?id=${product.id}`;
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" />
      <h3>${product.name}</h3>
    `;
    container.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  if (!productId) return;

  Promise.all([
    fetch('products/motorcycles.json').then(res => res.json()),
    fetch('products/spareparts.json').then(res => res.json())
  ])
    .then(([motorcyclesData, sparepartsData]) => {
      const allProducts = [...motorcyclesData, ...sparepartsData];
      const product = allProducts.find(p => p.id.toString() === productId);

      if (!product) {
        showError('Produkt wurde nicht gefunden.');
        return;
      }

      renderProduct(product);
    })
    .catch(err => {
      console.error(err);
      showError('An error occured while loading the product details.');
    });
});

function showError(message) {
  const container = document.getElementById('product-detail-container');
  if (!container) return;
  container.innerHTML = `<p style="color: red; text-align: center; font-weight: bold;">${message}</p>`;
}

function renderProduct(product) {
  const container = document.getElementById('product-detail-container');
  const playBtn = document.getElementById('play-audio-btn');
  const audioEl = document.getElementById('product-audio');
  const imageSrc = product.image;

  if (!container) return;

  container.innerHTML = `
    <div class="product-wrapper">
      <div class="product-content">
        <div style="display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; align-items: flex-start;">
          <img src="${imageSrc}" alt="${product.name}" style="max-width: 350px; width: 100%; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);" onerror="this.src='images/placeholder.png';" />
          <div style="flex: 1; min-width: 280px;">
            <h2 style="margin-top: 0;">${product.name}</h2>
            ${product.year ? `<p><strong>Year:</strong> ${product.year}</p>` : ''}
            <p style="font-weight: bold; color: #cc0000; font-size: 1.25rem;">${product.price.toFixed(2)} €</p>
            <p>${product.description || 'No description available yet'}</p>
            ${(product.category && product.sound)
              ? `<button id="play-audio-btn" aria-label="Play audio" style="background: none; border: none; cursor: pointer; margin-top: 1rem;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#333" viewBox="0 0 24 24">
                    <path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2c0-1.77-1.02-3.29-2.5-4.03v8.06c1.48-.74 2.5-2.26 2.5-4.03z"/>
                  </svg>
                </button>
                <audio id="product-audio" src="${product.sound}"></audio>`
              : ''}
          <button id="add-to-cart-btn" class="see-more-btn" style="margin-top: 1rem; display: inline-block;">Add to Cart</button>
          </div>
        </div>
      </div>
    </div>

    <form class="order-form">
      <h2 style="text-align: center;">Order Now</h2>
      <div class="order-grid">
        <div class="order-group">
          <label for="order-name">Name</label>
          <input type="text" id="order-name" name="order-name" required />
          <label for="order-email">Email</label>
          <input type="email" id="order-email" name="order-email" required />
        </div>
        <div class="order-group">
          <label for="order-amount">Amount</label>
          <input type="number" id="order-amount" name="order-amount" value="1" min="1" required />
          <button type="submit" class="submit-button">Order Now</button>
        </div>
      </div>
    </form>
  `;

  if (playBtn && audioEl) {
    playBtn.addEventListener('click', () => {
      if (!audioEl.paused) {
        audioEl.pause();
        audioEl.currentTime = 0;
      }
      audioEl.play();
    });
  }

  const addToCartBtn = document.getElementById('add-to-cart-btn');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
      cartItems.push(product.id);
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      showAlert(`Product "${product.name}" was added to cart`);
    });
  }
}

  function showAlert(message) {
  const existing = document.querySelector('.alert-message');
  if (existing) existing.remove();

  const alert = document.createElement('div');
  alert.className = 'alert-message';
  alert.textContent = message;
  document.body.appendChild(alert);

  setTimeout(() => {
    alert.classList.add('visible');
  }, 100); 

  setTimeout(() => {
    alert.classList.remove('visible');
    setTimeout(() => alert.remove(), 300); 
  }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {

  const newsletterForm = document.querySelector('#newsletter form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showAlert(`Thank you, your subscription has been confirmed! You will receive an email soon.`);
      newsletterForm.reset();
    });
  }

  const orderForm = document.getElementById('order-form');
  if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showAlert(`Thank you for your order! We will contact you soon.`);
      orderForm.reset();
    });
  }
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault(); 
      showAlert(`Thank you for your message! We will get back to you as soon as possible.`);
      contactForm.reset();
    });
  }
});
