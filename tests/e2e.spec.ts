import { test, expect } from '@playwright/test';

// Helper to slow down for visual observation
const humanDelay = async (ms = 300) => new Promise(r => setTimeout(r, ms));

// End-to-end visible flow covering both builders, cart, and checkout.
// Assumes the app is served at http://localhost:8080

test.describe('Marmita One - fluxo completo visível', () => {
  test('Fluxo: escolher presets (iPhone) e finalizar checkout', async ({ page, baseURL }) => {
    await page.goto(baseURL!);
    await humanDelay(500);

    // Start screen
    await expect(page.locator('#start-menu')).toBeVisible();
    await page.click('#btn-flow-preset');
    await humanDelay();

    // iOS builder visible, presets shown
    await expect(page.locator('#builder-ios')).toBeVisible();
    await expect(page.locator('#ios-op1-desc')).toContainText('Arroz');

    // Apply preset 1 and add to cart
    await page.click('#btn-op1');
    await humanDelay();
    await page.click('#btn-add-ios');
    await humanDelay();

    // Cart should have 1 item
    await expect(page.locator('#cart-list .cart-item')).toHaveCount(1);

    // Fill checkout data
    await page.fill('#nome', 'Cliente Teste');
    await page.fill('#endereco', 'Rua A, 123, Casa');
    await page.fill('#bairro', 'Centro');
    await page.fill('#referencia', 'Perto da praça');
    await page.fill('#hora', '12:30');
    await page.selectOption('#pagamento', { label: 'PIX' });
    await humanDelay();

    // Preview should contain PIX note
    await expect(page.locator('#preview')).toContainText('PIX');

    // Copy and WhatsApp buttons visible
    await expect(page.locator('#btn-copy')).toBeVisible();
    await expect(page.locator('#btn-wa')).toBeVisible();

    // Add a second item using default builder
    await page.click('#btn-mode-default');
    await humanDelay();

    // Ensure default builder visible
    await expect(page.locator('#builder-default')).toBeVisible();

    // Select size P and protein
    await page.locator('#sec-tamanho .item input[type="radio"]').first().check();
    await page.locator('#sec-proteina .chip input[type="radio"]').first().check();

    // Select a few sides (limit may be 0 meaning unlimited)
    const accChecks = page.locator('#sec-acc .chip input[type="checkbox"]');
    const accCount = await accChecks.count();
    for (let i = 0; i < Math.min(3, accCount); i++) {
      await accChecks.nth(i).check();
      await humanDelay(150);
    }

    // Add one add-on and one meat extra if available
    const add2 = page.locator('#sec-add2 .chip input[type="checkbox"]');
    if (await add2.count()) { await add2.first().check(); }
    const add8 = page.locator('#sec-add8 .chip input[type="checkbox"]');
    if (await add8.count()) { await add8.first().check(); }

    // Select one beverage if exists
    const beb = page.locator('#sec-bebidas .item input[type="checkbox"]');
    if (await beb.count()) { await beb.first().check(); }

    // Add observation and add to cart
    await page.fill('#obs-item', 'Sem pimenta, por favor');
    await page.click('#btn-add');
    await humanDelay();

    // Cart should have 2 items now
    await expect(page.locator('#cart-list .cart-item')).toHaveCount(2);

    // Change payment to cash and set troco
    await page.selectOption('#pagamento', { label: 'Dinheiro' });
    await humanDelay();
    await expect(page.locator('#troco-wrap')).toBeVisible();
    await page.fill('#troco', '50');

    // Preview should reflect troco
    await expect(page.locator('#preview')).toContainText('Troco para');

    // Remove first cart item to test removal
    await page.locator('#cart-list .cart-item .actions .btn-danger').first().click();
    await humanDelay();

    // Cart should have 1 item remaining
    await expect(page.locator('#cart-list .cart-item')).toHaveCount(1);

    // Clear cart entirely
    await page.click('#btn-clear-cart');
    await expect(page.locator('#cart-list .cart-item')).toHaveCount(0);
  });
});
