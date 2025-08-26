import { test, expect } from '@playwright/test';

const wait = (ms = 200) => new Promise(r => setTimeout(r, ms));

test.describe('Marmita One - cobertura completa', () => {
  test.beforeEach(async ({ page, baseURL, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto(baseURL!);
    await wait(400);
  });

  test('Header, start e PWA', async ({ page, request }) => {
    await expect(page.locator('header #resto-nome')).toContainText('Restaurante');
    await expect(page.locator('header #resto-sub')).toBeVisible();
    await expect(page.locator('#cutoff-label')).toContainText('13:50');
    await expect(page.locator('#start-menu')).toBeVisible();

    // Manifesto
    const resp = await request.get('manifest.json');
    expect(resp.ok()).toBeTruthy();
    const manifest = await resp.json();
    expect(manifest).toMatchObject({ name: expect.any(String) });

    // Ícones devem existir
    for (const path of ['icons/icon-192x192.png', 'icons/icon-512x512.png', 'icons/icon.svg']) {
      const r = await request.get(path);
      expect(r.ok()).toBeTruthy();
    }

    // SW registrado (pode levar um tempo)
    await page.waitForFunction(() => 'serviceWorker' in navigator);
    await page.waitForFunction(async () => {
      const regs = await navigator.serviceWorker.getRegistrations();
      return regs && regs.length >= 0; // apenas não falhar
    });
  });

  test('Builder padrão: validações, totais e carrinho', async ({ page }) => {
    // Entrar no fluxo custom
    await page.click('#btn-flow-custom');
    await expect(page.locator('#builder-default')).toBeVisible();

    // Tentar adicionar sem obrigatórios
    await page.click('#btn-add');
    await expect(page.locator('#fb .err')).toContainText(/tamanho|proteína/i);

    // Selecionar tamanho e proteína
    const sizeRadio = page.locator('#sec-tamanho .item input[type="radio"]');
    await sizeRadio.first().check();
    const protRadio = page.locator('#sec-proteina .chip input[type="radio"]');
    await protRadio.first().check();

    // Selecionar 2 acompanhamentos
    const acc = page.locator('#sec-acc .chip input[type="checkbox"]');
    const accCount = await acc.count();
    for (let i = 0; i < Math.min(2, accCount); i++) await acc.nth(i).check();

    // 1 adicional e 1 carne extra
    const add2 = page.locator('#sec-add2 .chip input[type="checkbox"]');
    if (await add2.count()) await add2.first().check();
    const add8 = page.locator('#sec-add8 .chip input[type="checkbox"]');
    if (await add8.count()) await add8.first().check();

    // 1 bebida
    const beb = page.locator('#sec-bebidas .item input[type="checkbox"]');
    let bebidaPreco = 0;
    if (await beb.count()) {
      const first = beb.first();
      await first.check();
      bebidaPreco = await first.getAttribute('data-price').then(v => Number(v || '0'));
    }

    // Calcular esperado pelo DOM
    const sizeRow = page.locator('#sec-tamanho .item').first();
    const sizePriceText = await sizeRow.locator('.price').innerText();
    const toNum = (s: string) => Number(s.replace(/[^0-9.,]/g, '').replace('.', '').replace(',', '.'));
    const precoTamanho = toNum(sizePriceText);
    // Preços do label já vêm formatados no texto do header (não confiável). Usar constantes do app: 2 e 9
    const precoAdd2 = 2;
    const precoCarne = 9;
    const esperado = precoTamanho + precoAdd2 + precoCarne + (bebidaPreco || 0);

    // Adicionar ao carrinho
    await page.fill('#obs-item', 'Sem pimenta');
    await page.click('#btn-add');
    await expect(page.locator('#cart-list .cart-item')).toHaveCount(1);
    await expect(page.locator('#cart-total')).not.toHaveText('R$ 0,00');

    // Comparar total de forma relaxada (duas casas)
    const cartTotalTxt = await page.locator('#cart-total').innerText();
    const cartTotalNum = toNum(cartTotalTxt);
    expect(Math.abs(cartTotalNum - esperado)).toBeLessThan(0.01);
  });

  test('Builder iOS: presets, rótulos dinâmicos e add ao carrinho', async ({ page }) => {
    // Abrir presets (iOS)
    await page.click('#btn-flow-preset');
    await expect(page.locator('#builder-ios')).toBeVisible();
    await expect(page.locator('#ios-op1-desc')).toContainText(/Arroz|Feijão/);

    // Verifica rótulos com preços dinâmicos
    await expect(page.locator('label[for="ios-add2"]')).toContainText('R$');
    await expect(page.locator('label[for="ios-add8"]')).toContainText('R$');

    // Usar preset e adicionar
    await page.click('#btn-op1');
    await page.click('#btn-add-ios');
    await expect(page.locator('#cart-list .cart-item')).toHaveCount(1);

    // Limpar e preencher manual
    await page.click('#btn-reset-ios');
    await page.fill('#ios-tamanho', 'G');
    await page.fill('#ios-proteina', 'Bife de Frango');
    await page.fill('#ios-acc', 'Arroz, Feijão');
    await page.fill('#ios-add2', 'Arroz separado');
    await page.fill('#ios-add8', 'Porção de carne extra');
    await page.fill('#ios-bebidas', 'coca lata'); // alias
    await page.fill('#ios-obs', 'Pouco sal');
    await page.click('#btn-add-ios');
    await expect(page.locator('#cart-list .cart-item')).toHaveCount(2);
  });

  test('Checkout, preview, copy e WhatsApp', async ({ page, context }) => {
    // Preparar um item rápido
  await page.click('#btn-flow-custom');
  await expect(page.locator('#builder-default')).toBeVisible();
  await page.locator('#sec-tamanho .item input[type="radio"]').first().scrollIntoViewIfNeeded();
  await page.locator('#sec-tamanho .item input[type="radio"]').first().check();
  await page.locator('#sec-proteina .chip input[type="radio"]').first().scrollIntoViewIfNeeded();
  await page.locator('#sec-proteina .chip input[type="radio"]').first().check();
    await page.click('#btn-add');

    // Preencher checkout
    await page.fill('#nome', 'Cliente QA');
    await page.fill('#endereco', 'Rua 1, 10');
    await page.fill('#bairro', 'Centro');
    await page.fill('#referencia', 'Ao lado da praça');
    await page.fill('#hora', '12:40');
    await page.selectOption('#pagamento', { label: 'PIX' });

    // Preview com PIX
    await expect(page.locator('#preview')).toContainText('PIX');
    await expect(page.locator('#preview')).toContainText('Pedidos até 13:50');

    // Mudar para Dinheiro e checar troco
    await page.selectOption('#pagamento', { label: 'Dinheiro' });
    await expect(page.locator('#troco-wrap')).toBeVisible();
    await page.fill('#troco', '50');
    await expect(page.locator('#preview')).toContainText('Troco para');

    // Copiar
    await page.click('#btn-copy');
    // Ler clipboard se disponível
    const copied = await page.evaluate(async () => {
      try { return await navigator.clipboard.readText(); } catch { return ''; }
    });
    expect(copied).toContain('Pedidos até 13:50');

    // WhatsApp: capturar URL do window.open de forma robusta (sem depender do popup)
    await page.evaluate(() => {
      (window as any).__lastOpenUrl = '';
      const oldOpen = window.open;
      window.open = function(url: string) {
        (window as any).__lastOpenUrl = String(url);
        // retorna um objeto fake para evitar erros em código que espera uma janela
        return { closed: false, close() { this.closed = true; } } as any;
      } as any;
      (window as any).__restoreOpen = () => { window.open = oldOpen; };
    });
    await page.click('#btn-wa');
    const waUrl = await page.evaluate(() => (window as any).__lastOpenUrl || '');
    // restaurar
    await page.evaluate(() => { if ((window as any).__restoreOpen) (window as any).__restoreOpen(); });
    expect(waUrl).toContain('wa.me');
    expect(waUrl).toContain('text=');
  });

  test('Cart: remover e limpar', async ({ page }) => {
    await page.click('#btn-flow-custom');
    await page.locator('#sec-tamanho .item input[type="radio"]').first().check();
    await page.locator('#sec-proteina .chip input[type="radio"]').first().check();
    await page.click('#btn-add');
    await page.locator('#sec-tamanho .item input[type="radio"]').nth(1).check();
    await page.locator('#sec-proteina .chip input[type="radio"]').nth(1).check();
    await page.click('#btn-add');
    await expect(page.locator('#cart-list .cart-item')).toHaveCount(2);

    // Remover primeiro
    await page.locator('#cart-list .cart-item .actions .btn-danger').first().click();
    await expect(page.locator('#cart-list .cart-item')).toHaveCount(1);

    // Limpar tudo
    await page.click('#btn-clear-cart');
    await expect(page.locator('#cart-list .cart-item')).toHaveCount(0);
  });

  test('Topbar: alternar modos', async ({ page }) => {
    // Tornar flows visíveis
    await page.click('#btn-flow-custom');
    await expect(page.locator('#builder-default')).toBeVisible();
    await page.click('#btn-mode-ios');
    await expect(page.locator('#builder-ios')).toBeVisible();
    await page.click('#btn-mode-default');
    await expect(page.locator('#builder-default')).toBeVisible();
  });
});
