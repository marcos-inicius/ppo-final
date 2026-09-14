const STORAGE_KEY = "ecorota101-occurrences";
const USER_KEY = "ecorota101-user";

const TYPE_META = {
  flood: { label: "Alagamento", icon: "⟱", color: "blue", accent: "#2d8cff" },
  waste: { label: "Descarte irregular", icon: "♻", color: "orange", accent: "#f2a65a" },
  power: { label: "Falha elétrica", icon: "ϟ", color: "yellow", accent: "#f5cf5f" },
};

const SEED_OCCURRENCES = [
  { id: "r-001", type: "flood", title: "Alagamento na avenida", description: "Água acumulada cobre meia faixa e dificulta a passagem de carros pequenos.", neighborhood: "Vila Madalena", status: "active", time: "há 8 min", lat: 42, left: 36, author: "Ana Costa", confirmations: 12 },
  { id: "r-002", type: "waste", title: "Ponto de descarte irregular", description: "Resíduos volumosos deixados ao lado do contêiner desde ontem.", neighborhood: "Pinheiros", status: "active", time: "há 23 min", lat: 58, left: 63, author: "Rafael Lima", confirmations: 8 },
  { id: "r-003", type: "power", title: "Poste sem iluminação", description: "Lâmpada apagada no trecho próximo à praça. Área fica escura após 19h.", neighborhood: "Sumaré", status: "pending", time: "há 41 min", lat: 27, left: 70, author: "Marina Alves", confirmations: 5 },
  { id: "r-004", type: "flood", title: "Bueiro transbordando", description: "Bueiro não comporta o volume de chuva na rua lateral.", neighborhood: "Perdizes", status: "active", time: "há 1 h", lat: 68, left: 24, author: "João Mendes", confirmations: 16 },
  { id: "r-005", type: "waste", title: "Entulho em calçada", description: "Restos de obra bloqueiam a passagem de pedestres.", neighborhood: "Lapa", status: "resolved", time: "há 2 h", lat: 74, left: 78, author: "Luiza Reis", confirmations: 21 },
  { id: "r-006", type: "power", title: "Fiação baixa", description: "Fios aparentes e baixos na esquina, atenção para caminhões.", neighborhood: "Alto da Lapa", status: "pending", time: "há 3 h", lat: 18, left: 22, author: "Caio Nunes", confirmations: 3 },
];

const initialUser = {
  name: "Marina Alves",
  initials: "MA",
  points: 248,
  reports: 18,
  notifications: true,
};

let state = {
  activeNav: "map",
  activeFilter: "all",
  occurrences: loadOccurrences(),
  user: loadUser(),
  modalOpen: false,
  selectedOccurrence: null,
  currentLocation: null,
};

function loadOccurrences() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) && saved.length ? saved : SEED_OCCURRENCES;
  } catch {
    return SEED_OCCURRENCES;
  }
}

function loadUser() {
  try { return { ...initialUser, ...(JSON.parse(localStorage.getItem(USER_KEY)) || {}) }; } catch { return initialUser; }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.occurrences));
  localStorage.setItem(USER_KEY, JSON.stringify(state.user));
}

function filteredOccurrences() {
  if (state.activeFilter === "all") return state.occurrences;
  return state.occurrences.filter(item => item.type === state.activeFilter);
}

function typeMeta(type) { return TYPE_META[type] || TYPE_META.flood; }

function icon(name, size = 18) {
  const paths = {
    pin: `<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>`,
    plus: `<path d="M12 5v14M5 12h14"/>`,
    layers: `<path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/>`,
    bell: `<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>`,
    user: `<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>`,
    settings: `<path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="m19.4 15 .1.1a2 2 0 0 1-2.8 2.8l-.1-.1a2 2 0 0 0-3.4 1.4v.3a2 2 0 0 1-4 0v-.2a2 2 0 0 0-3.4-1.5l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a2 2 0 0 0-1.5-3.4h-.2a2 2 0 0 1 0-4h.2a2 2 0 0 0 1.5-3.4l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A2 2 0 0 0 9.2 3v-.2a2 2 0 0 1 4 0V3a2 2 0 0 0 3.4 1.5l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a2 2 0 0 0 1.5 3.4h.2a2 2 0 0 1 0 4h-.2a2 2 0 0 0-1.5.3Z"/>`,
    search: `<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>`,
    locate: `<circle cx="12" cy="12" r="7"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>`,
    close: `<path d="m6 6 12 12M18 6 6 18"/>`,
    check: `<path d="m5 12 4 4L19 6"/>`,
    chevron: `<path d="m9 18 6-6-6-6"/>`,
    menu: `<path d="M4 6h16M4 12h16M4 18h16"/>`,
    logout: `<path d="M10 17l5-5-5-5M15 12H3M21 3v18"/>`,
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.pin}</svg>`;
}

function render() {
  document.getElementById("app").innerHTML = `
    <div class="app-shell">
      ${renderSidebar()}
      <main class="main-content">
        ${renderHeader()}
        ${state.activeNav === "map" ? renderMapView() : renderSecondaryView()}
      </main>
      ${renderDetailPanel()}
    </div>
    ${state.modalOpen ? renderModal() : ""}
  `;
  bindEvents();
}

function renderSidebar() {
  return `<aside class="sidebar" id="sidebar">
    <div class="brand"><span class="brand-mark">⌁</span><span>EcoRota <b>101</b></span></div>
    <div class="sidebar-section-label">Navegação</div>
    <nav class="nav-list">
      ${navItem("map", "Mapa ao vivo", "pin")}
      ${navItem("my-reports", "Minhas ocorrências", "layers", state.occurrences.filter(i => i.author === state.user.name).length)}
      ${navItem("ranking", "Ranking da comunidade", "check")}
    </nav>
    <div class="sidebar-divider"></div>
    <div class="sidebar-section-label">Conta</div>
    <nav class="nav-list">
      ${navItem("profile", "Meu perfil", "user")}
      ${navItem("settings", "Configurações", "settings")}
    </nav>
    <div class="sidebar-spacer"></div>
    <div class="sidebar-impact-card">
      <div class="impact-icon">✦</div>
      <strong>Seu impacto importa</strong>
      <p>Cada relato ajuda a construir uma cidade mais segura.</p>
      <div class="impact-progress"><span style="width: 68%"></span></div>
      <small>${state.user.points} pontos · nível Colaborador</small>
    </div>
    <div class="profile-mini">
      <div class="avatar">${state.user.initials}</div><div class="profile-mini-name"><strong>${state.user.name}</strong><span>Colaborador</span></div>
      <button class="icon-button muted" data-action="logout" aria-label="Sair">${icon("logout", 16)}</button>
    </div>
  </aside>`;
}

function navItem(id, label, iconName, count = null) {
  return `<button class="nav-item ${state.activeNav === id ? "active" : ""}" data-nav="${id}">${icon(iconName, 18)}<span>${label}</span>${count !== null ? `<em>${count}</em>` : ""}</button>`;
}

function renderHeader() {
  const titles = { map: ["Mapa ao vivo", "Acompanhe e contribua com sua cidade em tempo real."], "my-reports": ["Minhas ocorrências", "Revise os relatos que você compartilhou com a comunidade."], ranking: ["Ranking da comunidade", "Quem participa mais, transforma mais."], profile: ["Meu perfil", "Seu histórico de participação no EcoRota 101."], settings: ["Configurações", "Gerencie suas preferências e alertas."] };
  const [title, subtitle] = titles[state.activeNav] || titles.map;
  return `<header class="topbar">
    <button class="mobile-menu icon-button" data-action="toggle-sidebar" aria-label="Abrir menu">${icon("menu", 20)}</button>
    <div class="page-heading"><div class="eyebrow">TERÇA-FEIRA, 14 DE ABRIL DE 2026</div><h1>${title}</h1><p>${subtitle}</p></div>
    <div class="topbar-actions"><button class="icon-button notification-button ${state.user.notifications ? "has-notification" : ""}" data-action="toggle-notifications" aria-label="Notificações">${icon("bell", 19)}${state.user.notifications ? '<i></i>' : ''}</button><div class="topbar-avatar">${state.user.initials}</div></div>
  </header>`;
}

function renderMapView() {
  const reports = filteredOccurrences();
  return `<section class="dashboard-grid">
    <div class="map-column">
      ${renderStatRow()}
      <div class="map-card">
        <div class="map-toolbar"><div class="map-search">${icon("search", 17)}<input id="map-search" placeholder="Buscar endereço ou bairro" /><kbd>⌘ K</kbd></div><button class="map-layer-button" data-action="toggle-layers">${icon("layers", 17)} Camadas</button></div>
        <div class="map-canvas" id="map-canvas">
          <div class="map-label label-top">SUMARÉ</div><div class="map-label label-left">PERDIZES</div><div class="map-label label-mid">PINHEIROS</div><div class="map-label label-bottom">VILA MADALENA</div>
          <div class="road road-a"></div><div class="road road-b"></div><div class="road road-c"></div><div class="road road-d"></div><div class="road road-e"></div>
          <div class="map-park park-a"></div><div class="map-park park-b"></div>
          <div class="map-water"></div>
          ${reports.map(renderMarker).join("")}
          <div class="user-location" style="left:${state.currentLocation?.left || 49}%;top:${state.currentLocation?.top || 53}%"><span></span></div>
          <div class="map-zoom"><button data-action="zoom-in">+</button><button data-action="zoom-out">−</button></div>
          <button class="locate-button" data-action="locate">${icon("locate", 17)}<span>Minha localização</span></button>
          <div class="map-legend"><span><i class="legend-dot blue"></i> Alagamento</span><span><i class="legend-dot orange"></i> Resíduos</span><span><i class="legend-dot yellow"></i> Energia</span></div>
        </div>
        <div class="map-footer"><span><b class="live-dot"></b> Atualizado agora</span><span>${reports.length} ocorrências nesta região</span><button data-action="refresh-map">Atualizar ${icon("chevron", 14)}</button></div>
      </div>
    </div>
    <aside class="feed-column"><div class="feed-heading"><div><h2>Ocorrências recentes</h2><p>Na sua região <span class="live-badge">● ao vivo</span></p></div><button class="text-button" data-action="view-all">Ver todas ${icon("chevron", 14)}</button></div><div class="filter-tabs">${filterTab("all", "Todas", state.occurrences.length)}${filterTab("flood", "Alagamentos", state.occurrences.filter(x => x.type === "flood").length)}${filterTab("waste", "Resíduos", state.occurrences.filter(x => x.type === "waste").length)}${filterTab("power", "Energia", state.occurrences.filter(x => x.type === "power").length)}</div><div class="occurrence-list">${reports.slice(0, 5).map(renderOccurrenceCard).join("")}</div><button class="new-report-button" data-action="open-modal">${icon("plus", 18)} Registrar ocorrência</button></aside>
  </section>`;
}

function renderStatRow() {
  const active = state.occurrences.filter(x => x.status === "active").length;
  return `<div class="stats-row"><div class="stat-card"><div class="stat-icon blue-bg">${icon("pin", 18)}</div><div><span>Ocorrências ativas</span><strong>${active}<small> +12% <b>↗</b></small></strong></div></div><div class="stat-card"><div class="stat-icon green-bg">${icon("check", 18)}</div><div><span>Resolvidas este mês</span><strong>42<small class="positive"> +8 <b>↗</b></small></strong></div></div><div class="stat-card"><div class="stat-icon orange-bg">✦</div><div><span>Seu impacto</span><strong>${state.user.points}<small> pontos</small></strong></div></div></div>`;
}

function filterTab(id, label, count) { return `<button class="filter-tab ${state.activeFilter === id ? "active" : ""}" data-filter="${id}">${label}<span>${count}</span></button>`; }

function renderMarker(item) {
  const meta = typeMeta(item.type);
  return `<button class="map-marker marker-${meta.color} ${state.selectedOccurrence === item.id ? "selected" : ""}" style="left:${item.left}%;top:${item.lat}%" data-marker="${item.id}" aria-label="${item.title}"><span>${meta.icon}</span></button>`;
}

function renderOccurrenceCard(item) {
  const meta = typeMeta(item.type);
  const statusLabel = item.status === "resolved" ? "Resolvida" : item.status === "pending" ? "Em análise" : "Ativa";
  return `<article class="occurrence-card ${state.selectedOccurrence === item.id ? "selected" : ""}" data-occurrence="${item.id}"><div class="occurrence-card-top"><div class="occurrence-type-icon ${meta.color}">${meta.icon}</div><div class="occurrence-title"><h3>${item.title}</h3><p>${icon("pin", 12)} ${item.neighborhood} <span>·</span> ${item.time}</p></div><button class="more-button" aria-label="Mais opções">•••</button></div><p class="occurrence-description">${item.description}</p><div class="occurrence-card-footer"><span class="status status-${item.status}"><i></i>${statusLabel}</span><span class="confirmations">${icon("check", 13)} ${item.confirmations} confirmações</span></div></article>`;
}

function renderDetailPanel() {
  if (!state.selectedOccurrence) return "";
  const item = state.occurrences.find(x => x.id === state.selectedOccurrence);
  if (!item) return "";
  const meta = typeMeta(item.type);
  return `<div class="detail-drawer"><button class="drawer-close icon-button" data-action="close-detail">${icon("close", 18)}</button><div class="drawer-kicker"><span class="occurrence-type-icon ${meta.color}">${meta.icon}</span><span>${meta.label}</span><span class="status status-${item.status}"><i></i>${item.status === "resolved" ? "Resolvida" : "Ativa"}</span></div><h2>${item.title}</h2><p class="drawer-location">${icon("pin", 15)} ${item.neighborhood} · registrado ${item.time}</p><div class="drawer-preview"><div class="preview-lines"></div><span>visualização da área</span></div><p>${item.description}</p><div class="drawer-author"><div class="avatar small">${item.author.split(" ").map(x => x[0]).slice(0,2).join("")}</div><div><strong>Relatado por ${item.author}</strong><span>Obrigado por contribuir com a cidade</span></div></div><button class="confirm-button" data-action="confirm-report">${icon("check", 17)} Confirmar ocorrência <span>${item.confirmations}</span></button></div>`;
}

function renderSecondaryView() {
  if (state.activeNav === "my-reports") {
    const mine = state.occurrences.filter(x => x.author === state.user.name);
    return `<section class="secondary-content"><div class="secondary-hero"><div><span class="eyebrow">SEU HISTÓRICO</span><h2>Você já ajudou a sinalizar <em>${mine.length || 18} pontos</em> da cidade.</h2><p>Relatos consistentes tornam a resposta mais rápida e melhoram as decisões públicas.</p></div><div class="hero-score"><strong>${state.user.points}</strong><span>pontos totais</span></div></div><div class="section-title"><h2>Seus relatos</h2><button class="new-report-button compact" data-action="open-modal">${icon("plus", 16)} Novo relato</button></div><div class="report-table">${(mine.length ? mine : state.occurrences.slice(0,3)).map(x => `<div class="table-row"><div class="occurrence-type-icon ${typeMeta(x.type).color}">${typeMeta(x.type).icon}</div><div><strong>${x.title}</strong><span>${x.neighborhood} · ${x.time}</span></div><span class="status status-${x.status}"><i></i>${x.status === "resolved" ? "Resolvida" : "Em análise"}</span><span class="table-points">+${x.status === "resolved" ? 10 : 2} pts</span></div>`).join("")}</div></section>`;
  }
  if (state.activeNav === "ranking") return `<section class="secondary-content"><div class="ranking-banner"><span class="eyebrow">ABRIL · SÃO PAULO</span><h2>Pequenas ações.<br><em>Grande impacto.</em></h2><p>Veja quem está movimentando a comunidade nesta semana.</p></div><div class="ranking-list"><div class="ranking-row featured"><span class="rank">1</span><div class="avatar">${state.user.initials}</div><div class="rank-name"><strong>${state.user.name} <small>você</small></strong><span>18 ocorrências confirmadas</span></div><b>${state.user.points} pts</b></div>${["Gabriel Rocha", "Ana Costa", "Rafael Lima", "Luiza Reis"].map((name,i) => `<div class="ranking-row"><span class="rank">${i+2}</span><div class="avatar muted-avatar">${name.split(" ").map(x=>x[0]).join("")}</div><div class="rank-name"><strong>${name}</strong><span>${14-i*2} ocorrências confirmadas</span></div><b>${214-i*21} pts</b></div>`).join("")}</div></section>`;
  if (state.activeNav === "profile") return `<section class="secondary-content profile-view"><div class="profile-header"><div class="profile-large-avatar">${state.user.initials}</div><div><span class="eyebrow">COLABORADOR DESDE ABRIL DE 2026</span><h2>${state.user.name}</h2><p>Seu compromisso ajuda a cidade a responder melhor.</p></div><button class="outline-button">Editar perfil</button></div><div class="profile-stats"><div><strong>${state.user.points}</strong><span>Pontos acumulados</span></div><div><strong>18</strong><span>Relatos enviados</span></div><div><strong>87%</strong><span>Taxa de confirmação</span></div></div></section>`;
  return `<section class="secondary-content settings-view"><div class="settings-card"><div><h2>Preferências de alerta</h2><p>Receba avisos quando houver uma ocorrência perto de você.</p></div><button class="toggle ${state.user.notifications ? "on" : ""}" data-action="toggle-notifications"><span></span></button></div><div class="settings-card"><div><h2>Privacidade da localização</h2><p>Sua localização só é usada para posicionar seus relatos.</p></div><span class="privacy-pill">Protegida</span></div><div class="settings-card"><div><h2>Área de interesse</h2><p>Pinheiros, Vila Madalena, Sumaré e região.</p></div><button class="outline-button">Editar área</button></div></section>`;
}

function renderModal() {
  return `<div class="modal-backdrop" data-action="close-modal"><section class="report-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" data-modal-content><div class="modal-header"><div><span class="eyebrow">NOVA CONTRIBUIÇÃO</span><h2 id="modal-title">Registrar ocorrência</h2><p>Ajude sua comunidade a enxergar o que precisa mudar.</p></div><button class="icon-button" data-action="close-modal" aria-label="Fechar">${icon("close", 19)}</button></div><form id="report-form"><label>Tipo de ocorrência<select name="type" required><option value="flood">⟱ Alagamento</option><option value="waste">♻ Descarte irregular</option><option value="power">ϟ Falha elétrica</option></select></label><label>Título do relato<input name="title" placeholder="Ex.: Bueiro transbordando" required maxlength="70" /></label><label>Localização<div class="location-input">${icon("pin", 16)}<input name="neighborhood" value="Pinheiros, São Paulo" required /><button type="button" data-action="use-gps">Usar GPS</button></div></label><label>Descrição<textarea name="description" rows="4" placeholder="Conte o que está acontecendo, com o máximo de detalhes..."></textarea></label><label class="photo-upload"><span class="upload-icon">＋</span><span><strong>Adicionar foto <small>(opcional)</small></strong><em>Arraste uma imagem ou clique para buscar</em></span><input type="file" accept="image/*" /></label><div class="modal-location-status">${icon("locate", 15)} Sua localização será usada somente para posicionar o relato no mapa.</div><div class="modal-actions"><button type="button" class="outline-button" data-action="close-modal">Cancelar</button><button type="submit" class="submit-button">Publicar ocorrência ${icon("chevron", 15)}</button></div></form></section></div>`;
}

function bindEvents() {
  document.querySelectorAll("[data-nav]").forEach(el => el.addEventListener("click", () => { state.activeNav = el.dataset.nav; state.selectedOccurrence = null; document.body.classList.remove("sidebar-open"); render(); }));
  document.querySelectorAll("[data-filter]").forEach(el => el.addEventListener("click", () => { state.activeFilter = el.dataset.filter; render(); }));
  document.querySelectorAll("[data-occurrence], [data-marker]").forEach(el => el.addEventListener("click", () => { state.selectedOccurrence = el.dataset.occurrence || el.dataset.marker; render(); }));
  document.querySelectorAll("[data-action]").forEach(el => el.addEventListener("click", handleAction));
  document.querySelector("#report-form")?.addEventListener("submit", submitReport);
  document.querySelector("[data-modal-content]")?.addEventListener("click", e => e.stopPropagation());
  document.querySelector("#map-search")?.addEventListener("input", e => filterBySearch(e.target.value));
}

function handleAction(event) {
  const action = event.currentTarget.dataset.action;
  if (action === "open-modal") { state.modalOpen = true; render(); setTimeout(() => document.querySelector('[name="title"]')?.focus(), 50); }
  if (action === "close-modal") { state.modalOpen = false; render(); }
  if (action === "close-detail") { state.selectedOccurrence = null; render(); }
  if (action === "toggle-notifications") { state.user.notifications = !state.user.notifications; saveState(); render(); showToast(state.user.notifications ? "Alertas ativados" : "Alertas pausados"); }
  if (action === "toggle-sidebar") document.body.classList.toggle("sidebar-open");
  if (action === "locate" || action === "use-gps") useGeolocation();
  if (action === "confirm-report") confirmSelected();
  if (action === "refresh-map") { showToast("Mapa atualizado agora"); render(); }
  if (action === "toggle-layers") showToast("Camadas: ocorrências, pontos de coleta e iluminação");
  if (action === "zoom-in" || action === "zoom-out") showToast(action === "zoom-in" ? "Aproximando mapa" : "Afastando mapa");
  if (action === "view-all") { state.activeFilter = "all"; showToast("Exibindo todas as ocorrências"); render(); }
  if (action === "logout") showToast("Modo demonstração: sua sessão continua ativa");
}

function filterBySearch(value) {
  const term = value.trim().toLowerCase();
  document.querySelectorAll("[data-occurrence]").forEach(card => { card.style.display = !term || card.textContent.toLowerCase().includes(term) ? "" : "none"; });
  document.querySelectorAll("[data-marker]").forEach(marker => { const item = state.occurrences.find(x => x.id === marker.dataset.marker); marker.style.display = !term || item?.neighborhood.toLowerCase().includes(term) || item?.title.toLowerCase().includes(term) ? "" : "none"; });
}

function useGeolocation() {
  if (!navigator.geolocation) { showToast("GPS indisponível; ajuste o local manualmente"); return; }
  showToast("Buscando sua localização…");
  navigator.geolocation.getCurrentPosition(pos => { state.currentLocation = { left: Math.min(88, Math.max(12, 50 + (pos.coords.longitude + 46.65) * 18)), top: Math.min(88, Math.max(12, 50 - (pos.coords.latitude + 23.56) * 18)) }; state.modalOpen ? showToast("Localização encontrada") : render(); }, () => showToast("Não foi possível acessar o GPS; use o endereço manual"));
}

function submitReport(event) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const type = data.get("type");
  const duplicate = state.occurrences.find(item => item.type === type && item.neighborhood.toLowerCase().includes(String(data.get("neighborhood")).split(",")[0].toLowerCase()));
  if (duplicate && !event.currentTarget.dataset.confirmed) { showToast("Já existe um relato parecido nesta região. Publique novamente para confirmar."); event.currentTarget.dataset.confirmed = "true"; return; }
  const item = { id: `r-${Date.now()}`, type, title: data.get("title"), description: data.get("description") || "Relato enviado pela comunidade.", neighborhood: data.get("neighborhood"), status: "pending", time: "agora", author: state.user.name, confirmations: 1, lat: 48, left: 50 };
  state.occurrences.unshift(item); state.user.points += duplicate ? 2 : 10; state.modalOpen = false; state.activeNav = "map"; state.activeFilter = "all"; saveState(); render(); showToast(duplicate ? "Ocorrência confirmada · +2 pontos" : "Ocorrência publicada · +10 pontos");
}

function confirmSelected() {
  const item = state.occurrences.find(x => x.id === state.selectedOccurrence);
  if (!item) return;
  item.confirmations += 1; state.user.points += 2; saveState(); render(); showToast("Obrigado por confirmar este relato · +2 pontos");
}

function showToast(message) {
  const region = document.getElementById("toast-region");
  if (!region) return;
  const toast = document.createElement("div"); toast.className = "toast"; toast.innerHTML = `${icon("check", 16)}<span>${message}</span>`; region.appendChild(toast);
  setTimeout(() => toast.classList.add("leaving"), 2600); setTimeout(() => toast.remove(), 3000);
}

window.addEventListener("keydown", e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); document.querySelector("#map-search")?.focus(); } if (e.key === "Escape" && state.modalOpen) { state.modalOpen = false; render(); } });

render();
