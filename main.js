/* ============================================================
   LaunchDone — Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ----- Sticky nav shadow on scroll ----- */
  var nav = document.querySelector('.nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  /* ----- Hamburger menu toggle ----- */
  var hamburger  = document.querySelector('.nav__hamburger');
  var mobileMenu = document.querySelector('.nav__mobile');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      var isOpen = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    /* Close mobile menu when a link inside it is clicked */
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ----- Active nav link (match current page) ----- */
  var currentFile = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__links a, .nav__mobile a').forEach(function (link) {
    var href = link.getAttribute('href') || '';
    if (href === currentFile || (currentFile === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ----- Intersection Observer — fade-in on scroll ----- */
  var fadeElements = document.querySelectorAll('.fade-in');
  if ('IntersectionObserver' in window && fadeElements.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); /* fire once */
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -48px 0px'
    });

    fadeElements.forEach(function (el) { observer.observe(el); });
  } else {
    /* Fallback: show everything immediately */
    fadeElements.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ----- Smooth scroll for anchor links (# only) ----- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();
