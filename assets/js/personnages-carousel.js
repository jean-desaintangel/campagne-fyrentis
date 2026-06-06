/**
 * personnages-carousel.js
 * Carrousel de présentation des personnages — Campagne Fyrentis
 * Univers World Eaters / Warhammer 40K
 *
 * 100 % JavaScript vanilla — aucune dépendance externe
 * Responsive • Accessible (clavier + ARIA) • Touch/swipe
 * Gère les images manquantes avec un placeholder élégant
 */
(function () {
  'use strict';

  /* ── Données des personnages ────────────────────────────────────────────
   * Chaque objet contient :
   *   nom      : string  — nom affiché
   *   titre    : string  — rôle / épithète
   *   faction  : string  — étiquette faction (badge)
   *   image    : string  — chemin relatif depuis la racine du site
   *   lore     : string  — description narrative
   * ─────────────────────────────────────────────────────────────────────*/
  var PERSONNAGES = [
    {
      nom:     'Angron',
      titre:   'Primarque des World Eaters',
      faction: 'World Eaters · Primarque',
      image:   'assets/img/personnages/angron.jpg',
      lore:    'Angron naquit dans la boue rouge de Nuceria et ne connut jamais que la chaîne, le fouet et le cri des arènes. Les clous du boucher martelèrent son crâne jusqu’à ce que toute pensée devienne douleur, et que seule la guerre apaise le tumulte. Quand il mena ses gladiateurs vers une dernière révolte, l’Empereur le vola à son unique victoire, et la rancœur d’Angron hurle encore à travers les vox, noyée dans le rugissement des canons du Conqueror. Aujourd’hui, il est plus qu’un primarque : il est un ouragan de sang qui cherche, dans chaque massacre, un instant de silence intérieur. Dans ses rares moments de lucidité, il craint de ne plus se souvenir du visage de ses frères d’arène. Certains World Eaters jurent entendre Angron murmurer des noms de gladiateurs morts, comme s’il les cherchait encore dans le Warp.'
    },
    {
      nom:     'Lotara Sarrin',
      titre:   'Âme du Conqueror',
      faction: 'World Eaters · le Conqueror',
      image:   'assets/img/personnages/lotara.jpg',
      lore:    'Lotara Sarrin, « la rose nourrie par le sang », règne sur le Conqueror. À trente ans à peine, elle commande l’un des plus vastes Gloriana de l’impérium. Simple mortelle au milieu des demi-dieux enragés, elle oppose à leur frénésie une volonté d’acier. Elle impose une discipline de fer sur le Conqueror, n’hésitant pas à abattre le capitaine World Eaters Delvarus sur le pont de commandement d’un tir de pistolet laser en pleine tête pour rappeler que la seule autorité sur le Conqueror, c’est elle. Elle ne supplie pas, ne flatte pas, ne fuit pas. Elle maintient le vaisseau prêt à la guerre, quitte à abattre ses propres alliés. On chuchote qu’elle garde, dans ses quartiers, la liste précise de tous les World Eaters qu’elle a menacé d’abattre… et que la plupart des noms y sont barrés. Mais Lotara Sarrin n’est plus une simple mortelle. Désormais liée au Conqueror, elle en est devenue l’âme indissociable, une volonté spectrale qui imprègne chaque coursive. Le vaisseau est sa chair, ses systèmes l’expression de son autorité absolue. Les vox tonnent parfois de sa voix impérieuse, les armes s’orientent comme guidées par un décret invisible, et même les World Eaters — pourtant esclaves de leur rage — vacillent un instant sous son regard que nul ne peut fuir.'
    },
    {
      nom:     'Khârn le Sanglant',
      titre:   'Le Félon — Champion de Khorne',
      faction: 'World Eaters · 8ème capitaine',
      image:   'assets/img/personnages/kharne.jpg',
      lore:    'Khârn le sanglant avance au cœur du fracas, là où les vox sont saturés de hurlements, et où la chaleur des bolters déforme l’air. Les clous du boucher étouffent tout sauf le plaisir brut du carnage. Il est devenu le félon, celui qui, sur Skalathrax, brisa la XIIe Légion dans une nuit de givre, de feu et de sang, frappant amis et ennemis jusqu’à ce qu’il ne reste que le silence et l’odeur métallique de la vapeur rouge. Aujourd’hui, chaque crâne pris est un pas de plus sur une route qu’il ne contrôle plus vraiment. On dit que son compteur de morts s’est arrêté depuis longtemps, incapable de suivre ses massacres, mais qu’il continue de cliquer dans le noir.'
    },
	{
      nom:     'Morgath le Faucheur',
      titre:   'Maître des Exécutions',
      faction: 'World Eaters',
      image:   'assets/img/personnages/morgath.jpg',
      lore:    'Croiser le Maître des Exécutions Morgath le Faucheur est une condamnation à mort, sa hache de démembrement tuant sans discontinuer. À la station 9 de Jakku, il éventra le capitaine Essios des Silver Templars « comme on ouvre une boîte de conserve rouillée », avant d’être apparemment fauché par un déluge de tirs croisés et l’appui-feu du dreadnought Thaddeus. Sa chute rompit l’équilibre précaire qu’il maintenait par la peur et le respect. Pourtant, parmi les survivants – loyalistes comme renégats – courent des rumeurs affirmant que nul n’a jamais retrouvé le corps de Morgath, seulement une traînée de sang séché. Certains Inquisiteurs parlent d’un Maître des Exécutions aperçu fugacement sur d’autres mondes du sous-secteur Fyrentis, hache au poing et armure cabossée, suggérant que le Morgath a peut-être offert sa mort à Khorne en échange du droit de revenir moissonner encore davantage de têtes.'
    },
    {
      nom:     'Kharak le Sanguinaire',
      titre:   'Berserker assoifé de Khorne',
      faction: 'World Eaters',
      image:   'assets/img/personnages/kharak.jpg',
      lore:    'Sur Jakku, Kharak le Sanguinaire suivit d’abord Morgath le Faucheur à la station 9, où la mort de son Maître des Exécutions fit voler en éclats ses dernières brides mentales et laissa son esprit dériver dans un voile écarlate dont il ne garda que des flashes de crânes explosés à mains nues. Lorsque les guerres pour les agro-stations s’étendirent, Kharak fut à nouveau lâché sur Jakku, cette fois contre les défenses disciplinées des Silver Templars autour de la station 7. Il se jeta hors des Rhinos, traversant le feu croisé des bolters pour atteindre le choc brutal des lames énergétiques et des tronçonneuses, face au capitaine Cassius et à son fer de lance d’Intercessors. Dans la mêlée confuse, alors que Thaddeus tombait, que les Ferrocerberus se brisaient et que les lignes loyalistes s’effritaient, Kharak continua de frapper en hurlant le nom de Khorne. On raconte que, lorsque la station 7 devint un avant-poste sanglant dédié au Dieu du Sang, c’est sur un tas de cadavres Silver Templars marqué par ses coups que les premiers autels improvisés furent élevés, liant à jamais le nom de Kharak au massacre de Jakku.'
    }
  ];

  /* ── SVG placeholder affiché quand une image est manquante ─────────── */
  var PLACEHOLDER_SVG = '<svg viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="52" height="52" rx="2"/><path d="M4 40 l14-14 10 10 12-16 16 20"/><circle cx="42" cy="18" r="5"/></svg>';

  /* ── Construire le HTML d\'un slide ───────────────────────────────────── */
  function buildSlide(perso, index, total) {
    var imgHTML = [
      '<div class="perso-carousel__img-wrap">',
        '<img',
        '  class="perso-carousel__img"',
        '  src="' + perso.image + '"',
        '  alt="' + escapeAttr(perso.nom) + '"',
        '  loading="' + (index === 0 ? 'eager' : 'lazy') + '"',
        '  width="860"',
        '  height="420"',
        '  data-perso-index="' + index + '"',
        '>',
        '<div class="perso-carousel__img-placeholder" aria-hidden="true" style="display:none">',
          PLACEHOLDER_SVG,
          '<span>Image non disponible</span>',
        '</div>',
      '</div>'
    ].join('');

    var bodyHTML = [
      '<div class="perso-carousel__body">',
        '<span class="perso-carousel__faction">' + escapeHTML(perso.faction) + '</span>',
        '<h3 class="perso-carousel__name">' + escapeHTML(perso.nom) + '</h3>',
        '<p class="perso-carousel__title">' + escapeHTML(perso.titre) + '</p>',
        '<div class="perso-carousel__ornament" aria-hidden="true"><span>&#9778; Dossier Inquisitorial &#9778;</span></div>',
        '<p class="perso-carousel__lore">' + escapeHTML(perso.lore) + '</p>',
      '</div>'
    ].join('');

    return [
      '<article',
      '  class="perso-carousel__slide"',
      '  role="group"',
      '  aria-roledescription="slide"',
      '  aria-label="' + escapeAttr(perso.nom) + ', ' + (index + 1) + ' sur ' + total + '"',
      '>',
        imgHTML,
        bodyHTML,
      '</article>'
    ].join('');
  }

  /* ── Utilitaires d\'échappement ─────────────────────────────────────── */
  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function escapeAttr(str) {
    return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ── Injection HTML dans la section ────────────────────────────────── */
  function injectCarousel(section) {
    var total = PERSONNAGES.length;

    // Construire les slides
    var slidesHTML = PERSONNAGES.map(function (p, i) {
      return buildSlide(p, i, total);
    }).join('');

    // Construire les dots de pagination
    var dotsHTML = PERSONNAGES.map(function (p, i) {
      return [
        '<button',
        '  class="perso-carousel__dot' + (i === 0 ? ' is-active' : '') + '"',
        '  role="tab"',
        '  aria-label="' + escapeAttr(p.nom) + '"',
        '  aria-selected="' + (i === 0 ? 'true' : 'false') + '"',
        '  data-perso-dot="' + i + '"',
        '></button>'
      ].join('');
    }).join('');

    section.innerHTML = [
      '<div class="perso-carousel" id="perso-carousel" role="region" aria-roledescription="carrousel" aria-label="Personnages de la campagne">',

        '<!-- Viewport + piste de slides -->',
        '<div class="perso-carousel__viewport" id="perso-carousel-viewport">',
          '<div class="perso-carousel__track" id="perso-carousel-track" aria-live="polite">',
            slidesHTML,
          '</div>',
        '</div>',

        '<!-- Bouton précédent -->',
        '<button class="perso-carousel__btn perso-carousel__btn--prev" id="perso-btn-prev" aria-label="Personnage précédent" type="button">',
          '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>',
        '</button>',

        '<!-- Bouton suivant -->',
        '<button class="perso-carousel__btn perso-carousel__btn--next" id="perso-btn-next" aria-label="Personnage suivant" type="button">',
          '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>',
        '</button>',

        '<!-- Pagination (dots) -->',
        '<div class="perso-carousel__pagination" role="tablist" aria-label="Navigation des personnages">',
          dotsHTML,
        '</div>',

        '<!-- Compteur textuel -->',
        '<p class="perso-carousel__counter" aria-live="polite" aria-atomic="true" id="perso-counter">1 / ' + total + '</p>',

      '</div>'
    ].join('');
  }

  /* ── Logique du carrousel ───────────────────────────────────────────── */
  function initLogic() {
    var carousel  = document.getElementById('perso-carousel');
    var viewport  = document.getElementById('perso-carousel-viewport');
    var track     = document.getElementById('perso-carousel-track');
    var btnPrev   = document.getElementById('perso-btn-prev');
    var btnNext   = document.getElementById('perso-btn-next');
    var counter   = document.getElementById('perso-counter');
    var dots      = Array.from(document.querySelectorAll('[data-perso-dot]'));
    var slides    = Array.from(track.querySelectorAll('.perso-carousel__slide'));
    var total     = slides.length;
    if (!total) return;

    var current  = 0;
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ── Gestion des images manquantes ───────────────────────────────── */
    slides.forEach(function (slide) {
      var img = slide.querySelector('.perso-carousel__img');
      var placeholder = slide.querySelector('.perso-carousel__img-placeholder');
      if (!img) return;
      img.addEventListener('error', function () {
        img.style.display = 'none';
        if (placeholder) placeholder.style.display = 'flex';
      });
    });

    /* ── Aller à un slide donné ───────────────────────────────────────── */
    function goTo(index) {
      // Normalisation circulaire : permet de naviguer au-delà des bornes
      // (ex. goTo(-1) va au dernier slide, goTo(total) revient au premier).
      index = ((index % total) + total) % total;
      // Évite le re-rendu inutile si on clique sur le dot du slide déjà actif.
      // L'ancienne condition `announce === false` ne se déclenchait jamais :
      // aucun appelant ne passait ce paramètre, donc announce était toujours
      // undefined, et `undefined === false` est toujours faux.
      if (index === current) return;

      current = index;

      // Déplacer la piste
      track.style.transform = 'translateX(-' + (current * 100) + '%)';

      // Mettre à jour les dots
      dots.forEach(function (dot, i) {
        var active = (i === current);
        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-selected', active ? 'true' : 'false');
      });

      // Mettre à jour le compteur
      if (counter) counter.textContent = (current + 1) + ' / ' + total;

      // Mettre à jour aria-live du slide courant
      slides.forEach(function (slide, i) {
        slide.setAttribute('aria-hidden', i !== current ? 'true' : 'false');
      });
    }

    // Init : masquer les slides non actifs pour les lecteurs d\'écran
    slides.forEach(function (slide, i) {
      if (i !== 0) slide.setAttribute('aria-hidden', 'true');
    });

    /* ── Boutons précédent / suivant ─────────────────────────────────── */
    btnPrev.addEventListener('click', function () { goTo(current - 1); });
    btnNext.addEventListener('click', function () { goTo(current + 1); });

    /* ── Dots de pagination ───────────────────────────────────────────── */
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        goTo(parseInt(dot.getAttribute('data-perso-dot'), 10));
      });
    });

    /* ── Navigation clavier ──────────────────────────────────────────── */
    carousel.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { e.preventDefault(); goTo(current - 1); }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown')  { e.preventDefault(); goTo(current + 1); }
      if (e.key === 'Home') { e.preventDefault(); goTo(0); }
      if (e.key === 'End')  { e.preventDefault(); goTo(total - 1); }
    });

    // Rendre le carousel focusable pour la navigation clavier
    if (!carousel.hasAttribute('tabindex')) carousel.setAttribute('tabindex', '0');

    /* ── Swipe tactile ───────────────────────────────────────────────── */
    var touchStartX  = null;
    var touchStartY  = null;
    var SWIPE_THRESH = 50; // pixels minimum pour déclencher

    viewport.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    viewport.addEventListener('touchend', function (e) {
      if (touchStartX === null) return;
      var dx = e.changedTouches[0].clientX - touchStartX;
      var dy = e.changedTouches[0].clientY - touchStartY;
      // Ignorer si le scroll vertical est dominant
      if (Math.abs(dy) > Math.abs(dx)) { touchStartX = null; return; }
      if (dx < -SWIPE_THRESH) goTo(current + 1);
      else if (dx > SWIPE_THRESH) goTo(current - 1);
      touchStartX = null;
    }, { passive: true });

    /* ── Drag souris (desktop) ───────────────────────────────────────── */
    var mouseStartX = null;
    var isDragging  = false;

    viewport.addEventListener('mousedown', function (e) {
      mouseStartX = e.clientX;
      isDragging  = false;
      viewport.classList.add('perso-carousel__viewport--dragging');
    });

    window.addEventListener('mousemove', function (e) {
      if (mouseStartX === null) return;
      if (Math.abs(e.clientX - mouseStartX) > 5) isDragging = true;
    });

    window.addEventListener('mouseup', function (e) {
      if (mouseStartX === null) return;
      var dx = e.clientX - mouseStartX;
      if (isDragging) {
        if (dx < -SWIPE_THRESH) goTo(current + 1);
        else if (dx > SWIPE_THRESH) goTo(current - 1);
      }
      mouseStartX = null;
      isDragging  = false;
      viewport.classList.remove('perso-carousel__viewport--dragging');
    });

    // Éviter le drag des images
    track.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('dragstart', function (e) { e.preventDefault(); });
    });
  }

  /* ── Point d\'entrée principal ─────────────────────────────────────── */
  function init() {
    // Chercher le conteneur cible injecté dans index.html
    var target = document.getElementById('perso-carousel-container');
    if (!target) return; // Section absente, ne rien faire

    // Injecter le HTML du carrousel
    injectCarousel(target);

    // Initialiser la logique interactive
    initLogic();
  }

  /* ── Lancement après le DOM ─────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
