let motorcycles = [];
let flippedCards = new Set();

document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;
    slides[currentSlide].classList.add('active');
    setInterval(() => {
      slides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add('active');
    }, 5000);
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
    } else {
      renderCards();
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
    burger.addEventListener('click', function() {
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
  const category = document.getElementById('category-filter').value;
  const sort = document.getElementById('sort-filter').value;

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
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
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
      toggleWishlistItem(productId);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  if (!productId) {
    showError('Produkt-ID wurde nicht gefunden.');
    return;
  }

  Promise.all([
    fetch('products/motorcycles.json').then(res => res.json()),
    fetch('products/spareparts.json').then(res => res.json())
  ])
  .then(([motorcycles, spareparts]) => {
    const allProducts = [...motorcycles, ...spareparts];
    const product = allProducts.find(p => p.id.toString() === productId);

    if (!product) {
      showError('Produkt wurde nicht gefunden.');
      return;
    }
    renderProduct(product);
  })
  .catch(err => {
    console.error(err);
    showError('Beim Laden des Produkts ist ein Fehler aufgetreten.');
  });

  function showError(message) {
    const container = document.getElementById('product-detail-container');
    container.innerHTML = `<p style="color: red; text-align: center; font-weight: bold;">${message}</p>`;
  }

  function renderProduct(product) {
    const container = document.getElementById('product-detail-container');
    const imageSrc = product.image && product.image.trim() !== '' ? product.image : 'images/placeholder.png';
    container.innerHTML = `
    <div class="product-wrapper">
    <div class="product-content">
    <div style="display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; align-items: flex-start;">
      <img src="${imageSrc}" alt="${product.name}" style="max-width: 350px; width: 100%; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);" onerror="this.src='images/placeholder.png';" />
      <div style="flex: 1; min-width: 280px;">
        <h2 style="margin-top: 0;">${product.name}</h2>
        ${product.year ? `<p><strong>Year:</strong> ${product.year}</p>` : ''}
        <p style="font-weight: bold; color: #cc0000; font-size: 1.25rem;">${product.price.toFixed(2)} €</p>
        <a href="cart.html" class="see-more-btn" style="margin-top: 1rem; display: inline-block;">In den Warenkorb</a>
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
  }
});
