/* ===== Config ===== */
const CONTACT_EMAIL = "vowelorg@gmail.com"; // <-- Email address

/* ===== Header scroll + hamburger ===== */
const topbar = document.getElementById('topbar');
const hamburger = document.getElementById('hamburger');
const mobilePanel = document.getElementById('mobilePanel');

window.addEventListener('scroll', () => {
  if (window.scrollY > 10) topbar.classList.add('scrolled');
  else topbar.classList.remove('scrolled');
});

hamburger.addEventListener('click', () => {
  mobilePanel.style.display = (mobilePanel.style.display === 'block') ? 'none' : 'block';
});
mobilePanel.addEventListener('click', e => {
  if (e.target.tagName === 'A') mobilePanel.style.display = 'none';
});

/* ===== Cursor peach gradient (mouse + touch) ===== */
const glow = document.getElementById('cursorGlow');
function setGlow(x, y){
  glow.style.setProperty('--x', x + 'px');
  glow.style.setProperty('--y', y + 'px');
}
window.addEventListener('mousemove', e => setGlow(e.clientX, e.clientY));
window.addEventListener('touchmove', e => {
  const t = e.touches[0]; if (t) setGlow(t.clientX, t.clientY);
}, {passive:true});

/* ===== Reveal on scroll ===== */
const io = new IntersectionObserver((entries)=>{
  entries.forEach(ent=>{
    if(ent.isIntersecting){ 
      ent.target.classList.add('in'); 
    } else {
      ent.target.classList.remove('in');
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
});

// Observe elements when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
});

/* ===== Contact form (mailto) ===== */
const form = document.getElementById('contactForm');
form.addEventListener('submit', (e)=>{
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const msg = document.getElementById('message').value.trim();
  const subject = encodeURIComponent(`Message from ${name}`);
  const body = encodeURIComponent(`From: ${name} <${email}>\n\n${msg}`);
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
});

/* ===== Events: load from /events/events.json =====
   JSON shape: [{ "image":"event1.jpg", "caption":"Short caption", "story":"Full story..." }, ...]
*/
/* ===== Events: load from /events/events.json ===== */
const grid = document.getElementById("eventsGrid");
const modal = document.createElement("div");
modal.className = "modal";
modal.innerHTML = `
  <div class="modal-card">
    <button class="modal-close" aria-label="Close">✕</button>
    <img class="modal-img" alt="">
    <div class="modal-body">
      <h3 style="margin:.4rem 0 0.2rem; color:var(--peach)"></h3>
      <p class="story" style="margin:.2rem 0 1rem; color:#e9e9ee"></p>
    </div>
  </div>`;
document.body.appendChild(modal);

const mClose = modal.querySelector(".modal-close");
const mImg = modal.querySelector(".modal-img");
const mTitle = modal.querySelector("h3");
const mStory = modal.querySelector(".story");

let slideshowInterval;
let currentIndex = 0;
let currentImages = [];

// Open modal with slideshow
function openModal(images, caption, story) {
  currentImages = images;
  currentIndex = 0;

  mImg.src = `events/${currentImages[currentIndex]}`;
  mTitle.textContent = caption || "Event";
  mStory.textContent = story || "";

  modal.classList.add("open");

  clearInterval(slideshowInterval);
  slideshowInterval = setInterval(() => {
    currentIndex = (currentIndex + 1) % currentImages.length;
    fadeToImage(`events/${currentImages[currentIndex]}`);
  }, 3000); // change image every 3s
}

// Fade transition helper
function fadeToImage(newSrc) {
  mImg.classList.add("fade-out");
  setTimeout(() => {
    mImg.src = newSrc;
    mImg.classList.remove("fade-out");
    mImg.classList.add("fade-in");
    setTimeout(() => mImg.classList.remove("fade-in"), 500);
  }, 500);
}

function closeModal() {
  modal.classList.remove("open");
  clearInterval(slideshowInterval);
}

mClose.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

async function loadEvents() {
  try {
    const res = await fetch("events/events.json");
    const items = await res.json();

    items.forEach((it) => {
      const card = document.createElement("div");
      card.className = "event-card";
      const preview = `events/${it.images[0]}`; // show first image as preview
      card.innerHTML = `
        <img src="${preview}" alt="${it.caption || "Event"}">
        <div class="event-cap">${it.caption || ""}</div>`;
      card.addEventListener("click", () => openModal(it.images, it.caption, it.story));
      grid.appendChild(card);
    });
  } catch (err) {
    console.error("Failed to load events:", err);
    grid.innerHTML = `<p style="color:#bbb">Add <code>/events/events.json</code> and images in <code>/events/</code> to see your gallery.</p>`;
  }
}
loadEvents();

/* ===== Officer Modal ===== */

const cardsArray = ['🍎','🍌','🍇','🍒','🍋','🥝']; // icons
let cards = [...cardsArray, ...cardsArray]; // duplicate for pairs

// shuffle cards
cards = cards.sort(() => 0.5 - Math.random());

const gameBoard = document.getElementById('memory-game');
const gameResult = document.getElementById('gameResult');

let flipped = [];
let matched = [];

cards.forEach((icon, index) => {
  const card = document.createElement('div');
  card.classList.add('card');
  card.dataset.icon = icon;
  card.innerHTML = icon;
  
  card.addEventListener('click', () => flipCard(card));
  gameBoard.appendChild(card);
});

function flipCard(card){
  if(flipped.length < 2 && !card.classList.contains('flipped')){
    card.classList.add('flipped');
    flipped.push(card);

    if(flipped.length === 2){
      setTimeout(checkMatch, 600);
    }
  }
}

function checkMatch(){
  const [c1, c2] = flipped;
  if(c1.dataset.icon === c2.dataset.icon){
    matched.push(c1, c2);
    if(matched.length === cards.length){
      gameResult.textContent = "🎉 You won!";
    }
  } else {
    c1.classList.remove('flipped');
    c2.classList.remove('flipped');
  }
  flipped = [];
}

/* Year in footer */
document.getElementById('year').textContent = new Date().getFullYear();

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initOfficers();

  // Initialize officer modal events
  const modal = document.getElementById('officerModal');
  const closeBtn = document.getElementById('modalCloseBtn');

  if (modal && closeBtn) {
    // Close when X button is clicked
    closeBtn.addEventListener('click', () => closeOfficerModal());

    // Close when clicking outside the modal
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeOfficerModal();
    });
  }

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeOfficerModal();
  });
});

/* modal control helpers */
function openOfficerModal(officerData) {
  const modal = document.getElementById('officerModal');
  if (!modal) {
    console.error('Officer modal not found');
    return;
  }
  
  const img = modal.querySelector('#modalImg');
  const name = modal.querySelector('#modalName');
  const role = modal.querySelector('#modalRole');
  const works = modal.querySelector('#modalWorks');

  if (img && name && role && works) {
    // Use altImg for modal if available, otherwise fallback to main img
    img.src = officerData.altImg || officerData.img || '';
    img.alt = officerData.role || officerData.name || '';
    name.textContent = officerData.name || '';
    role.textContent = officerData.role || '';
    works.textContent = officerData.works || '';

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    
    // Focus the close button for accessibility
    const closeBtn = modal.querySelector('#modalCloseBtn');
    if (closeBtn) closeBtn.focus();
  } else {
    console.error('Modal elements not found');
  }
}

function closeOfficerModal() {
  const modal = document.getElementById('officerModal');
  if (!modal) {
    console.error('Officer modal not found for closing');
    return;
  }
  
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  
  // Clear the image source to prevent showing previous officer's image
  const img = modal.querySelector('#modalImg');
  if (img) img.src = '';
  
  // Clear text content
  const name = modal.querySelector('#modalName');
  const role = modal.querySelector('#modalRole');
  const works = modal.querySelector('#modalWorks');
  
  if (name) name.textContent = '';
  if (role) role.textContent = '';
  if (works) works.textContent = '';
  
  console.log('Officer modal closed successfully');
}

async function initOfficers() {
  // Define committee containers mapping
  const committeeContainers = {
    'Executive Position': 'executiveContainer',
    'Budget and Resources Committee': 'budgetContainer',
    'Membership & Records Committee': 'membershipRecordsContainer',
    'Media & Publicity Committee': 'mediaContainer',
    'Creative Development Team': 'creativeContainer'
  };

  try {
    const res = await fetch('officers/officers.json');
    if (!res.ok) throw new Error('Failed to fetch officers.json');
    const officers = await res.json();

    // Group officers by committee
    const groups = officers.reduce((acc, o) => {
      (acc[o.committee] = acc[o.committee] || []).push(o);
      return acc;
    }, {});

    // Clear all containers
    Object.values(committeeContainers).forEach(containerId => {
      const container = document.getElementById(containerId);
      if (container) container.innerHTML = '';
    });

    // Populate each committee section
    Object.keys(groups).forEach(committeeName => {
      const containerId = committeeContainers[committeeName];
      const container = document.getElementById(containerId);
      
      if (!container) {
        console.warn(`Container ${containerId} not found for committee ${committeeName}`);
        return;
      }

      const grid = document.createElement('div');
      grid.className = 'officers-grid';

      groups[committeeName].forEach((off, index) => {
        const card = document.createElement('div');
        card.className = 'officer';
        card.tabIndex = 0;

        card.innerHTML = `
          <div class="officer-image-container">
            <div class="officer-image-flip">
              <div class="officer-image-front">
                <img src="${off.img}" alt="${off.role}">
              </div>
              <div class="officer-image-back">
                <img src="logo.png" alt="VOWEL Logo">
              </div>
            </div>
          </div>
          <p><strong>${off.name}</strong><br>${off.role}</p>
        `;

        card.addEventListener('click', () => openOfficerModal(off));
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openOfficerModal(off);
          }
        });

        grid.appendChild(card);

        // Add staggered animation with observer
        const cardObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setTimeout(() => {
                entry.target.classList.add('animate-in');
              }, index * 100);
            } else {
              entry.target.classList.remove('animate-in');
            }
          });
        }, {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px'
        });
        
        cardObserver.observe(card);
      });

      container.appendChild(grid);
    });

  } catch (err) {
    console.error(err);
    // Show error in all containers
    Object.values(committeeContainers).forEach(containerId => {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = '<p style="color:#bbb">Unable to load officers. Check <code>/officers.json</code>.</p>';
      }
    });
  }
}

