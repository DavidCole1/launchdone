const { test, expect } = require('@playwright/test');

const PAGES = [
  { path: '/index.html', label: 'Home', activeHref: 'index.html' },
  { path: '/about.html', label: 'About', activeHref: 'about.html' },
  { path: '/services.html', label: 'Services', activeHref: 'services.html' },
  { path: '/how-it-works.html', label: 'How It Works', activeHref: 'how-it-works.html' },
  { path: '/contact.html', label: 'Contact', activeHref: 'contact.html' },
];

// ─── Page load smoke tests ────────────────────────────────────────────────────

for (const { path, label } of PAGES) {
  test(`${label} page: loads with no JS errors and nav is visible`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto(path);
    await expect(page.locator('.nav')).toBeVisible();
    expect(errors).toHaveLength(0);
  });
}

// ─── Active nav link ──────────────────────────────────────────────────────────

for (const { path, label, activeHref } of PAGES) {
  test(`${label} page: correct nav link is marked active`, async ({ page }) => {
    await page.goto(path);
    const activeLink = page.locator('.nav__links a.active');
    await expect(activeLink).toHaveAttribute('href', activeHref);
  });
}

// ─── Hamburger menu ───────────────────────────────────────────────────────────

test('mobile: hamburger opens the mobile menu', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/index.html');
  const hamburger = page.locator('.nav__hamburger');
  const mobileMenu = page.locator('.nav__mobile');

  await hamburger.click();
  await expect(hamburger).toHaveAttribute('aria-expanded', 'true');
  await expect(hamburger).toHaveClass(/open/);
  await expect(mobileMenu).toHaveClass(/open/);
});

test('mobile: hamburger closes the mobile menu on second click', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/index.html');
  const hamburger = page.locator('.nav__hamburger');
  const mobileMenu = page.locator('.nav__mobile');

  await hamburger.click();
  await hamburger.click();
  await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
  await expect(hamburger).not.toHaveClass(/open/);
  await expect(mobileMenu).not.toHaveClass(/open/);
});

test('mobile: clicking a mobile nav link closes the menu', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/index.html');
  const hamburger = page.locator('.nav__hamburger');
  const mobileMenu = page.locator('.nav__mobile');

  await hamburger.click();
  await mobileMenu.locator('a[href="about.html"]').click();
  await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
  await expect(mobileMenu).not.toHaveClass(/open/);
});

// ─── Sticky nav ───────────────────────────────────────────────────────────────

test('desktop: nav gains scrolled class after scrolling past 10px', async ({ page }) => {
  await page.goto('/index.html');
  await page.evaluate(() => window.scrollTo(0, 50));
  await expect(page.locator('.nav')).toHaveClass(/scrolled/);
});

test('desktop: nav loses scrolled class when back at top', async ({ page }) => {
  await page.goto('/index.html');
  await page.evaluate(() => window.scrollTo(0, 50));
  await expect(page.locator('.nav')).toHaveClass(/scrolled/);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(page.locator('.nav')).not.toHaveClass(/scrolled/);
});

// ─── Smooth scroll ────────────────────────────────────────────────────────────

test('anchor links scroll the page without a hard navigation', async ({ page }) => {
  await page.goto('/index.html');
  const initialUrl = page.url();
  const anchorLink = page.locator('a[href^="#"]').first();
  await anchorLink.click();
  // URL may gain a hash but should not navigate to a new page
  expect(page.url().replace(/#.*$/, '')).toBe(initialUrl.replace(/#.*$/, ''));
  // Wait for smooth scroll to settle then check position
  await page.waitForFunction(() => window.scrollY > 0, { timeout: 2000 });
  const scrollY = await page.evaluate(() => window.scrollY);
  expect(scrollY).toBeGreaterThan(0);
});
