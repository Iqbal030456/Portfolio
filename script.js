const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');

if (navToggle && nav) {
  navToggle.setAttribute('aria-expanded', 'false');

  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  document.querySelectorAll('.nav a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open menu');
    });
  });
}

const revealItems = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.12 }
);

revealItems.forEach((item) => observer.observe(item));

const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');

if (cursorDot && cursorRing) {
  const updateCursor = (event) => {
    const { clientX, clientY } = event;
    cursorDot.style.transform = `translate(${clientX}px, ${clientY}px)`;
    cursorRing.style.transform = `translate(${clientX}px, ${clientY}px)`;
  };

  window.addEventListener('pointermove', updateCursor);

  document.querySelectorAll('a, button, .project-card, .stat-card, .skill-card, .resume-card').forEach((element) => {
    element.addEventListener('mouseenter', () => {
      cursorRing.classList.add('active');
    });

    element.addEventListener('mouseleave', () => {
      cursorRing.classList.remove('active');
    });
  });
}

const navLinks = document.querySelectorAll('.nav a');
const sections = [...document.querySelectorAll('main section[id]')];

const setActiveLink = () => {
  const scrollPosition = window.scrollY + 160;

  let currentSection = sections[0]?.id || 'home';

  sections.forEach((section) => {
    if (scrollPosition >= section.offsetTop) {
      currentSection = section.id;
    }
  });

  navLinks.forEach((link) => {
    const target = link.getAttribute('href');
    link.classList.toggle('active', target === `#${currentSection}`);
  });
};

window.addEventListener('scroll', setActiveLink, { passive: true });
setActiveLink();
