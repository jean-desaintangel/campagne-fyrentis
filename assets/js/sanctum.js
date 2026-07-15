/**
 * sanctum.js — Orrérie tactique du système Sanctum (autres/cartes/sanctum.html).
 * Rendu SVG des planètes depuis sanctum.json, drapeaux de faction,
 * vaisseaux déplaçables (Pointer Events), persistance localStorage.
 * Dépendances : utils.js (échappement), assets/data/sanctum.json
 * @author  Jean
 * @since   2026-07
 */
import { escapeHTML, escapeAttr } from "./utils.js";

const STORAGE_KEY = "fyrentis-sanctum-tactical-state-v3";
const LEGACY_STORAGE_KEYS = [
  "fyrentis-sanctum-tactical-state",
  "fyrentis-sanctum-tactical-state-v2",
];

const FACTION_ICONS = {
  Mechanicus: "⚙",
  "Black Templars": "✠",
  Inquisition: "☩",
  "Blood Angels": "🩸",
  "Garde Impériale": "⚔",
  default: "★",
};

const FACTION_FLAG_STYLES = {
  "black-templars": {
    label: "Black Templars",
    color: "#c8a028",
    short: "BT",
  },
  "silver-templars": {
    label: "Silver Templars",
    color: "#aaccff",
    short: "ST",
  },
  "death-guard": {
    label: "Death Guard",
    color: "#6b8c3a",
    short: "DG",
  },
  necrons: { label: "Nécrons", color: "#33ffcc", short: "NEC" },
  "adeptus-mechanicus": {
    label: "Adeptus Mechanicus",
    color: "#33aaaa",
    short: "AM",
  },
  votann: { label: "Votann", color: "#d4882a", short: "VOT" },
  "world-eaters": {
    label: "World Eaters",
    color: "#c43030",
    short: "WE",
  },
  "blood-angels": {
    label: "Blood Angels",
    color: "#cc1111",
    short: "BA",
  },
  "iron-warriors": {
    label: "Iron Warriors de Khorne",
    color: "#8855cc",
    short: "IW",
  },
  "garde-imperiale": {
    label: "Garde Impériale",
    color: "#4488dd",
    short: "GI",
  },
};

const SHIP_STYLES = {
  "barge-bataille": { color: "#c43030", short: "BB" },
  "croiseur-attaque": { color: "#4488dd", short: "CA" },
  "croiseur-lourd": { color: "#e07030", short: "CL" },
  "cuirasse-classe-gloriana": { color: "#bb88ff", short: "CG" },
  "destroyer-classe-gladius": { color: "#c8a028", short: "DGD" },
  "destroyer-classe-hunter": { color: "#55aa66", short: "DH" },
  "destroyer-classe-nova": { color: "#33aaaa", short: "DN" },
  "forteresse-monastere": { color: "#8b1c1c", short: "FM" },
  "transport-logistique": { color: "#6b8c3a", short: "TL" },
  "transport-troupe": { color: "#d4882a", short: "TT" },
  "vaisseau-commandement": { color: "#aaccff", short: "VC" },
};

const SHIP_TYPE_LABELS = {
  "barge-bataille": "Barge de Bataille",
  "croiseur-attaque": "Croiseur d'Attaque",
  "croiseur-lourd": "Croiseur Lourd",
  "cuirasse-classe-gloriana": "Cuirassé Gloriana",
  "destroyer-classe-gladius": "Destroyer Gladius",
  "destroyer-classe-hunter": "Destroyer Hunter",
  "destroyer-classe-nova": "Destroyer Nova",
  "forteresse-monastere": "Forteresse Monastère",
  "transport-logistique": "Transport Logistique",
  "transport-troupe": "Transport de Troupe",
  "vaisseau-commandement": "Vaisseau de Commandement",
};

const LEGACY_SHIP_TYPE_MAP = {
  escorteur: "destroyer-classe-gladius",
  escorte: "destroyer-classe-gladius",
  croiseur: "croiseur-attaque",
  "croiseur-attaque": "croiseur-attaque",
  "barge-bataille": "barge-bataille",
  "croiseur-lourd": "croiseur-lourd",
  cuirasse: "cuirasse-classe-gloriana",
  transport: "transport-logistique",
  gloriana: "cuirasse-classe-gloriana",
  "forteresse-monastere": "forteresse-monastere",
};

function normalizeShipType(type) {
  if (SHIP_STYLES[type]) return type;
  if (LEGACY_SHIP_TYPE_MAP[type]) return LEGACY_SHIP_TYPE_MAP[type];
  return "croiseur-attaque";
}

// Bornes du SVG pour la position des vaisseaux (identiques au clamp du drag).
const SHIP_MIN_X = 20,
  SHIP_MAX_X = 680,
  SHIP_MIN_Y = 20,
  SHIP_MAX_Y = 540;

// Coerce une coordonnée en nombre borné. localStorage peut contenir des valeurs
// corrompues (chaîne, NaN, hors limites) qui, réinjectées dans l'attribut SVG
// transform, casseraient l'affichage de TOUS les vaisseaux. On retombe sur une
// valeur par défaut sûre plutôt que de propager une coordonnée invalide.
function clampCoord(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function normalizeShips(ships) {
  if (!Array.isArray(ships)) return [];
  return ships.map((ship) => ({
    ...ship,
    type: normalizeShipType(ship.type),
    x: clampCoord(ship.x, SHIP_MIN_X, SHIP_MAX_X, CX + 140),
    y: clampCoord(ship.y, SHIP_MIN_Y, SHIP_MAX_Y, CY - 120),
  }));
}

function purgeLegacyStorage() {
  LEGACY_STORAGE_KEYS.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn("Purge stockage legacy impossible :", e);
    }
  });
}

function saveTacticalState() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        flags: state.flags,
        ships: state.ships,
        shipCounter: state.shipCounter,
      }),
    );
  } catch (e) {
    console.warn("Sauvegarde impossible :", e);
  }
}

function loadTacticalState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      flags:
        parsed.flags && typeof parsed.flags === "object"
          ? parsed.flags
          : null,
      ships: normalizeShips(parsed.ships),
      shipCounter: Number.isFinite(parsed.shipCounter)
        ? parsed.shipCounter
        : null,
    };
  } catch (e) {
    console.warn("Chargement sauvegarde impossible :", e);
    return null;
  }
}

function validateSystem(sys) {
  if (!sys || typeof sys !== "object") throw new Error("system manquant");
  if (!sys.star || typeof sys.star.name !== "string")
    throw new Error("star invalide");
  if (!Array.isArray(sys.planets)) throw new Error("planets manquant");
}

function statusClass(status) {
  if (!status) return "imp";
  const s = status.toLowerCase();
  if (s.includes("mechanicus")) return "mech";
  if (s.includes("chaos") || s.includes("contesté")) return "contested";
  if (s.includes("inachevé") || s.includes("vulnérable")) return "warn";
  if (s.includes("opérationnel")) return "ok";
  return "imp";
}

function dangerPips(level) {
  let h = '<div class="danger-bar">';
  for (let i = 1; i <= 5; i++)
    h += `<div class="danger-pip${i <= level ? " on" : ""}"></div>`;
  return h + "</div>";
}

const CX = 350,
  CY = 280;
// SVG viewport center (700×560 canvas)
const RADII = [70, 120, 185, 255, 330];
// Distances orbitales depuis le centre (unités SVG)
const ANGLES = [-90, 45, 160, -30, 110];
// Décalages angulaires (degrés, 0 = droite, 90 = bas)

const state = {
  system: null,
  planetPositions: {},
  flags: {},
  ships: [],
  shipCounter: 0,
  drag: null,
  selectedPid: null,
};

function polar(r, angleDeg) {
  const a = (angleDeg * Math.PI) / 180;
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
}

function svgPoint(evt, svg) {
  const pt = svg.createSVGPoint();
  pt.x = evt.clientX;
  pt.y = evt.clientY;
  // getScreenCTM() retourne null si le SVG n'est pas encore dans le flux de rendu
  // (chargement en cours, test automatisé, SVG display:none).
  // Sans ce garde, null.inverse() lèverait un TypeError et bloquerait tout drag.
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  return pt.matrixTransform(ctm.inverse());
}

function buildOrrery(data) {
  const svg = document.getElementById("orrery-svg");
  let html = "";

  // RADII et ANGLES définissent 5 orbites. Si le JSON ajoute une 6ᵉ planète orbitale,
  // RADII[5] serait undefined et polar() produirait des coordonnées NaN —
  // la planète deviendrait invisible sans aucun message d'erreur.
  // On tronque au nombre d'orbites disponibles pour rester dans les bornes du tableau.
  const orbitalPlanets = data.planets
    .filter(
      (p) =>
        p.orbital_position !== null && p.orbital_position !== undefined,
    )
    .slice(0, RADII.length);
  orbitalPlanets.forEach((_, i) => {
    html += `<circle class="orbit-ring" cx="${CX}" cy="${CY}" r="${RADII[i]}"/>`;
  });

  html += `<circle cx="${CX}" cy="${CY}" r="38" fill="url(#star-glow)" opacity="0.5"/>`;
  html += `<circle cx="${CX}" cy="${CY}" r="20" fill="#ffe87a" filter="url(#planet-glow)"/>`;
  html += `<text x="${CX}" y="${CY + 34}" text-anchor="middle" font-family="Cinzel,serif" font-size="7.5" fill="#c8a028" letter-spacing="0.05em">${escapeHTML(data.star.name)}</text>`;

  orbitalPlanets.forEach((p, i) => {
    const pos = polar(RADII[i], ANGLES[i]);
    state.planetPositions[String(p.id)] = { x: pos.x, y: pos.y };
    const r = i === 2 ? 12 : i >= 3 ? 8 : 10;
    const dangerCls = p.danger_level >= 4 ? " danger-4" : "";
    html += `
        <g class="planet-group${dangerCls}" data-pid="${escapeAttr(String(p.id))}" tabindex="0" role="button" aria-label="${escapeAttr(p.name)}">
          <circle cx="${pos.x}" cy="${pos.y}" r="${r + 8}" fill="${escapeAttr(p.color_hex)}" opacity="0.08"/>
          <circle class="planet-bg" cx="${pos.x}" cy="${pos.y}" r="${r}" fill="${escapeAttr(p.color_hex)}" stroke="${escapeAttr(p.color_hex)}" stroke-width="0.8" filter="url(#planet-glow)"/>
          <text class="planet-label" x="${pos.x}" y="${pos.y + r + 11}" text-anchor="middle">${escapeHTML(p.name)}</text>
          <text class="planet-sublabel" x="${pos.x}" y="${pos.y + r + 20}" text-anchor="middle">${escapeHTML(p.type.split("—")[0].trim())}</text>
        </g>`;

    if (p.id === 1) {
      state.planetPositions["brokha"] = {
        x: pos.x + 18,
        y: pos.y - 14,
      };
      html += `
          <g class="planet-group" data-pid="brokha" tabindex="0" role="button" aria-label="Lune Brokha">
            <circle cx="${pos.x + 18}" cy="${pos.y - 14}" r="5" fill="#aaaaaa" opacity="0.8" filter="url(#planet-glow)"/>
            <text class="planet-sublabel" x="${pos.x + 18}" y="${pos.y - 5}" text-anchor="middle">Brokha</text>
          </g>`;
    }
  });

  const specialPositions = {
    near_inner: polar(RADII[0] - 30, 60),
    near_outer: polar(RADII[1] + 30, 200),
    brokha_moon: (() => {
      const sanctum = orbitalPlanets.find((p) => p.id === 1);
      if (!sanctum) return { x: CX + 40, y: CY - 50 };
      const sp = polar(RADII[0], ANGLES[0]);
      return { x: sp.x + 18, y: sp.y - 14 };
    })(),
  };

  const specialPlanets = data.planets.filter((p) => p.svg_position);
  specialPlanets.forEach((p) => {
    const pos = specialPositions[p.svg_position] || {
      x: CX + 50,
      y: CY - 50,
    };
    state.planetPositions[String(p.id)] = { x: pos.x, y: pos.y };
    const r = 7;
    const dangerCls = p.danger_level >= 4 ? " danger-4" : "";
    const shortLabel =
      p.name.length > 12 ? p.name.split(" ")[0] + "…" : p.name;
    html += `
        <g class="planet-group${dangerCls}" data-pid="${escapeAttr(String(p.id))}" tabindex="0" role="button" aria-label="${escapeAttr(p.name)}">
          <circle cx="${pos.x}" cy="${pos.y}" r="${r + 8}" fill="${escapeAttr(p.color_hex)}" opacity="0.08"/>
          <circle class="planet-bg" cx="${pos.x}" cy="${pos.y}" r="${r}" fill="${escapeAttr(p.color_hex)}" stroke="${escapeAttr(p.color_hex)}" stroke-width="0.8" filter="url(#planet-glow)"/>
          <text class="planet-label" x="${pos.x}" y="${pos.y + r + 11}" text-anchor="middle">${escapeHTML(shortLabel)}</text>
          <text class="planet-sublabel" x="${pos.x}" y="${pos.y + r + 20}" text-anchor="middle">${escapeHTML(p.type.split("—")[0].trim())}</text>
        </g>`;
  });

  html += `<g id="flags-layer"></g>`;
  html += `<g id="ships-layer"></g>`;
  svg.insertAdjacentHTML("beforeend", html);
}

function bindFlagInteractions() {
  document.querySelectorAll(".flag-group").forEach((el) => {
    el.addEventListener("contextmenu", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const pid = el.dataset.flagFor;
      removePlanetFlag(pid);
    });
  });
}

function renderFlags() {
  const layer = document.getElementById("flags-layer");
  if (!layer) return;
  let html = "";
  Object.entries(state.flags).forEach(([pid, factionKey]) => {
    const pos = state.planetPositions[pid];
    const faction = FACTION_FLAG_STYLES[factionKey];
    if (!pos || !faction) return;
    const fx = pos.x + 12,
      fy = pos.y - 18;
    html += `
        <g class="flag-group" data-flag-for="${escapeAttr(pid)}" role="button" aria-label="Retirer le drapeau de ${escapeAttr(pid)}">
          <line x1="${fx}" y1="${fy}" x2="${fx}" y2="${fy + 18}" stroke="${escapeAttr(faction.color)}" stroke-width="1.4"/>
          <path d="M ${fx} ${fy} L ${fx + 13} ${fy + 4} L ${fx} ${fy + 8} Z" fill="${escapeAttr(faction.color)}" stroke="#111" stroke-width="0.5"/>
          <text class="flag-label" x="${fx + 16}" y="${fy + 7}">${escapeHTML(faction.short)}</text>
        </g>`;
  });
  layer.innerHTML = html;
  bindFlagInteractions();
}

function renderShips() {
  const layer = document.getElementById("ships-layer");
  if (!layer) return;

  let html = "";
  state.ships.forEach((ship) => {
    const normalizedType = normalizeShipType(ship.type);
    // Si le type normalisé est absent de SHIP_STYLES (localStorage corrompu,
    // JSON mis à jour avec un nouveau type non encore déclaré ici),
    // on utilise 'croiseur-attaque' comme style de repli plutôt que de crasher
    // sur `undefined.short` et de perdre l'affichage de tous les vaisseaux.
    const style =
      SHIP_STYLES[normalizedType] || SHIP_STYLES["croiseur-attaque"];
    const displayName = escapeHTML(ship.name || style.short);

    html += `
        <g class="ship-token" data-ship-id="${escapeAttr(ship.id)}" transform="translate(${ship.x}, ${ship.y})">
          <circle class="ship-hitbox" cx="0" cy="0" r="14"></circle>
          <path class="ship-body" d="M -8 0 L 0 -6 L 8 0 L 0 6 Z" fill="${escapeAttr(style.color)}"></path>
          <circle cx="0" cy="0" r="2.2" fill="#111"></circle>
          <text class="ship-label" x="0" y="20" text-anchor="middle">${displayName}</text>
        </g>`;
  });

  layer.innerHTML = html;

  // On re-lie le pointerdown sur les nouveaux éléments SVG (ils viennent d'être
  // recréés via innerHTML). En revanche, on N'appelle PAS bindShipDragging() ici :
  // les listeners SVG-niveau (pointermove / pointerup) sont liés une seule fois
  // au démarrage. Les appeler à chaque rendu empilérait des handlers en cascade.
  bindShipPointerDown();

  layer.querySelectorAll(".ship-token").forEach((el) => {
    el.addEventListener("contextmenu", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();

      const id = el.dataset.shipId;
      state.ships = state.ships.filter((s) => s.id !== id);

      renderShips();
      saveTacticalState();
    });
  });
}

// Relie le handler pointerdown sur chaque token du layer.
// Doit être appelé après chaque renderShips() car innerHTML recrée les éléments SVG.
function bindShipPointerDown() {
  const svg = document.getElementById("orrery-svg");
  document.querySelectorAll(".ship-token").forEach((el) => {
    el.addEventListener("pointerdown", (ev) => {
      ev.stopPropagation();
      const ship = state.ships.find((s) => s.id === el.dataset.shipId);
      if (!ship) return;
      const p = svgPoint(ev, svg);
      state.drag = {
        id: el.dataset.shipId,
        dx: p.x - ship.x,
        dy: p.y - ship.y,
      };
      el.classList.add("dragging");
      el.setPointerCapture(ev.pointerId);
    });
  });
}

function addShip() {
  const type = normalizeShipType(
    document.getElementById("ship-type").value,
  );
  const factionKey = document.getElementById("faction-select").value;
  const factionLabel = FACTION_FLAG_STYLES[factionKey]?.label ?? "Inconnue";
  const typeLabel = SHIP_TYPE_LABELS[type] || type;
  const shipName = typeLabel + " – " + factionLabel;

  state.shipCounter += 1;
  state.ships.push({
    id: "ship-" + state.shipCounter,
    type,
    name: shipName,
    x: CX + 140,
    y: CY - 120,
  });

  renderShips();
  saveTacticalState();
}

function clearShips() {
  state.ships = [];
  renderShips();
  saveTacticalState();
}

function clearFlags() {
  state.flags = {};
  renderFlags();
  if (state.selectedPid) showDetail(state.system, state.selectedPid);
  saveTacticalState();
}

function setPlanetFlag(pid) {
  const faction = document.getElementById("faction-select").value;
  state.flags[pid] = faction;
  renderFlags();
  showDetail(state.system, pid);
  saveTacticalState();
}

function removePlanetFlag(pid) {
  // `in` teste l'existence de la clé, pas sa valeur.
  // L'ancienne garde `!state.flags[pid]` aurait bloqué la suppression si la valeur
  // du drapeau était une chaîne vide '' ou toute autre valeur falsy.
  if (!(pid in state.flags)) return;
  delete state.flags[pid];
  renderFlags();
  showDetail(state.system, pid);
  saveTacticalState();
}

// Appelée UNE SEULE FOIS au démarrage (dans le bloc fetch, jamais depuis renderShips).
// Elle attache les listeners de niveau SVG qui gèrent le déplacement et la fin du drag.
//
// Pourquoi cette séparation est cruciale :
//   Avant, bindShipDragging() était appelée depuis renderShips(), et le handler
//   pointermove appelait renderShips() → chaque pixel de drag ajoutait UN NOUVEAU
//   listener pointermove sur le SVG. Après 50 pixels : 50 handlers actifs en parallèle,
//   le vaisseau sautait et le navigateur devenait inutilisable.
function bindShipDragging() {
  const svg = document.getElementById("orrery-svg");

  svg.addEventListener("pointermove", (ev) => {
    if (!state.drag) return;
    const ship = state.ships.find((s) => s.id === state.drag.id);
    if (!ship) return;
    const p = svgPoint(ev, svg);
    ship.x = Math.max(20, Math.min(680, p.x - state.drag.dx));
    ship.y = Math.max(20, Math.min(540, p.y - state.drag.dy));
    // Mise à jour directe de l'attribut SVG transform au lieu de reconstruire
    // tout le innerHTML : plus rapide et évite de recréer des listeners à chaque frame.
    const token = document.querySelector(
      `.ship-token[data-ship-id="${state.drag.id}"]`,
    );
    if (token)
      token.setAttribute(
        "transform",
        `translate(${ship.x}, ${ship.y})`,
      );
  });

  const endDrag = () => {
    if (state.drag) saveTacticalState();
    state.drag = null;
    document
      .querySelectorAll(".ship-token.dragging")
      .forEach((el) => el.classList.remove("dragging"));
  };
  svg.addEventListener("pointerup", endDrag);
  svg.addEventListener("pointerleave", endDrag);
}

function bindDetailActions() {
  const removeBtn = document.getElementById("remove-flag-btn");
  if (removeBtn) {
    removeBtn.addEventListener("click", () => {
      const pid = removeBtn.dataset.pid;
      removePlanetFlag(pid);
    });
  }
  // Équivalent clavier/tactile du clic droit « planter un drapeau ».
  const setBtn = document.getElementById("set-flag-btn");
  if (setBtn) {
    setBtn.addEventListener("click", () => {
      setPlanetFlag(setBtn.dataset.pid);
    });
  }
}

function showDetail(data, pid) {
  state.selectedPid = pid;
  document
    .querySelectorAll(".planet-group")
    .forEach((g) => g.classList.remove("selected"));
  document
    .querySelectorAll('[data-pid="' + pid + '"]')
    .forEach((g) => g.classList.add("selected"));

  const zone = document.getElementById("detail-zone");
  let html = "";

  const currentFlag = state.flags[pid];
  const flagInfo = currentFlag
    ? FACTION_FLAG_STYLES[currentFlag]
    : null;
  // Deux boutons complémentaires du clic droit : le contextmenu est
  // inaccessible au clavier et sur écran tactile (pas de clic droit au doigt).
  // Ces boutons offrent le même service, accessibles partout (WCAG 2.1.1).
  const flagBlock = flagInfo
    ? `<div class="pd-section"><h4>Occupation visible</h4><div class="tags"><span class="tag gold">Drapeau : ${escapeHTML(flagInfo.label)}</span></div><div class="flag-actions"><button type="button" class="inline-action-btn" id="remove-flag-btn" data-pid="${escapeAttr(pid)}">Retirer le drapeau</button></div><p class="inline-help">Astuce : fais un clic droit sur le drapeau directement dans l'orrérie pour le retirer.</p></div>`
    : `<div class="pd-section"><h4>Occupation visible</h4><div class="flag-actions"><button type="button" class="inline-action-btn" id="set-flag-btn" data-pid="${escapeAttr(pid)}">Planter le drapeau de la faction sélectionnée</button></div><p class="inline-help">Choisis la faction dans l'Éditeur tactique ci-dessous. Astuce : le clic droit sur la planète fonctionne aussi.</p></div>`;

  if (pid === "brokha") {
    html = `<div class="planet-detail active">
        <p class="pd-eyebrow">Lune de Sanctum — Fortification</p>
        <h3 class="pd-name">Brokha</h3>
        <p class="pd-type">Lune — Fortification Chapitrale</p>
        <span class="pd-status ok">✠ Opérationnel — QG de Croisade</span>
        <p class="pd-desc">Forteresse stellaire lourde implantée sur la lune Brokha. Siège de la présence des Black Templars dans le système et quartier général de la Croisade Fyrentis. Le Sénéchal Manfred y commande l'ensemble des forces alliées du sous-secteur.</p>
        ${flagBlock}
        <div class="pd-section"><h4>Installations</h4><div class="tags"><span class="tag gold">✠ QG Croisade</span><span class="tag">Forteresse stellaire lourde</span><span class="tag">Garnison Astartes</span></div></div>
        <div class="pd-section"><h4>Niveau de danger</h4>${dangerPips(1)}</div>
      </div>`;
  } else {
    const p = data.planets.find((pl) => String(pl.id) === String(pid));
    if (p) {
      const scls = statusClass(p.imperial_status);
      // notable_features peut être absent ou null si une planète du JSON ne déclare
      // pas ce champ — `|| []` garantit que .map() ne lève pas de TypeError.
      const featuresHTML = (p.notable_features || [])
        .map((f) => `<span class="tag">${escapeHTML(f)}</span>`)
        .join("");
      const eyebrow = p.orbital_position
        ? `Corps Céleste — Orbite ${escapeHTML(String(p.orbital_position))}`
        : `Fortification — Système Sanctum`;
      const subtitle = p.orbital_distance_au
        ? `${escapeHTML(p.type)} &mdash; ${escapeHTML(String(p.orbital_distance_au))} UA`
        : escapeHTML(p.type);
      html = `<div class="planet-detail active">
          <p class="pd-eyebrow">${eyebrow}</p>
          <h3 class="pd-name">${escapeHTML(p.name)}</h3>
          <p class="pd-type">${subtitle}</p>
          <span class="pd-status ${scls}">${escapeHTML(p.imperial_status)}</span>
          <p class="pd-desc">${escapeHTML(p.description)}</p>
          ${flagBlock}
          <div class="pd-section"><h4>Caractéristiques</h4><div class="tags">${featuresHTML}</div></div>
          <div class="pd-section"><h4>Niveau de danger</h4>${dangerPips(p.danger_level)}</div>
        </div>`;
    }
  }

  zone.innerHTML =
    html ||
    '<div class="empty-state"><div class="empty-state-icon">◈</div><p>Aucune donnée disponible.</p></div>';
  bindDetailActions();
}

function bindClicks(data) {
  document.querySelectorAll(".planet-group").forEach((g) => {
    g.addEventListener("click", () => {
      const pid = g.dataset.pid;
      showDetail(data, pid);
    });
    g.addEventListener("contextmenu", (ev) => {
      ev.preventDefault();
      const pid = g.dataset.pid;
      showDetail(data, pid);
      if (state.flags[pid]) {
        removePlanetFlag(pid);
      } else {
        setPlanetFlag(pid);
      }
    });
    g.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const pid = g.dataset.pid;
        showDetail(data, pid);
      }
    });
  });
}

function renderWarpAlert(warp) {
  if (!warp) return;
  document.getElementById("warp-alert-zone").innerHTML =
    `<div class="warp-alert">
        <div class="warp-alert-title">⚠ ${escapeHTML(warp.name)} — ${escapeHTML(warp.status)}</div>
        <p class="warp-alert-text">${escapeHTML(warp.description)}</p>
      </div>`;
}

function renderFigures(figures) {
  if (!figures || !figures.length) return;
  document.getElementById("figures-section").style.display = "";
  document.getElementById("figures-list").innerHTML = figures
    .map((f) => {
      const icon = FACTION_ICONS[f.faction] || FACTION_ICONS.default;
      return `<div class="figure-item">
        <div class="figure-icon">${escapeHTML(icon)}</div>
        <div class="figure-info"><p>${escapeHTML(f.nom)}</p><span>${escapeHTML(f.role)}</span></div>
      </div>`;
    })
    .join("");
}

function bindEditor() {
  document
    .getElementById("add-ship-btn")
    .addEventListener("click", addShip);
  document
    .getElementById("clear-ships-btn")
    .addEventListener("click", clearShips);
  document
    .getElementById("clear-flags-btn")
    .addEventListener("click", clearFlags);
}

purgeLegacyStorage();

fetch("../../assets/data/sanctum.json")
  .then((r) => {
    // r.ok distingue une vraie erreur HTTP (404, 500) d'un JSON invalide.
    if (!r.ok) throw new Error(`HTTP ${r.status} sur sanctum.json`);
    return r.json();
  })
  .then((d) => {
    const sys = d.system;
    validateSystem(sys);
    state.system = sys;
    document.getElementById("star-name").textContent = sys.star.name;
    document.getElementById("star-type").textContent = sys.star.type;
    document.getElementById("sb-title").textContent = sys.name;
    buildOrrery(sys);

    const savedState = loadTacticalState();
    if (savedState) {
      if (savedState.flags) state.flags = savedState.flags;
      if (savedState.ships)
        state.ships = normalizeShips(savedState.ships);
      // != null (comparaison lâche) couvre null ET undefined.
      // L'ancienne vérification `!== null` (stricte) laissait passer undefined,
      // ce qui se produit quand l'état vient d'une version antérieure du code sans
      // shipCounter. Résultat : state.shipCounter = undefined, puis addShip() produisait
      // l'id 'ship-NaN' — tous les vaisseaux portaient le même id.
      if (savedState.shipCounter != null)
        state.shipCounter = savedState.shipCounter;
    }

    bindClicks(sys);
    bindEditor();
    // bindShipDragging() est appelé ICI, une seule fois, pour attacher les listeners
    // de niveau SVG (pointermove / pointerup). renderShips() ne doit JAMAIS l'appeler,
    // sous peine d'empiler des dizaines de handlers à chaque pixel de drag.
    bindShipDragging();
    renderWarpAlert(sys.warp_route);
    renderFigures(sys.key_figures);
    renderFlags();
    renderShips();
    saveTacticalState();
  })
  .catch((err) => {
    console.error("Erreur chargement sanctum.json :", err);
    document
      .getElementById("orrery-svg")
      .insertAdjacentHTML(
        "beforeend",
        '<text x="350" y="280" text-anchor="middle" font-size="14" fill="#c43030">Erreur de chargement</text>',
      );
  });
