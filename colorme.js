'use strict';

/* ── Anti-Download Protections ── */
document.addEventListener('contextmenu', e => {
  if (e.target.tagName === 'IMG') e.preventDefault();
});
document.addEventListener('dragstart', e => {
  if (e.target.tagName === 'IMG') e.preventDefault();
});

/* ── Theme ── */
const root = document.documentElement;
const themeBtn = document.getElementById('themeBtn');
const sunIcon = document.getElementById('sunIcon');
const moonIcon = document.getElementById('moonIcon');

const applyTheme = (theme) => {
  root.setAttribute('data-theme', theme);
  sunIcon.style.display = theme === 'dark' ? 'none' : '';
  moonIcon.style.display = theme === 'dark' ? '' : 'none';
  localStorage.setItem('lazorr-theme', theme);
};

const saved = localStorage.getItem('lazorr-theme');
if (saved) applyTheme(saved);

themeBtn.addEventListener('click', () => {
  applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

/* ── Mobile Menu ── */
const hamburgerBtn = document.getElementById('hamburgerBtn');
const mobileMenu = document.getElementById('mobileMenu');

const toggleMenu = () => {
  hamburgerBtn.classList.toggle('open');
  mobileMenu.classList.toggle('open');
};
hamburgerBtn.addEventListener('click', toggleMenu);

document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburgerBtn.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});

/* ── Active Nav on Scroll ── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
const scrollObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });
sections.forEach(s => scrollObserver.observe(s));

/* ── Collection Data (16 Photos) ── */
const collection = {
  photo: [
    { url: "./media/IMG_0304.JPG.jpeg" },
    { url: "./media/IMG_2071.JPG.jpeg" },
    { url: "./media/grad.jpg" },
    { url: "./media/brand.jpg" },
    { url: "./media/IMG_5842.JPEG" },
    { url: "./media/IMG_5840.JPG.jpeg" },
    { url: "./media/IMG_5841.JPEG" },
    { url: "./media/IMG_5596.JPG.jpeg" },
    { url: "./media/IMG_5843.JPEG" },
    { url: "./media/IMG_5844.JPEG" },
    { url: "./media/IMG_5845.JPEG" },
    { url: "./media/couple.jpg" },
    { url: "./media/IMG_6986.JPG.jpeg" },
    { url: "./media/IMG_3356.JPG.jpeg" },
    { url: "./media/coolest.jpg" },
    { url: "./media/event.jpg" }
  ]
};

/* ── Render & Load More Logic ── */
const grid = document.getElementById('mainGrid');
const loadMoreContainer = document.getElementById('loadMoreContainer');
const loadMoreBtn = document.getElementById('loadMoreBtn');

let currentImages = collection.photo;
let visibleCount = 6;
let lightboxIndex = 0;

const renderItems = (items, startIndex = 0) => {
  items.forEach((item, i) => {
    const actualIndex = startIndex + i;
    const div = document.createElement('div');
    div.className = 'media-item';
    div.style.opacity = '0';
    div.style.transform = 'translateY(14px)';
    div.innerHTML = `<img src="${item.url}" loading="lazy" alt="Gallery image"><span class="expand-icon">&#x2922;</span>`;
    div.addEventListener('click', () => openLightbox(actualIndex));
    grid.appendChild(div);
    
    setTimeout(() => {
      div.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
      div.style.opacity = '1';
      div.style.transform = 'translateY(0)';
    }, i * 80);
  });
};

const render = () => {
  grid.innerHTML = '';
  const initialItems = currentImages.slice(0, visibleCount);
  renderItems(initialItems);
  
  if (currentImages.length > visibleCount) {
    loadMoreContainer.style.display = 'block';
  }
};

if (loadMoreBtn) {
  loadMoreBtn.addEventListener('click', () => {
    const newStartIndex = visibleCount;
    visibleCount += 10;
    const nextItems = currentImages.slice(newStartIndex, visibleCount);
    renderItems(nextItems, newStartIndex);
    
    if (visibleCount >= currentImages.length) {
      loadMoreContainer.style.display = 'none';
    }
  });
}

/* ── Lightbox ── */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCounter = document.getElementById('lightboxCounter');

const updateLightbox = () => {
  lightboxImg.src = currentImages[lightboxIndex].url;
  lightboxCounter.textContent = `${lightboxIndex + 1} / ${currentImages.length}`;
};

const openLightbox = (i) => {
  lightboxIndex = i;
  updateLightbox();
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
};

const closeLightbox = () => {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
};

const changeImage = (dir) => {
  lightboxIndex = (lightboxIndex + dir + currentImages.length) % currentImages.length;
  updateLightbox();
};

document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.getElementById('lightboxPrev').addEventListener('click', () => changeImage(-1));
document.getElementById('lightboxNext').addEventListener('click', () => changeImage(1));

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') changeImage(-1);
  if (e.key === 'ArrowRight') changeImage(1);
});

/* ── Swipe support ── */
let touchStartX = 0;
lightbox.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
lightbox.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) changeImage(dx < 0 ? 1 : -1);
});

/* ── Scroll Reveal ── */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal, .team-member, .service-card').forEach((el, i) => {
  if (el.classList.contains('service-card') || el.classList.contains('team-member')) {
    el.style.transitionDelay = (i % 3) * 0.1 + 's';
  }
  revealObs.observe(el);
});

/* ── Contact Form ── */
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
contactForm.addEventListener('submit', e => {
  e.preventDefault();
  submitBtn.textContent = 'Sending...';
  submitBtn.disabled = true;
  setTimeout(() => {
    submitBtn.textContent = 'Sent \u2713';
    submitBtn.style.background = 'var(--accent-warm)';
    submitBtn.style.borderColor = 'var(--accent-warm)';
    submitBtn.style.color = '#fff';
    contactForm.reset();
    setTimeout(() => {
      submitBtn.textContent = 'Send Request';
      submitBtn.style.background = '';
      submitBtn.style.borderColor = '';
      submitBtn.style.color = '';
      submitBtn.disabled = false;
    }, 3500);
  }, 1000);
});

/* ── Init ── */
render();
