const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const filterButtons = document.querySelectorAll('.filter');
const projectCards = document.querySelectorAll('.project-card');
const emptyState = document.querySelector('.empty-state');
const downloadCvLink = document.querySelector('[data-download-cv]');
const navAnchors = document.querySelectorAll('.nav-links a:not(.nav-cta)');
const sections = [...document.querySelectorAll('main section[id]')];
const themeToggle = document.querySelector('.theme-toggle');

function applyTheme(theme) {
  const isDark = theme === 'dark';
  document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
  themeToggle.setAttribute('aria-pressed', String(isDark));
  themeToggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
  themeToggle.title = `Switch to ${isDark ? 'light' : 'dark'} mode`;
  themeToggle.querySelector('i').className = `fa-solid fa-${isDark ? 'sun' : 'moon'}`;
  themeToggle.querySelector('.theme-toggle-text').textContent = isDark ? 'Light' : 'Dark';
}

applyTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
themeToggle.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(theme);
  try { localStorage.setItem('portfolio-theme', theme); } catch (_) { /* Theme preference is optional. */ }
});

function initAmbientCanvas() {
  const canvas = document.querySelector('.ambient-canvas');
  const context = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!context || reduceMotion.matches) {
    canvas.remove();
    return;
  }

  let width = 0;
  let height = 0;
  let scale = 1;
  let lastFrame = performance.now();
  let animationFrame;
  let targetScroll = window.scrollY;
  let displayedScroll = targetScroll;
  let pointerX = window.innerWidth * 0.5;
  let pointerY = window.innerHeight * 0.5;
  const trail = [];
  const stars = [];

  const colors = () => document.documentElement.dataset.theme === 'dark'
    ? { orb: '134, 165, 255', accent: '216, 255, 110' }
    : { orb: '49, 94, 239', accent: '111, 162, 15' };

  function createStar() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 0.35 + Math.random() * 1.25,
      glow: 0.14 + Math.random() * 0.42,
      phase: Math.random() * Math.PI * 2
    };
  }

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    scale = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(scale, 0, 0, scale, 0, 0);

    const starCount = width < 760 ? 72 : 150;
    while (stars.length < starCount) stars.push(createStar());
    stars.length = starCount;
  }

  function drawTrail(particle, palette) {
    const radius = particle.radius * particle.life;
    const glow = context.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, radius);
    glow.addColorStop(0, `rgba(${palette.accent}, ${particle.life * 0.2})`);
    glow.addColorStop(0.35, `rgba(${palette.orb}, ${particle.life * 0.1})`);
    glow.addColorStop(1, `rgba(${palette.orb}, 0)`);
    context.fillStyle = glow;
    context.beginPath();
    context.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
    context.fill();
  }

  function drawSpaceScene(now, scrollOffset) {
    const time = now * 0.001;
    const sunX = width < 760 ? width * 0.78 : width * 0.87;
    // The solar system begins near the bottom and travels upward with scroll.
    const sunY = (height < 760 ? height * 0.82 : height * 0.80) - scrollOffset * 0.42;

    stars.forEach(star => {
      const brightness = star.glow * (0.72 + Math.sin(time * 1.6 + star.phase) * 0.28);
      context.fillStyle = `rgba(225, 235, 255, ${brightness})`;
      context.beginPath();
      const starY = ((star.y - scrollOffset * 0.045) % height + height) % height;
      context.arc(star.x, starY, star.radius, 0, Math.PI * 2);
      context.fill();
    });

    const orbitX = width < 760 ? 72 : 110;
    const orbitY = width < 760 ? 32 : 52;
    const orbit = time * 0.46;
    const planetX = sunX + Math.cos(orbit) * orbitX;
    const planetY = sunY + Math.sin(orbit) * orbitY;
    const planetDepth = (Math.sin(orbit) + 1) / 2;
    const planetRadius = 8 + planetDepth * 5;

    context.strokeStyle = 'rgba(151, 180, 255, .16)';
    context.lineWidth = 1;
    context.beginPath();
    context.ellipse(sunX, sunY, orbitX, orbitY, 0, 0, Math.PI * 2);
    context.stroke();

    const sunGlow = context.createRadialGradient(sunX, sunY, 0, sunX, sunY, 34);
    sunGlow.addColorStop(0, 'rgba(255, 249, 190, .78)');
    sunGlow.addColorStop(.17, 'rgba(255, 211, 98, .40)');
    sunGlow.addColorStop(1, 'rgba(255, 181, 60, 0)');
    context.fillStyle = sunGlow;
    context.beginPath();
    context.arc(sunX, sunY, 34, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = 'rgba(255, 224, 126, .88)';
    context.beginPath();
    context.arc(sunX, sunY, 7, 0, Math.PI * 2);
    context.fill();

    const planetGlow = context.createRadialGradient(planetX - 2, planetY - 2, 0, planetX, planetY, planetRadius);
    planetGlow.addColorStop(0, 'rgba(188, 218, 255, .92)');
    planetGlow.addColorStop(.44, 'rgba(100, 142, 255, .60)');
    planetGlow.addColorStop(1, 'rgba(65, 89, 190, .04)');
    context.fillStyle = planetGlow;
    context.beginPath();
    context.arc(planetX, planetY, planetRadius, 0, Math.PI * 2);
    context.fill();
  }

  function drawLightScene(now, scrollOffset) {
    const time = now * 0.001;
    const pointerOffsetX = (pointerX / width - 0.5) * 42;
    const pointerOffsetY = (pointerY / height - 0.5) * 28;
    const gridSize = width < 760 ? 58 : 82;
    const gridShift = (scrollOffset * 0.08) % gridSize;

    // A very low-contrast perspective grid adds depth while staying behind the content.
    context.strokeStyle = 'rgba(49, 94, 239, .045)';
    context.lineWidth = 1;
    for (let x = -gridSize + gridShift; x < width + gridSize; x += gridSize) {
      context.beginPath();
      context.moveTo(x + pointerOffsetX * 0.16, 0);
      context.lineTo(x + pointerOffsetX * 0.16, height);
      context.stroke();
    }
    for (let y = -gridSize + gridShift; y < height + gridSize; y += gridSize) {
      context.beginPath();
      context.moveTo(0, y + pointerOffsetY * 0.12);
      context.lineTo(width, y + pointerOffsetY * 0.12);
      context.stroke();
    }

    const centerX = width * 0.84 + pointerOffsetX;
    const centerY = height * 0.20 + pointerOffsetY - scrollOffset * 0.06;
    const pulse = 1 + Math.sin(time * 1.3) * 0.035;
    const glow = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, 190 * pulse);
    glow.addColorStop(0, 'rgba(255, 210, 84, .16)');
    glow.addColorStop(.32, 'rgba(255, 210, 84, .065)');
    glow.addColorStop(1, 'rgba(255, 210, 84, 0)');
    context.fillStyle = glow;
    context.beginPath();
    context.arc(centerX, centerY, 190 * pulse, 0, Math.PI * 2);
    context.fill();

    context.strokeStyle = 'rgba(49, 94, 239, .14)';
    context.lineWidth = 1.2;
    [72, 112, 154].forEach((radius, index) => {
      context.beginPath();
      context.arc(centerX, centerY, radius * pulse, time * (index % 2 ? -0.04 : 0.06), Math.PI * 1.72 + time * (index % 2 ? -0.04 : 0.06));
      context.stroke();
    });
    context.fillStyle = 'rgba(255, 194, 52, .68)';
    context.beginPath();
    context.arc(centerX, centerY, 5, 0, Math.PI * 2);
    context.fill();
  }

  function render(now) {
    const timeStep = Math.min((now - lastFrame) / 16.67, 2.5);
    lastFrame = now;
    const palette = colors();
    context.clearRect(0, 0, width, height);
    displayedScroll += (targetScroll - displayedScroll) * 0.075;

    if (document.documentElement.dataset.theme === 'dark') drawSpaceScene(now, displayedScroll);
    else drawLightScene(now, displayedScroll);

    context.globalCompositeOperation = 'lighter';
    for (let index = trail.length - 1; index >= 0; index -= 1) {
      const particle = trail[index];
      particle.life -= 0.035 * timeStep;
      if (particle.life <= 0) {
        trail.splice(index, 1);
      } else {
        drawTrail(particle, palette);
      }
    }
    context.globalCompositeOperation = 'source-over';
    animationFrame = requestAnimationFrame(render);
  }

  window.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse') return;
    pointerX = event.clientX;
    pointerY = event.clientY;
    trail.unshift({ x: event.clientX, y: event.clientY, life: 1, radius: 46 });
    if (trail.length > 22) trail.pop();
  }, { passive: true });

  window.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse') return;
    trail.unshift({ x: event.clientX, y: event.clientY, life: 1.35, radius: 70 });
  }, { passive: true });

  window.addEventListener('scroll', () => {
    targetScroll = window.scrollY;
  }, { passive: true });

  window.addEventListener('resize', resizeCanvas, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(animationFrame);
    else {
      lastFrame = performance.now();
      animationFrame = requestAnimationFrame(render);
    }
  });

  resizeCanvas();
  animationFrame = requestAnimationFrame(render);
}

initAmbientCanvas();

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
