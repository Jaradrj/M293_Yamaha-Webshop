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
  
  fetch('products/motorcycles.json')
    .then(res => res.json())
    .then(data => {
      motorcycles = data;
      if (isIndex) {
        renderHotProducts(); 
      } else {
        renderCards();          
      }
    })
    .catch(err => console.error('Fetch error:', err));
});

function renderCards() {
  const container = document.getElementById('card-container');
  container.innerHTML = '';
  motorcycles.forEach(moto => {
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
      <p>Year: ${moto.year}</p>
      <p style="color: red; font-weight: bold;">${moto.price} €</p>
      <a href="products.html/${moto.id}" class="see-more-btn">See More</a>
    `;
    container.appendChild(card);
  });
  document.querySelectorAll('.wishlist-heart').forEach(heart => {
    heart.addEventListener('click', function() {
      const productId = this.getAttribute('data-id');
      this.classList.toggle('active');
      toggleWishlistItem(productId);
    });
  });
}

function toggleWishlistItem(productId) {
  let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
  
  const index = wishlist.indexOf(productId);
  if (index === -1) {
    wishlist.push(productId);
  } else {
    wishlist.splice(index, 1);
  }
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

document.addEventListener('DOMContentLoaded', function() {
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

