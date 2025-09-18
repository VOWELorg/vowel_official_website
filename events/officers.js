<script>
document.addEventListener('DOMContentLoaded', () => {
  loadOfficers();
  // escape key to close modal
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
});

async function loadOfficers(){
  try {
    const res = await fetch('officers.json');
    if (!res.ok) throw new Error('Failed to load officers.json');
    const officers = await res.json();

    const container = document.getElementById('officersContainer');
    container.innerHTML = ''; // clear

    // group by committee
    const groups = officers.reduce((acc, o) => {
      (acc[o.committee] = acc[o.committee] || []).push(o);
      return acc;
    }, {});

    Object.keys(groups).forEach(committeeName => {
      const section = document.createElement('div');
      section.className = 'committee';
      const h3 = document.createElement('h3');
      h3.textContent = committeeName;
      section.appendChild(h3);

      const grid = document.createElement('div');
      grid.className = 'officers-grid';

      groups[committeeName].forEach(off => {
        const card = document.createElement('div');
        card.className = 'officer';
        card.setAttribute('tabindex','0'); // keyboard access
        // store data
        card.dataset.name = off.name;
        card.dataset.role = off.role;
        card.dataset.img = off.img;
        card.dataset.works = off.works || '';

        card.innerHTML = `
          <img src="${off.img}" alt="${off.role}">
          <p><strong>${off.name}</strong><br>${off.role}</p>
        `;

        // click + keyboard handlers
        card.addEventListener('click', openModalFromCard);
        card.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModalFromCard.call(card); }
        });

        grid.appendChild(card);
      });

      section.appendChild(grid);
      container.appendChild(section);
    });

  } catch (err) {
    console.error(err);
    const c = document.getElementById('officersContainer');
    if (c) c.innerHTML = '<p style="color:#bbb">Unable to load officers. Make sure <code>/officers.json</code> exists and you are serving the site over HTTP.</p>';
  }
}

function openModalFromCard() {
  const modal = document.getElementById('officerModal');
  if(!modal) return;
  document.getElementById('modalImg').src = this.dataset.img || '';
  document.getElementById('modalName').textContent = this.dataset.name || '';
  document.getElementById('modalRole').textContent = this.dataset.role || '';
  document.getElementById('modalWorks').textContent = this.dataset.works || '';
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  // focus for accessibility
  modal.querySelector('.modal-card').focus();
}

function closeModal(){
  const modal = document.getElementById('officerModal');
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
}

// close by clicking outside card
document.addEventListener('click', (e) => {
  const modal = document.getElementById('officerModal');
  if(modal && modal.classList.contains('open') && e.target === modal) closeModal();
});
</script>
