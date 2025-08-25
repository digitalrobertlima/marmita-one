import { APP_CONFIG } from './config.js';
import { formatCurrency as fmt, normalizeString as norm } from './utils.js';

// Estado
const STORAGE_MODE_KEY = 'marmitaone_mode_031';
const STORAGE_CART_KEY = 'marmitaone_cart_031';
let MODE = localStorage.getItem(STORAGE_MODE_KEY) || 'default';
let CART = [];

// SW
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  });
}

// Auto-reload a cada 2 min preservando estado
function autoReloadApp() {
  setInterval(() => {
    try {
      localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(CART));
      localStorage.setItem(STORAGE_MODE_KEY, MODE);
    } catch {}
    location.reload();
  }, 120000);
}

// Forçar atualização logo após abrir/voltar ao app
function freshnessOnOpen() {
  const stampKey = 'marmitaone_last_open';
  const now = Date.now();
  const last = Number(localStorage.getItem(stampKey) || 0);
  localStorage.setItem(stampKey, String(now));
  // If app opened after >30s from last time or the page just became visible, trigger a quick refresh
  const trigger = () => {
    try {
      localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(CART));
      localStorage.setItem(STORAGE_MODE_KEY, MODE);
    } catch {}
    // Use no-store to bypass HTTP cache
    window.location.replace(window.location.href.split('#')[0] + (window.location.search ? '' : ''));
  };
  if (!document.hidden && (now - last > 30_000)) {
    setTimeout(trigger, 500);
  }
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      setTimeout(trigger, 300);
    }
  });
}

// Helpers DOM
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// Render de blocos
function renderHeader() {
  return `
    <header>
      <div class="brand-mark" aria-hidden="true"><span class="logo-square" role="img" aria-label="Logo"></span></div>
      <h1 id="resto-nome">${APP_CONFIG.nome}</h1>
      <p id="resto-sub">${APP_CONFIG.sub}</p>
      <div class="pill">⏰ Pedidos até <strong id="cutoff-label">${APP_CONFIG.cutoff}</strong></div>
    </header>`;
}

function renderStartMenu() {
  return `
    <section class="card" id="start-menu">
      <h2>Como deseja montar sua marmita?</h2>
      <div class="actions" style="margin-top:18px">
        <button class="btn btn-primary" id="btn-flow-custom">Quero montar minha marmita</button>
        <button class="btn btn-promo" id="btn-flow-preset">Escolher opções prontas</button>
      </div>
    </section>`;
}

function renderBuilderDefault() {
  return `
    <h2>Monte sua marmita 🍽️ (padrão)</h2>
    <section style="margin-bottom:10px">
      <h3 style="margin:0 0 8px">📦 Tamanho</h3>
      <fieldset class="list" id="sec-tamanho"></fieldset>
    </section>
    <section style="margin-bottom:10px">
      <h3 style="margin:0 0 8px">🥩 Proteína</h3>
      <div class="chips" id="sec-proteina"></div>
    </section>
    <section style="margin-bottom:10px">
      <h3 style="margin:0 0 8px">🥗 Acompanhamentos & Saladas <small id="acc-hint" class="hint"></small></h3>
      <div class="chips" id="sec-acc"></div>
    </section>
    <section class="row" style="margin-bottom:10px">
      <div>
        <h3 style="margin:0 0 8px">➕ Adicionais (${fmt(APP_CONFIG.regras.precoAdicional)})</h3>
        <div class="chips" id="sec-add2"></div>
      </div>
      <div>
        <h3 style="margin:0 0 8px">🍖 Carnes extras (${fmt(APP_CONFIG.regras.precoCarneExtra)})</h3>
        <div class="chips" id="sec-add8"></div>
      </div>
    </section>
    <section style="margin-bottom:10px">
      <h3 style="margin:0 0 8px">🥤 Bebidas</h3>
      <fieldset class="list" id="sec-bebidas"></fieldset>
    </section>
    <section style="margin-bottom:10px">
      <h3 style="margin:0 0 8px">📝 Observações do item</h3>
      <textarea id="obs-item" placeholder="Preferências para ESTA marmita"></textarea>
    </section>
    <div class="actions">
      <button class="btn btn-primary" id="btn-add">🛒 Adicionar ao carrinho</button>
      <button class="btn btn-ghost" id="btn-reset">🧹 Limpar seleção</button>
    </div>`;
}

function renderBuilderIOS() {
  return `
    <h2>🍎 iPhone — preenchimento rápido</h2>
    <p class="hint">Toque em uma opção pronta ou preencha manualmente. Campos em branco são opcionais.</p>
    <div class="row" id="ios-presets">
      <div class="card" style="border-style:dashed">
        <h3 style="margin:0 0 8px">⭐ Opção 1</h3>
        <div class="hint" id="ios-op1-desc"></div>
        <div class="actions"><button class="btn btn-primary" id="btn-op1">Usar Opção 1</button></div>
      </div>
      <div class="card" style="border-style:dashed">
        <h3 style="margin:0 0 8px">⭐ Opção 2</h3>
        <div class="hint" id="ios-op2-desc"></div>
        <div class="actions"><button class="btn btn-primary" id="btn-op2">Usar Opção 2</button></div>
      </div>
    </div>
    <p class="hint" style="margin-top:8px">Ou personalize digitando abaixo (separe por vírgulas):</p>
    <div class="row">
      <div>
        <label for="ios-tamanho">📦 Tamanho (P ou G)</label>
        <input id="ios-tamanho" type="text" inputmode="text" placeholder="P ou G">
      </div>
      <div>
        <label for="ios-proteina">🥩 Proteína</label>
        <input id="ios-proteina" type="text" inputmode="text" placeholder="Ex.: Lombo, Carne cozida, Strogonoff">
      </div>
    </div>
    <div class="row">
      <div>
        <label for="ios-acc">🥗 Acompanhamentos & Saladas</label>
        <input id="ios-acc" type="text" inputmode="text" placeholder="Ex.: Arroz, Feijão, Salada verde">
      </div>
      <div>
        <label for="ios-add2">➕ Adicionais (+R$2 cada)</label>
        <input id="ios-add2" type="text" inputmode="text" placeholder="Ex.: Arroz separado, Molho extra">
      </div>
    </div>
    <div class="row">
      <div>
        <label for="ios-add8">🍖 Carnes extras (+R$8 cada)</label>
        <input id="ios-add8" type="text" inputmode="text" placeholder="Ex.: Porção extra de strogonoff">
      </div>
      <div>
        <label for="ios-bebidas">🥤 Bebidas</label>
        <input id="ios-bebidas" type="text" inputmode="text" placeholder="Ex.: Coca 2L, Sprite lata">
      </div>
    </div>
    <div>
      <label for="ios-obs">📝 Observações do item</label>
      <input id="ios-obs" type="text" inputmode="text" placeholder="Ex.: Pouco sal, sem pimenta">
    </div>
    <div class="actions">
      <button class="btn btn-primary" id="btn-add-ios">🛒 Adicionar ao carrinho</button>
      <button class="btn btn-ghost" id="btn-reset-ios">🧹 Limpar campos</button>
    </div>`;
}

function renderCartBox() {
  return `
    <h2>🧺 Seu carrinho</h2>
    <div class="cart-list" id="cart-list"></div>
    <div class="total">
      <strong>Total</strong>
      <div id="cart-total">${fmt(0)}</div>
    </div>
    <div class="actions">
      <button class="btn btn-danger" id="btn-clear-cart">🗑️ Esvaziar carrinho</button>
    </div>`;
}

function renderCheckout() {
  return `
    <h2>🧾 Checkout</h2>
    <div class="row">
      <div>
        <label for="nome">🙍 Nome</label>
        <input id="nome" type="text" placeholder="Seu nome" />
      </div>
      <div>
        <label for="endereco">📍 Endereço</label>
        <input id="endereco" type="text" placeholder="Rua, número, complemento" autocomplete="street-address" />
      </div>
    </div>
    <div class="row">
      <div>
        <label for="bairro">🏘️ Bairro</label>
        <input id="bairro" type="text" placeholder="Ex.: Centro" />
      </div>
      <div>
        <label for="referencia">📌 Ponto de referência</label>
        <input id="referencia" type="text" placeholder="Ex.: Próximo à padaria Y" />
      </div>
    </div>
    <div class="row">
      <div>
        <label for="hora">⏰ Horário</label>
        <input id="hora" type="time" />
      </div>
      <div>
        <label for="pagamento">💳 Pagamento</label>
        <select id="pagamento">
          <option value="">Selecione…</option>
          <option>PIX</option>
          <option>Crédito</option>
          <option>Débito</option>
          <option>Dinheiro</option>
        </select>
      </div>
    </div>
    <div id="troco-wrap" style="display:none">
      <label for="troco">Troco para quanto?</label>
      <input id="troco" type="number" inputmode="decimal" step="0.01" placeholder="Ex.: 50,00" />
    </div>
    <section class="notice">
      <strong>Aviso:</strong> A taxa de entrega será combinada no WhatsApp, conforme a região.
    </section>
    <section style="margin-top:10px">
      <label>Pré-visualização</label>
      <pre class="preview" id="preview"></pre>
    </section>
    <div id="fb" class="hint"></div>
    <div class="actions">
      <button class="btn" id="btn-copy">📋 Copiar mensagem</button>
      <button class="btn btn-primary" id="btn-wa">💬 Enviar no WhatsApp</button>
    </div>`;
}

function renderMainFlows() {
  return `
    <div id="main-flows" class="hide">
      <div class="grid">
        <section class="card" id="builder-default">${renderBuilderDefault()}</section>
        <section class="card hide" id="builder-ios">${renderBuilderIOS()}</section>
        <aside class="card cart" id="cart">${renderCartBox()}</aside>
      </div>
      <section class="card" id="checkout" style="margin-top:12px">${renderCheckout()}</section>
      <footer>
        <div class="brand-mark" aria-hidden="true" style="justify-content:center; margin-bottom:6px"><span class="logo-square" role="img" aria-label="Logo"></span></div>
        <small id="wa-number" data-phone="${APP_CONFIG.whatsapp}">MARMITA.ONE • v0.0.2 • uso local/offline</small>
      </footer>
      <div class="topbar">
        <div class="topbar-inner">
          <div class="brand-mark"><span class="logo-square" role="img" aria-label="Logo"></span><div class="hint">Compatibilidade iOS/Android</div></div>
          <div class="actions">
            <button id="btn-mode-ios" class="btn btn-promo">🍎 Estou usando iPhone</button>
            <button id="btn-mode-default" class="btn">🤖 Modo padrão (Android/PC)</button>
          </div>
        </div>
      </div>
    </div>`;
}

function renderApp() {
  const root = document.getElementById('app-root');
  root.innerHTML = renderHeader() + renderStartMenu() + renderMainFlows();
}

// Preenchimento dinâmico das listas
function mountOptions() {
  // tamanhos
  const tamBox = $('#sec-tamanho');
  tamBox.innerHTML = '';
  APP_CONFIG.tamanhos.forEach((t) => {
    const id = `tam-${t.id}`;
    const row = document.createElement('div');
    row.className = 'item';
    row.innerHTML = `<label for="${id}">${t.nome}</label><span class="price">${fmt(t.valor)}</span>`;
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'tamanho';
    input.id = id;
    input.value = t.nome;
    input.dataset.price = String(t.valor);
    row.appendChild(input);
    tamBox.appendChild(row);
  });

  // proteinas
  const protBox = $('#sec-proteina');
  protBox.innerHTML = '';
  APP_CONFIG.proteinas.forEach((p) => {
    const lbl = document.createElement('label');
    lbl.className = 'chip';
    lbl.innerHTML = `<input type="radio" name="proteina" value="${p.nome}"> ${p.nome}`;
    protBox.appendChild(lbl);
  });

  // acompanhamentos
  const accBox = $('#sec-acc');
  accBox.innerHTML = '';
  APP_CONFIG.acompanhamentos.forEach((n) => {
    const lbl = document.createElement('label');
    lbl.className = 'chip';
    lbl.innerHTML = `<input type="checkbox" value="${n}"> ${n}`;
    accBox.appendChild(lbl);
  });
  const hint = $('#acc-hint');
  hint.textContent = APP_CONFIG.regras.limiteAcompanhamentos
    ? `(até ${APP_CONFIG.regras.limiteAcompanhamentos})`
    : `(sem limite)`;

  // adicionais 2
  const add2Box = $('#sec-add2');
  add2Box.innerHTML = '';
  APP_CONFIG.adicionais2.forEach((n) => {
    const lbl = document.createElement('label');
    lbl.className = 'chip';
    lbl.innerHTML = `<input type="checkbox" value="${n}" data-extra="${APP_CONFIG.regras.precoAdicional}"> ${n} (+${fmt(APP_CONFIG.regras.precoAdicional)})`;
    add2Box.appendChild(lbl);
  });

  // carnes extras 8
  const add8Box = $('#sec-add8');
  add8Box.innerHTML = '';
  APP_CONFIG.carnesExtras8.forEach((n) => {
    const lbl = document.createElement('label');
    lbl.className = 'chip';
    lbl.innerHTML = `<input type="checkbox" value="${n}" data-extra="${APP_CONFIG.regras.precoCarneExtra}"> ${n} (+${fmt(APP_CONFIG.regras.precoCarneExtra)})`;
    add8Box.appendChild(lbl);
  });

  // bebidas
  const bebBox = $('#sec-bebidas');
  bebBox.innerHTML = '';
  APP_CONFIG.bebidas.forEach((b, idx) => {
    const id = `beb-${idx}`;
    const row = document.createElement('div');
    row.className = 'item';
    row.innerHTML = `<label for="${id}">${b.nome}</label><span class="price">${fmt(b.valor)}</span>`;
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = id;
    input.value = b.nome;
    input.dataset.price = String(b.valor);
    row.appendChild(input);
    bebBox.appendChild(row);
  });
}

function getChecked(sel) { return $$(sel+':checked'); }
function getRadio(name) { return document.querySelector(`input[name="${name}"]:checked`); }

function getItemAtualDefault() {
  const tam = getRadio('tamanho');
  const prot = getRadio('proteina');
  const acc = getChecked('#sec-acc input[type="checkbox"]').map((el) => el.value);
  const add2 = getChecked('#sec-add2 input[type="checkbox"]').map((el) => el.value);
  const add8 = getChecked('#sec-add8 input[type="checkbox"]').map((el) => el.value);
  const beb = getChecked('#sec-bebidas input[type="checkbox"]').map((el) => ({ nome: el.value, preco: Number(el.dataset.price || 0) }));
  const obs = $('#obs-item').value.trim();

  const precoTamanho = tam ? Number(tam.dataset.price || 0) : 0;
  const totalAdd2 = add2.length * APP_CONFIG.regras.precoAdicional;
  const totalAdd8 = add8.length * APP_CONFIG.regras.precoCarneExtra;
  const totalBebidas = beb.reduce((s, b) => s + (b.preco || 0), 0);
  const total = precoTamanho + totalAdd2 + totalAdd8 + totalBebidas;

  return { tamanho: tam ? tam.value : '', proteina: prot ? prot.value : '', acompanhamentos: acc, adicionais2: add2, carnes8: add8, bebidas: beb, obs, totais: { precoTamanho, totalAdd2, totalAdd8, totalBebidas, total } };
}

function splitList(s) { return norm(s).split(/[,;/]+/).map((x) => x.trim()).filter(Boolean); }

function matchFromListTerm(list, term) {
  const t = norm(term);
  const obj = list.find((x) => norm(x.nome || x) === t || (x.aliases || []).some((a) => norm(a) === t));
  return obj || null;
}

function getItemAtualIOS() {
  const tTam = $('#ios-tamanho').value.trim();
  const tProt = $('#ios-proteina').value.trim();
  const tAcc = $('#ios-acc').value.trim();
  const tAdd2 = $('#ios-add2').value.trim();
  const tAdd8 = $('#ios-add8').value.trim();
  const tBeb = $('#ios-bebidas').value.trim();
  const obs = $('#ios-obs').value.trim();

  const mTam = matchFromListTerm(APP_CONFIG.tamanhos.map((t) => ({ nome: t.nome, id: t.id })), tTam);
  const mProt = matchFromListTerm(APP_CONFIG.proteinas, tProt);
  const tamanhoNome = mTam ? (mTam.nome || mTam) : tTam;
  const proteinaNome = mProt ? (mProt.nome || mProt) : tProt;
  const precoTamanho = (() => {
    const t = APP_CONFIG.tamanhos.find((x) => x.nome === tamanhoNome || x.id === norm(tamanhoNome));
    return t ? Number(t.valor) : 0;
  })();

  const acc = splitList(tAcc).map((term) => {
    const m = matchFromListTerm(APP_CONFIG.acompanhamentos.map((n) => ({ nome: n })), term);
    return m ? (m.nome || m) : term;
  });
  const add2 = splitList(tAdd2).map((term) => {
    const m = matchFromListTerm(APP_CONFIG.adicionais2.map((n) => ({ nome: n })), term);
    return m ? (m.nome || m) : term;
  });
  const add8 = splitList(tAdd8).map((term) => {
    const m = matchFromListTerm(APP_CONFIG.carnesExtras8.map((n) => ({ nome: n })), term);
    return m ? (m.nome || m) : term;
  });
  const bebidas = splitList(tBeb).map((term) => {
    const m = matchFromListTerm(APP_CONFIG.bebidas, term);
    if (m && m.nome) return { nome: m.nome, preco: Number(m.valor || 0) };
    return { nome: term, preco: 0 };
  });

  const totalAdd2 = add2.length * APP_CONFIG.regras.precoAdicional;
  const totalAdd8 = add8.length * APP_CONFIG.regras.precoCarneExtra;
  const totalBebidas = bebidas.reduce((s, b) => s + (b.preco || 0), 0);
  const total = precoTamanho + totalAdd2 + totalAdd8 + totalBebidas;

  return { tamanho: tamanhoNome, proteina: proteinaNome, acompanhamentos: acc, adicionais2: add2, carnes8: add8, bebidas, obs, totais: { precoTamanho, totalAdd2, totalAdd8, totalBebidas, total } };
}

function validarItem(item) {
  const req = APP_CONFIG.regras.obrigatorios;
  const msgs = [];
  if (req.includes('tamanho') && !item.tamanho) msgs.push('Informe o tamanho (P ou G).');
  if (req.includes('proteina') && !item.proteina) msgs.push('Informe a proteína.');
  if (APP_CONFIG.regras.limiteAcompanhamentos) {
    const L = APP_CONFIG.regras.limiteAcompanhamentos;
    if (item.acompanhamentos.length > L) msgs.push(`Máximo de ${L} acompanhamentos.`);
  }
  return { ok: msgs.length === 0, msgs };
}

function miniItem(it) {
  const parts = [];
  parts.push(`Tamanho: ${it.tamanho || '-'}`);
  parts.push(`Proteína: ${it.proteina || '-'}`);
  if (it.acompanhamentos?.length) parts.push(`Acc: ${it.acompanhamentos.join(', ')}`);
  if (it.adicionais2?.length) parts.push(`+R$2: ${it.adicionais2.join(', ')}`);
  if (it.carnes8?.length) parts.push(`+R$8: ${it.carnes8.join(', ')}`);
  if (it.bebidas?.length) parts.push(`Bebidas: ${it.bebidas.map((b) => b.nome).join(', ')}`);
  if (it.obs) parts.push(`Obs.: ${it.obs}`);
  return parts.join('\n');
}

function saveCart() { try { localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(CART)); } catch {}
}
function loadCart() { try { CART = JSON.parse(localStorage.getItem(STORAGE_CART_KEY) || '[]'); } catch { CART = []; } }
function cartTotal() { return CART.reduce((s, x) => s + Number(x.total || 0), 0); }

function renderCart() {
  const list = $('#cart-list');
  list.innerHTML = '';
  CART.forEach((entry) => {
    const el = document.createElement('div');
    el.className = 'cart-item';
    const h3 = document.createElement('h3');
    h3.textContent = `Marmita #${entry.id}`;
    const mini = document.createElement('div');
    mini.className = 'cart-mini';
    mini.textContent = entry.mini;
    const total = document.createElement('div');
    total.style.marginTop = '6px';
    total.innerHTML = `<strong>${fmt(entry.total)}</strong>`;
    const rowBtn = document.createElement('div');
    rowBtn.className = 'actions';
    const btnRem = document.createElement('button');
    btnRem.className = 'btn btn-danger';
    btnRem.textContent = 'Remover';
    btnRem.addEventListener('click', () => {
      CART = CART.filter((x) => x.id !== entry.id);
      saveCart();
      renderCart();
      renderPreview();
    });
    rowBtn.append(btnRem);
    el.append(h3, mini, total, rowBtn);
    list.append(el);
  });
  $('#cart-total').textContent = fmt(cartTotal());
}

function clearBuilder() {
  $$('#builder-default input[type="radio"],#builder-default input[type="checkbox"]').forEach((i) => (i.checked = false));
  $('#obs-item').value = '';
  ['ios-tamanho', 'ios-proteina', 'ios-acc', 'ios-add2', 'ios-add8', 'ios-bebidas', 'ios-obs'].forEach((id) => ($('#' + id).value = ''));
}

function addItemToCart() {
  const item = MODE === 'ios' ? getItemAtualIOS() : getItemAtualDefault();
  const v = validarItem(item);
  if (!v.ok) { setFB(v.msgs.join(' '), 'err'); return; }
  const id = Date.now() + Math.floor(Math.random() * 1000);
  CART.push({ id, item, total: item.totais.total, mini: miniItem(item) });
  saveCart();
  renderCart();
  clearBuilder();
  renderPreview();
  setFB('Marmita adicionada ao carrinho.', 'ok');
}

function coletarCheckout() {
  const nome = $('#nome').value.trim();
  const endereco = $('#endereco').value.trim();
  const bairro = $('#bairro').value.trim();
  const referencia = $('#referencia').value.trim();
  const hora = $('#hora').value;
  const pagamento = $('#pagamento').value;
  const trocoPara = $('#troco').value;
  let troco = null;
  if (pagamento === 'Dinheiro' && trocoPara) {
    const x = Number(String(trocoPara).replace(',', '.'));
    if (!Number.isNaN(x)) troco = Math.max(0, x - cartTotal());
  }
  return { nome, endereco, bairro, referencia, hora, pagamento, trocoPara, troco };
}

function validarCheckout(d) {
  const msgs = [];
  if (!CART.length) msgs.push('Adicione pelo menos 1 item ao carrinho.');
  if (!d.endereco) msgs.push('Informe o endereço para entrega.');
  if (!d.pagamento) msgs.push('Escolha a forma de pagamento.');
  return { ok: msgs.length === 0, msgs };
}

function montarMensagem() {
  const d = coletarCheckout();
  const v = validarCheckout(d);
  if (!v.ok) { setFB(v.msgs.join(' '), 'err'); return ''; }

  const NL = '\n';
  const BULLET = '•';
  const linhas = [];
  linhas.push(APP_CONFIG.msg.titulo);
  linhas.push(`${BULLET} ${APP_CONFIG.nome}`);
  linhas.push('');

  CART.forEach((e, idx) => {
    const it = e.item;
    linhas.push(`Marmita #${idx + 1}`);
    if (it.tamanho) linhas.push(`${BULLET} Tamanho: ${it.tamanho}`);
    if (it.proteina) linhas.push(`${BULLET} Proteína: ${it.proteina}`);
    if (it.acompanhamentos?.length) linhas.push(`${BULLET} Acompanhamentos: ${it.acompanhamentos.join(', ')}`);
    if (it.adicionais2?.length) linhas.push(`${BULLET} Adicionais (+${fmt(APP_CONFIG.regras.precoAdicional)}): ${it.adicionais2.join(', ')}`);
    if (it.carnes8?.length) linhas.push(`${BULLET} Carnes extras (+${fmt(APP_CONFIG.regras.precoCarneExtra)}): ${it.carnes8.join(', ')}`);
    if (it.bebidas?.length) linhas.push(`${BULLET} Bebidas: ${it.bebidas.map((b) => `${b.nome}${b.preco ? ` (${fmt(b.preco)})` : ''}`).join(', ')}`);
    if (it.obs) linhas.push(`${BULLET} Obs.: ${it.obs}`);
    linhas.push(`Valor: ${fmt(e.totais?.total ?? e.total ?? 0)}`);
    linhas.push('');
  });

  linhas.push(`Total dos itens: *${fmt(cartTotal())}*`);
  linhas.push(APP_CONFIG.msg.taxaAviso);
  linhas.push('');

  linhas.push(`📍 *Entrega:*`);
  if (d.nome) linhas.push(`${BULLET} Nome: ${d.nome}`);
  const enderecoFull = [d.endereco, d.bairro ? `– ${d.bairro}` : '', d.referencia ? `(Ref.: ${d.referencia})` : '']
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (enderecoFull) linhas.push(`${BULLET} Endereço: ${enderecoFull}`);
  if (d.hora) linhas.push(`${BULLET} Horário: ${d.hora}`);
  if (d.pagamento) linhas.push(`${BULLET} Pagamento: ${d.pagamento}`);
  if (d.pagamento === 'PIX') linhas.push(`${BULLET} Observação: ${APP_CONFIG.msg.notaPIX}`);
  if (d.pagamento === 'Dinheiro' && d.troco !== null) {
    linhas.push(`${BULLET} Troco para: ${fmt(Number(d.trocoPara))}`);
    linhas.push(`${BULLET} Enviar troco: ${fmt(d.troco)}`);
  }

  linhas.push('');
  linhas.push(`Pedidos até ${APP_CONFIG.cutoff}`);
  linhas.push(APP_CONFIG.msg.agradecimento);

  return linhas.join(NL).replace(/\n{3,}/g, '\n\n').trim();
}

function renderPreview() { const el = $('#preview'); if (el) el.textContent = montarMensagem() || ''; }
function setFB(txt, t = '') { const el = $('#fb'); if (el) el.innerHTML = `<span class="${t}">${txt}</span>`; }

function abrirWhatsApp() {
  const msg = montarMensagem();
  if (!msg) return;
  const base = 'https://wa.me/';
  const phone = $('#wa-number').dataset.phone || '';
  const url = (phone ? base + phone + '?text=' : base + '?text=') + encodeURIComponent(msg);
  window.open(url, '_blank', 'noopener');
  setFB('Abrindo WhatsApp…', 'ok');
}

async function copiarMensagem() {
  const msg = montarMensagem();
  if (!msg) { setFB('Nada para copiar.', 'warn'); return; }
  try { await navigator.clipboard.writeText(msg); setFB('Mensagem copiada.', 'ok'); }
  catch {
    const ta = document.createElement('textarea');
    ta.value = msg;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    setFB('Mensagem copiada (compatibilidade).', 'ok');
  }
}

function setMode(mode) {
  MODE = mode;
  localStorage.setItem(STORAGE_MODE_KEY, MODE);
  $('#builder-default').classList.toggle('hide', MODE === 'ios');
  $('#builder-ios').classList.toggle('hide', MODE !== 'ios');
  setTimeout(() => { (MODE === 'ios' ? $('#builder-ios') : $('#builder-default')).scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50);
}

function onPagamento() {
  $('#troco-wrap').style.display = ($('#pagamento').value === 'Dinheiro') ? 'block' : 'none';
  renderPreview();
}

function applyPreset(which) {
  const p = APP_CONFIG.presetsIOS[which];
  if (!p) return;
  $('#ios-tamanho').value = p.tamanho || '';
  $('#ios-proteina').value = p.proteina || '';
  $('#ios-acc').value = p.acc || '';
  $('#ios-add2').value = p.add2 || '';
  $('#ios-add8').value = p.add8 || '';
  $('#ios-bebidas').value = p.bebidas || '';
  $('#ios-obs').value = p.obs || '';
  renderPreview();
}

function renderPresetDescriptions() {
  const p1 = APP_CONFIG.presetsIOS.opcao1, p2 = APP_CONFIG.presetsIOS.opcao2;
  if (p1) $('#ios-op1-desc').textContent = `${p1.tamanho || ''} · ${p1.proteina || ''} · ${p1.acc || ''}`.replace(/\s·\s$/, '');
  if (p2) $('#ios-op2-desc').textContent = `${p2.tamanho || ''} · ${p2.proteina || ''} · ${p2.acc || ''}`.replace(/\s·\s$/, '');
}

function wireEvents() {
  $('#btn-add').addEventListener('click', addItemToCart);
  $('#btn-reset').addEventListener('click', clearBuilder);
  $('#btn-add-ios').addEventListener('click', addItemToCart);
  $('#btn-reset-ios').addEventListener('click', clearBuilder);
  $('#btn-clear-cart').addEventListener('click', () => { CART = []; saveCart(); renderCart(); renderPreview(); });
  $('#btn-copy').addEventListener('click', copiarMensagem);
  $('#btn-wa').addEventListener('click', abrirWhatsApp);
  $('#pagamento').addEventListener('change', onPagamento);
  $('#btn-mode-ios').addEventListener('click', () => setMode('ios'));
  $('#btn-mode-default').addEventListener('click', () => setMode('default'));
  $('#btn-op1').addEventListener('click', () => applyPreset('opcao1'));
  $('#btn-op2').addEventListener('click', () => applyPreset('opcao2'));
  document.addEventListener('input', renderPreview);
  document.addEventListener('change', renderPreview);
}

function initStartFlow() {
  const startMenu = document.getElementById('start-menu');
  const mainFlows = document.getElementById('main-flows');
  const btnCustom = document.getElementById('btn-flow-custom');
  const btnPreset = document.getElementById('btn-flow-preset');
  const builderDefault = document.getElementById('builder-default');
  const builderIOS = document.getElementById('builder-ios');

  function showFlow(flow) {
    startMenu.classList.add('hide');
    mainFlows.classList.remove('hide');
    if (flow === 'custom') {
      builderDefault.classList.remove('hide');
      builderIOS.classList.add('hide');
      setMode('default');
    } else {
      builderDefault.classList.add('hide');
      builderIOS.classList.remove('hide');
      setMode('ios');
    }
    setTimeout(() => { mainFlows.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50);
  }
  btnCustom.addEventListener('click', () => showFlow('custom'));
  btnPreset.addEventListener('click', () => showFlow('preset'));
}

function boot() {
  renderApp();
  mountOptions();
  renderPresetDescriptions();
  loadCart();
  renderCart();
  wireEvents();
  initStartFlow();
  setMode(MODE);
  onPagamento();
  renderPreview();
  autoReloadApp();
  freshnessOnOpen();
  // Expor para debug/autoReload
  window.CART = CART;
  window.MODE = MODE;
}

document.addEventListener('DOMContentLoaded', boot);