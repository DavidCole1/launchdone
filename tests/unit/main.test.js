'use strict';

const NAV_HTML = `
  <nav class="nav">
    <div class="nav__inner">
      <div class="nav__links">
        <a href="index.html">Home</a>
        <a href="about.html">About</a>
        <a href="services.html">Services</a>
      </div>
      <button class="nav__hamburger" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
    <div class="nav__mobile">
      <a href="index.html">Home</a>
      <a href="about.html">About</a>
    </div>
  </nav>
  <div class="fade-in"></div>
  <div class="fade-in"></div>
  <a href="#section1">Jump to section</a>
  <div id="section1"></div>
`;

function loadScript() {
  jest.resetModules();
  require('../../main.js');
}

beforeEach(() => {
  document.body.innerHTML = NAV_HTML;
  Element.prototype.scrollIntoView = jest.fn();
});

// ─── Sticky nav ────────────────────────────────────────────────────────────

describe('sticky nav', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'scrollY', { writable: true, configurable: true, value: 0 });
    loadScript();
  });

  test('adds scrolled class when scrollY exceeds 10', () => {
    window.scrollY = 20;
    window.dispatchEvent(new Event('scroll'));
    expect(document.querySelector('.nav').classList.contains('scrolled')).toBe(true);
  });

  test('removes scrolled class when scrollY drops to 10 or below', () => {
    window.scrollY = 20;
    window.dispatchEvent(new Event('scroll'));
    window.scrollY = 5;
    window.dispatchEvent(new Event('scroll'));
    expect(document.querySelector('.nav').classList.contains('scrolled')).toBe(false);
  });

  test('does not add scrolled class when scrollY is exactly 10', () => {
    window.scrollY = 10;
    window.dispatchEvent(new Event('scroll'));
    expect(document.querySelector('.nav').classList.contains('scrolled')).toBe(false);
  });
});

// ─── Hamburger menu ─────────────────────────────────────────────────────────

describe('hamburger menu', () => {
  beforeEach(() => {
    loadScript();
  });

  test('opens menu on hamburger click', () => {
    const hamburger = document.querySelector('.nav__hamburger');
    const mobileMenu = document.querySelector('.nav__mobile');
    hamburger.click();
    expect(hamburger.classList.contains('open')).toBe(true);
    expect(mobileMenu.classList.contains('open')).toBe(true);
    expect(hamburger.getAttribute('aria-expanded')).toBe('true');
  });

  test('closes menu on second hamburger click', () => {
    const hamburger = document.querySelector('.nav__hamburger');
    const mobileMenu = document.querySelector('.nav__mobile');
    hamburger.click();
    hamburger.click();
    expect(hamburger.classList.contains('open')).toBe(false);
    expect(mobileMenu.classList.contains('open')).toBe(false);
    expect(hamburger.getAttribute('aria-expanded')).toBe('false');
  });

  test('closes menu when a mobile nav link is clicked', () => {
    const hamburger = document.querySelector('.nav__hamburger');
    const mobileMenu = document.querySelector('.nav__mobile');
    hamburger.click();
    mobileMenu.querySelector('a').click();
    expect(hamburger.classList.contains('open')).toBe(false);
    expect(mobileMenu.classList.contains('open')).toBe(false);
    expect(hamburger.getAttribute('aria-expanded')).toBe('false');
  });
});

// ─── Active nav link ─────────────────────────────────────────────────────────

describe('active nav link', () => {
  function setPathname(pathname) {
    delete window.location;
    window.location = { pathname };
  }

  test('marks the matching desktop and mobile link as active', () => {
    setPathname('/about.html');
    loadScript();
    const activeLinks = [...document.querySelectorAll('.nav__links a.active, .nav__mobile a.active')];
    expect(activeLinks.length).toBeGreaterThan(0);
    activeLinks.forEach(link => expect(link.getAttribute('href')).toBe('about.html'));
  });

  test('marks index.html as active when pathname is the root /', () => {
    setPathname('/');
    loadScript();
    const activeLinks = [...document.querySelectorAll('.nav__links a.active, .nav__mobile a.active')];
    expect(activeLinks.length).toBeGreaterThan(0);
    activeLinks.forEach(link => expect(link.getAttribute('href')).toBe('index.html'));
  });

  test('marks index.html as active when pathname is empty', () => {
    setPathname('');
    loadScript();
    const activeLinks = [...document.querySelectorAll('.nav__links a.active, .nav__mobile a.active')];
    expect(activeLinks.length).toBeGreaterThan(0);
    activeLinks.forEach(link => expect(link.getAttribute('href')).toBe('index.html'));
  });

  test('does not mark unrelated links as active', () => {
    setPathname('/about.html');
    loadScript();
    const wrongLinks = [...document.querySelectorAll('.nav__links a.active, .nav__mobile a.active')]
      .filter(link => link.getAttribute('href') !== 'about.html');
    expect(wrongLinks).toHaveLength(0);
  });
});

// ─── IntersectionObserver fallback ──────────────────────────────────────────

describe('fade-in fallback', () => {
  test('adds visible class immediately to all .fade-in elements when IntersectionObserver is unavailable', () => {
    const saved = window.IntersectionObserver;
    delete window.IntersectionObserver;
    loadScript();
    document.querySelectorAll('.fade-in').forEach(el => {
      expect(el.classList.contains('visible')).toBe(true);
    });
    window.IntersectionObserver = saved;
  });

  test('observes each .fade-in element when IntersectionObserver is available', () => {
    const mockObserve = jest.fn();
    window.IntersectionObserver = jest.fn(() => ({ observe: mockObserve, unobserve: jest.fn() }));
    loadScript();
    const fadeCount = document.querySelectorAll('.fade-in').length;
    expect(mockObserve).toHaveBeenCalledTimes(fadeCount);
    delete window.IntersectionObserver;
  });

  test('unobserves an element after it becomes visible', () => {
    const mockUnobserve = jest.fn();
    let capturedCallback;
    window.IntersectionObserver = jest.fn((cb) => {
      capturedCallback = cb;
      return { observe: jest.fn(), unobserve: mockUnobserve };
    });
    loadScript();
    const el = document.querySelector('.fade-in');
    capturedCallback([{ isIntersecting: true, target: el }]);
    expect(el.classList.contains('visible')).toBe(true);
    expect(mockUnobserve).toHaveBeenCalledWith(el);
    delete window.IntersectionObserver;
  });

  test('does not add visible class when element is not intersecting', () => {
    let capturedCallback;
    window.IntersectionObserver = jest.fn((cb) => {
      capturedCallback = cb;
      return { observe: jest.fn(), unobserve: jest.fn() };
    });
    loadScript();
    const el = document.querySelector('.fade-in');
    capturedCallback([{ isIntersecting: false, target: el }]);
    expect(el.classList.contains('visible')).toBe(false);
    delete window.IntersectionObserver;
  });
});

// ─── Smooth scroll ───────────────────────────────────────────────────────────

describe('smooth scroll', () => {
  beforeEach(() => {
    loadScript();
  });

  test('calls preventDefault when anchor target exists in the DOM', () => {
    const anchor = document.querySelector('a[href="#section1"]');
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    jest.spyOn(event, 'preventDefault');
    anchor.dispatchEvent(event);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  test('calls scrollIntoView on the target element', () => {
    const anchor = document.querySelector('a[href="#section1"]');
    anchor.click();
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });
});
