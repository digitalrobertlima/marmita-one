// Configurações e dados compartilhados
const CONFIG = {
  identidade: { nome:"Restaurante da Célia", sub:"Seu prato, seu jeito. Monte agora!", cutoff:"14:30" },
  regras: { limiteAcompanhamentos: null, obrigatorios:["tamanho","proteina"], precoAdicional:2, precoCarneExtra:8 },
  tamanhos: [
    { id:"S", nome:"Pequena • 500 ml", valor:18.00, aliases:["p","pequena","500","pequeno"] },
    { id:"L", nome:"Grande • 750 mL",  valor:20.00, aliases:["g","grande","750","750ml","750 ml","1l","1000","1 l"] }
  ],
  proteinas: [
    { nome:"Lombo assado ao molho madeira", aliases:["lombo","madeira"] },
    { nome:"Carne cozida", aliases:["carne cozida","cozida"] },
    { nome:"Strogonoff de frango", aliases:["strogonoff","strogo","frango"] }
  ],
  acompanhamentos: [
    "Arroz","Feijão","Farofa","Maionese","Macarrão alho e óleo","Batata palha",
    "Salada verde","Vinagrete","Brócolis","Cenoura (cozida/ralada)","Beterraba cozida","Alface","Tomate","Vagem","Chuchu"
  ],
  adicionais2: [
    "Arroz separado","Feijão separado","Batata palha separada","Maionese separada","Macarrão separado","Salada extra","Embalagem separada","Molho extra"
  ],
  carnesExtras8: [
    "Porção extra de lombo (molho madeira)","Porção extra de carne cozida","Porção extra de strogonoff de frango"
  ],
  bebidas: [
    { nome:"Coca-Cola Lata 350ml", valor:6.00, aliases:["coca lata","coca 350","coca 350ml","coca"] },
    { nome:"Coca-Cola Zero Lata 350ml", valor:6.00, aliases:["coca zero lata","coca zero 350"] },
    { nome:"Coca-Cola 600ml", valor:8.00, aliases:["coca 600","coca 600ml"] },
    { nome:"Coca-Cola 1L", valor:10.00, aliases:["coca 1l","coca 1 l"] },
    { nome:"Coca-Cola 2L", valor:14.00, aliases:["coca 2l","coca 2 l","pet 2l"] },
    { nome:"Coca-Cola Zero 2L", valor:14.00, aliases:["coca zero 2l"] },
    { nome:"Coca-Cola Mini 200ml", valor:4.00, aliases:["mini coca","coca 200"] },
    { nome:"Fanta Laranja Lata 350ml", valor:5.50, aliases:["fanta laranja","fanta lata"] },
    { nome:"Fanta Uva Lata 350ml", valor:5.50, aliases:["fanta uva"] },
    { nome:"Sprite Lata 350ml", valor:5.50, aliases:["sprite lata","sprite"] },
    { nome:"Schweppes Lata 350ml", valor:6.00, aliases:["schweppes"] }
  ],
  presetsIOS: {
    opcao1: {
      label:"Opção 1",
      tamanho:"G",
      proteina:"Lombo assado ao molho madeira",
      acc:"Arroz, Feijão, Farofa, Maionese, Salada verde",
      add2:"",
      add8:"",
      bebidas:"Coca-Cola Lata 350ml",
      obs:""
    },
    opcao2: {
      label:"Opção 2",
      tamanho:"G",
      proteina:"Strogonoff de frango",
      acc:"Arroz, Batata palha, Salada verde",
      add2:"",
      add8:"",
      bebidas:"",
      obs:""
    }
  },
  msg: {
    titulo: "🍱 *Pedido de Marmitas*",
    agradecimento: "Obrigada! 🙌",
    notaPIX: "Produção inicia após envio do comprovante PIX.",
    taxaAviso: "Taxa de entrega será calculada no WhatsApp conforme a região."
  }
};

// Constantes e utilitários
const NL="\n", BULLET="•";
const byId = id => document.getElementById(id);
const fmt = v => Number(v).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const norm = s => (s||"").toString().normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
const splitList = s => norm(s).split(/[,;/]+/).map(x=>x.trim()).filter(Boolean);

// Storage
const STORAGE_CART_KEY = "marmitaone_cart_v1";
let CART = [];

// Funções de renderização
function renderTamanhos(){
  const box = byId("sec-tamanho"); 
  if (!box) return;
  box.innerHTML = "";
  CONFIG.tamanhos.forEach(t=>{
    const id = `tam-${t.id}`;
    const row = document.createElement("div"); row.className="item";
    const lab = document.createElement("label"); lab.htmlFor=id; lab.textContent=t.nome;
    const price = document.createElement("span"); price.className="price"; price.textContent = fmt(t.valor);
    const input = document.createElement("input"); input.type="radio"; input.name="tamanho"; input.id=id; input.value=t.nome; input.dataset.price=t.valor;
    row.append(lab,price,input); box.append(row);
  });
}

function renderProteinas(){
  const box = byId("sec-proteina");
  if (!box) return;
  box.innerHTML = "";
  CONFIG.proteinas.forEach(p=>{
    const lbl = document.createElement("label"); lbl.className="chip";
    const inp = document.createElement("input"); inp.type="radio"; inp.name="proteina"; inp.value=p.nome;
    lbl.append(inp, document.createTextNode(p.nome)); box.append(lbl);
  });
}

function renderAcompanhamentos(){
  const box = byId("sec-acc");
  if (!box) return;
  box.innerHTML = "";
  CONFIG.acompanhamentos.forEach(n=>{
    const lbl=document.createElement("label"); lbl.className="chip";
    const inp=document.createElement("input"); inp.type="checkbox"; inp.value=n;
    lbl.append(inp, document.createTextNode(n)); box.append(lbl);
  });
  const hint = byId("acc-hint");
  if (hint) {
    hint.textContent = CONFIG.regras.limiteAcompanhamentos ? `(até ${CONFIG.regras.limiteAcompanhamentos})` : `(sem limite)`;
  }
}

function renderAdicionais(){
  const b2 = byId("sec-add2");
  if (b2) {
    b2.innerHTML = "";
    CONFIG.adicionais2.forEach(n=>{
      const lbl=document.createElement("label"); lbl.className="chip";
      const inp=document.createElement("input"); inp.type="checkbox"; inp.value=n; inp.dataset.extra=CONFIG.regras.precoAdicional;
      lbl.append(inp, document.createTextNode(`${n} (+${fmt(CONFIG.regras.precoAdicional)})`)); b2.append(lbl);
    });
  }
  
  const b8 = byId("sec-add8");
  if (b8) {
    b8.innerHTML = "";
    CONFIG.carnesExtras8.forEach(n=>{
      const lbl=document.createElement("label"); lbl.className="chip";
      const inp=document.createElement("input"); inp.type="checkbox"; inp.value=n; inp.dataset.extra=CONFIG.regras.precoCarneExtra;
      lbl.append(inp, document.createTextNode(`${n} (+${fmt(CONFIG.regras.precoCarneExtra)})`)); b8.append(lbl);
    });
  }
}

function renderBebidas(){
  const box = byId("sec-bebidas");
  if (!box) return;
  box.innerHTML = "";
  CONFIG.bebidas.forEach((b,idx)=>{
    const id = `beb-${idx}`;
    const row = document.createElement("div"); row.className="item";
    const lab = document.createElement("label"); lab.htmlFor=id; lab.textContent=b.nome;
    const price = document.createElement("span"); price.className="price"; price.textContent = fmt(b.valor);
    const input = document.createElement("input"); input.type="checkbox"; input.id=id; input.value=b.nome; input.dataset.price=b.valor;
    row.append(lab,price,input); box.append(row);
  });
}

// Funções de dados
function getChecked(sel){ return Array.from(document.querySelectorAll(`${sel}:checked`)) }
function getRadio(name){ return document.querySelector(`input[name="${name}"]:checked`) }

function getItemAtual(){
  const tam = getRadio("tamanho");
  const prot = getRadio("proteina");
  const acc = getChecked('#sec-acc input[type="checkbox"]').map(el=>el.value);
  const add2 = getChecked('#sec-add2 input[type="checkbox"]').map(el=>el.value);
  const add8 = getChecked('#sec-add8 input[type="checkbox"]').map(el=>el.value);
  const beb  = getChecked('#sec-bebidas input[type="checkbox"]').map(el=>({nome:el.value, preco:Number(el.dataset.price||0)}));
  const obs  = byId("obs-item")?.value.trim() || "";

  const precoTamanho = tam ? Number(tam.dataset.price||0) : 0;
  const totalAdd2 = add2.length * CONFIG.regras.precoAdicional;
  const totalAdd8 = add8.length * CONFIG.regras.precoCarneExtra;
  const totalBebidas = beb.reduce((s,b)=>s + (b.preco||0), 0);

  const total = precoTamanho + totalAdd2 + totalAdd8 + totalBebidas;

  return { 
    tamanho: tam?tam.value:"", 
    proteina: prot?prot.value:"", 
    acompanhamentos:acc, 
    adicionais2:add2, 
    carnes8:add8, 
    bebidas:beb, 
    obs,
    totais:{precoTamanho, totalAdd2, totalAdd8, totalBebidas, total}
  };
}

function validarItem(item){
  const req = CONFIG.regras.obrigatorios;
  const msgs = [];
  if(req.includes("tamanho") && !item.tamanho) msgs.push("Informe o tamanho (P ou G).");
  if(req.includes("proteina") && !item.proteina) msgs.push("Informe a proteína.");
  if(CONFIG.regras.limiteAcompanhamentos){
    const L = CONFIG.regras.limiteAcompanhamentos;
    if(item.acompanhamentos.length > L) msgs.push(`Máximo de ${L} acompanhamentos.`);
  }
  return { ok: msgs.length===0, msgs };
}

function miniItem(it){
  const parts = [];
  parts.push(`Tamanho: ${it.tamanho||"-"}`);
  parts.push(`Proteína: ${it.proteina||"-"}`);
  if(it.acompanhamentos?.length) parts.push(`Acc: ${it.acompanhamentos.join(', ')}`);
  if(it.adicionais2?.length) parts.push(`+R$2: ${it.adicionais2.join(', ')}`);
  if(it.carnes8?.length) parts.push(`+R$8: ${it.carnes8.join(', ')}`);
  if(it.bebidas?.length) parts.push(`Bebidas: ${it.bebidas.map(b=>b.nome).join(', ')}`);
  if(it.obs) parts.push(`Obs.: ${it.obs}`);
  return parts.join("\n");
}

// Carrinho
function saveCart(){ 
  try{ localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(CART)); }catch(e){} 
}

function loadCart(){ 
  try{ CART = JSON.parse(localStorage.getItem(STORAGE_CART_KEY)||"[]"); }catch(e){ CART=[] } 
}

function cartTotal(){ 
  return CART.reduce((s,x)=> s + Number(x.total||0), 0) 
}

function addItemToCart(){
  const item = getItemAtual();
  const v = validarItem(item);
  if(!v.ok){ 
    alert(v.msgs.join(" "));
    return; 
  }
  const id = Date.now() + Math.floor(Math.random()*1000);
  CART.push({ id, item, total:item.totais.total, mini: miniItem(item) });
  saveCart(); 
  renderCart(); 
  clearBuilder(); 
  alert("Marmita adicionada ao carrinho!");
}

function renderCart(){
  const list = byId("cart-list");
  if (!list) return;
  
  list.innerHTML="";
  CART.forEach(entry=>{
    const el = document.createElement("div"); el.className="cart-item";
    const h3 = document.createElement("h3"); h3.textContent = `Marmita #${entry.id}`;
    const mini = document.createElement("div"); mini.className="cart-mini"; mini.textContent = entry.mini;
    const total = document.createElement("div"); total.style.marginTop="6px"; total.innerHTML = `<strong>${fmt(entry.total)}</strong>`;
    const rowBtn = document.createElement("div"); rowBtn.className="actions";
    const btnRem = document.createElement("button"); btnRem.className="btn btn-danger"; btnRem.textContent="Remover";
    btnRem.addEventListener("click", ()=>{ 
      CART = CART.filter(x=>x.id!==entry.id); 
      saveCart(); 
      renderCart();
    });
    rowBtn.append(btnRem);
    el.append(h3, mini, total, rowBtn); 
    list.append(el);
  });
  
  const totalEl = byId("cart-total");
  if (totalEl) {
    totalEl.textContent = fmt(cartTotal());
  }
}

function clearBuilder(){
  document.querySelectorAll('input[type="radio"],input[type="checkbox"]').forEach(i=>i.checked=false);
  const obs = byId("obs-item");
  if (obs) obs.value="";
}

function clearCart(){
  CART=[]; 
  saveCart(); 
  renderCart();
  alert("Carrinho esvaziado!");
}
