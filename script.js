const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const filterButtons = document.querySelectorAll('.filter');
const projectCards = document.querySelectorAll('.project-card');
const emptyState = document.querySelector('.empty-state');
const downloadCvLink = document.querySelector('[data-download-cv]');
const navAnchors = document.querySelectorAll('.nav-links a:not(.nav-cta)');
const sections = [...document.querySelectorAll('main section[id]')];

document.querySelector('#current-year').textContent = new Date().getFullYear();

downloadCvLink.addEventListener('click', async event => {
  event.preventDefault();
  try {
    const response = await fetch(downloadCvLink.href);
    if (!response.ok) throw new Error('CV download failed');
    const pdfBlob = await response.blob();
    const objectUrl = URL.createObjectURL(pdfBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = objectUrl;
    downloadLink.download = 'EVJ-Mondejar-CV.pdf';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  } catch {
    // If automatic downloads are blocked, open the CV in a new tab instead.
    const fallbackLink = document.createElement('a');
    fallbackLink.href = downloadCvLink.href;
    fallbackLink.target = '_blank';
    fallbackLink.rel = 'noopener noreferrer';
    document.body.appendChild(fallbackLink);
    fallbackLink.click();
    fallbackLink.remove();
  }
});

function updateHeader() {
  header.classList.toggle('is-scrolled', window.scrollY > 12);
}
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  navLinks.classList.toggle('open', !isOpen);
});

navLinks.addEventListener('click', event => {
  if (event.target.closest('a')) {
    menuToggle.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('open');
  }
});

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    const category = button.dataset.filter;
    let visibleCount = 0;
    filterButtons.forEach(item => item.classList.toggle('active', item === button));
    projectCards.forEach(card => {
      const show = category === 'all' || card.dataset.category === category;
      card.classList.toggle('hidden', !show);
      if (show) visibleCount += 1;
    });
    emptyState.hidden = visibleCount !== 0;
  });
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });
document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navAnchors.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-42% 0px -52% 0px' });
sections.forEach(section => sectionObserver.observe(section));
