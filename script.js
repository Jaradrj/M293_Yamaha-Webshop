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
    const template = document.getElementById('product-card-template');
    const card = template.content.cloneNode(true); 
    const cardElement = card.querySelector('.card');
    const heart = cardElement.querySelector('.wishlist-heart');
    const image = cardElement.querySelector('img');
    const name = cardElement.querySelector('h2');
    const year = cardElement.querySelector('.year');
    const price = cardElement.querySelector('.price');
    const link = cardElement.querySelector('.see-more-btn');

    heart.setAttribute('data-id', moto.id);
    image.src = moto.image;
    image.alt = moto.name;
    name.textContent = moto.name;
    if (moto.year) year.textContent = `Year: ${moto.year}`;
    price.textContent = `${moto.price.toFixed(2)} €`;
    link.href = `product.html?id=${moto.id}`;
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
  const template = document.getElementById('hot-product-template');

  if (!container || !template) {
    return;
  }

  const hotProducts = motorcycles.slice(0, 4);
  container.innerHTML = ''; 

  hotProducts.forEach(product => {
    const card = template.content.cloneNode(true); 
    const image = card.querySelector('img');
    const title = card.querySelector('h3');
    
    image.src = product.image;
    image.alt = product.name;
    title.textContent = product.name;
 
    card.querySelector('.new_products-card').dataset.id = product.id;
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
        showError('Product not found.');
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
  const productTemplate = document.getElementById('product-template');
  const orderFormTemplate = document.getElementById('order-form-template');
  
  if (!container || !productTemplate || !orderFormTemplate) return;

  const productClone = productTemplate.content.cloneNode(true);
  productClone.querySelector('img').src = product.image;
  productClone.querySelector('img').alt = product.name;
  productClone.querySelector('h2').textContent = product.name;
  productClone.querySelector('.year').innerHTML = product.year ? `<strong>Year:</strong> ${product.year}` : '';
  productClone.querySelector('.price').textContent = `${product.price.toFixed(2)} €`;
  productClone.querySelector('.description').textContent = product.description || 'No description available yet';
  
  if (product.sound) {
    productClone.querySelector('.play-audio-btn').style.display = 'block';
    productClone.querySelector('.product-audio').src = product.sound;
  } else {
    productClone.querySelector('.play-audio-btn').style.display = 'none';
  }

  container.appendChild(productClone);
  const orderFormClone = orderFormTemplate.content.cloneNode(true);
  container.appendChild(orderFormClone);
  const playBtn = container.querySelector('.play-audio-btn');
  const audioEl = container.querySelector('.product-audio');
  
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
