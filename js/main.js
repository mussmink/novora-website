(function () {
  var motionOk = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  root.classList.add('js-ready');
  if (motionOk) root.classList.add('motion-ok');

  var header = document.querySelector('header');
  var HEADER_OFFSET = 76;

  /* ---------- mobile nav toggle ---------- */
  var toggle = document.getElementById('menuToggle');
  var links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
      });
    });
  }

  /* ---------- smooth anchor scrolling with header-offset compensation ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var hash = a.getAttribute('href');
      if (!hash || hash.length < 2) return;
      var target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.pageYOffset - HEADER_OFFSET + 1;
      window.scrollTo({ top: top, behavior: motionOk ? 'smooth' : 'auto' });
      if (history.pushState) history.pushState(null, '', hash);
    });
  });

  /* ---------- header shadow on scroll ---------- */
  var lastScrolled = false;
  function onScrollHeader() {
    var scrolled = window.scrollY > 8;
    if (scrolled !== lastScrolled) {
      header.classList.toggle('scrolled', scrolled);
      lastScrolled = scrolled;
    }
  }
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* ---------- subtle hero grid parallax ---------- */
  var heroGrid = document.querySelector('.hero-grid');
  if (heroGrid && motionOk) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = Math.min(window.scrollY, 600) * 0.12;
        heroGrid.style.transform = 'translateY(' + y + 'px)';
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- blueprint "draw-in" stroke animation ---------- */
  function drawIn(svg) {
    if (!svg || svg.dataset.drawn) return;
    svg.dataset.drawn = 'true';
    var shapes = svg.querySelectorAll('rect, line, polygon, circle');
    shapes.forEach(function (shape, i) {
      if (shape.hasAttribute('stroke-dasharray')) return; // preserve intentional dashed guide lines
      try {
        var len = shape.getTotalLength();
        if (!len) return;
        shape.style.strokeDasharray = len;
        shape.style.strokeDashoffset = len;
        setTimeout(function () {
          shape.style.strokeDashoffset = 0;
        }, 40 + i * 70);
      } catch (err) {
        /* getTotalLength unsupported on this shape — leave it static */
      }
    });
  }

  if (motionOk) {
    var heroSvg = document.querySelector('.elevation svg.draw-in');
    window.addEventListener('load', function () {
      setTimeout(function () { drawIn(heroSvg); }, 250);
    });
  }

  /* ---------- interactive 3D house (hero) ---------- */
  (function initHouse3D() {
    var canvas = document.getElementById('house3d');
    var elevation = document.querySelector('.elevation');
    if (!canvas || !elevation || typeof THREE === 'undefined') return;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    } catch (err) {
      return; // no WebGL support — the 2D blueprint SVG stays visible
    }

    var styles = getComputedStyle(document.documentElement);
    var inkColor = styles.getPropertyValue('--ink-soft').trim() || '#888888';
    var accentColor = styles.getPropertyValue('--accent').trim() || '#c6551e';

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(4.5, 2.6, 7);
    camera.lookAt(0, 0, 0);

    // house silhouette (base + gable roof), extruded into a simple volume
    var shape = new THREE.Shape();
    shape.moveTo(-3, 0);
    shape.lineTo(3, 0);
    shape.lineTo(3, 2.6);
    shape.lineTo(0, 4.4);
    shape.lineTo(-3, 2.6);

    var depth = 4.5;
    var geometry = new THREE.ExtrudeGeometry(shape, { depth: depth, bevelEnabled: false });
    geometry.center();

    var houseGroup = new THREE.Group();

    houseGroup.add(new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0.05, side: THREE.DoubleSide })
    ));

    var wireframe = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry, 1),
      new THREE.LineBasicMaterial({ color: inkColor })
    );
    houseGroup.add(wireframe);

    // door + window line overlays on the near gable face
    var faceZ = depth / 2 + 0.04;
    var door = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(0.9, 1.7, 0.02)),
      new THREE.LineBasicMaterial({ color: accentColor })
    );
    door.position.set(0, -0.35, faceZ);
    houseGroup.add(door);

    [-1.7, 1.7].forEach(function (x) {
      var win = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(0.8, 0.8, 0.02)),
        new THREE.LineBasicMaterial({ color: inkColor })
      );
      win.position.set(x, 0.1, faceZ);
      houseGroup.add(win);
    });

    scene.add(houseGroup);

    var grid = new THREE.GridHelper(14, 14, inkColor, inkColor);
    grid.position.y = -2.2;
    grid.material.transparent = true;
    grid.material.opacity = 0.18;
    scene.add(grid);

    function resize() {
      var w = elevation.clientWidth;
      var h = elevation.clientHeight;
      if (!w || !h) return;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize);

    var dragging = false, lastX = 0;
    canvas.addEventListener('pointerdown', function (e) {
      dragging = true;
      lastX = e.clientX;
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      houseGroup.rotation.y += (e.clientX - lastX) * 0.01;
      lastX = e.clientX;
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (evt) {
      canvas.addEventListener(evt, function () { dragging = false; });
    });

    var inView = true;
    if ('IntersectionObserver' in window) {
      var heroSection = document.querySelector('.hero');
      if (heroSection) {
        new IntersectionObserver(function (entries) {
          inView = entries[0].isIntersecting;
        }, { threshold: 0.05 }).observe(heroSection);
      }
    }

    function animate() {
      requestAnimationFrame(animate);
      if (!inView) return;
      if (!dragging && motionOk) houseGroup.rotation.y += 0.0025;
      renderer.render(scene, camera);
    }
    animate();

    canvas.classList.add('active');
    elevation.classList.add('has-3d');
  })();

  /* ---------- scroll reveal + staggering + development draw-ins ---------- */
  var revealEls = document.querySelectorAll('.reveal, .stamp-in');
  if (motionOk && 'IntersectionObserver' in window) {
    revealEls.forEach(function (el) {
      var group = el.parentElement;
      var i = group ? Array.prototype.indexOf.call(group.children, el) : 0;
      el.style.setProperty('--i', i);
    });

    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        var innerSvg = entry.target.querySelector && entry.target.querySelector('svg.draw-in');
        if (innerSvg) drawIn(innerSvg);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- scope-of-work accordion ---------- */
  document.querySelectorAll('.schedule-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var row = btn.closest('.schedule-row');
      var open = row.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* ---------- development card details toggle ---------- */
  document.querySelectorAll('.dev-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = btn.closest('.dev-card');
      var open = card.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.textContent = (open ? '− ' : '+ ') + 'Details';
    });
  });

  /* ---------- active nav link tracking ---------- */
  var navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  var sections = Array.prototype.map.call(navLinks, function (a) {
    return document.querySelector(a.getAttribute('href'));
  }).filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = document.querySelector('.nav-links a[href="#' + entry.target.id + '"]');
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach(function (l) { l.classList.remove('active'); });
          link.classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ---------- inquiry form submission (Web3Forms) ---------- */
  var form = document.getElementById('inquiry-form');
  var status = document.getElementById('form-status');
  if (form && status) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var submitBtn = form.querySelector('button[type="submit"]');
      var formData = new FormData(form);

      submitBtn.disabled = true;
      status.textContent = 'Sending…';
      status.removeAttribute('data-state');

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData
      })
        .then(function (response) { return response.json(); })
        .then(function (result) {
          submitBtn.disabled = false;
          if (result.success) {
            status.textContent = "Thanks — your inquiry has been sent. We'll be in touch soon.";
            status.setAttribute('data-state', 'ok');
            form.reset();
          } else {
            status.textContent = 'Something went wrong sending that. Please try again.';
            status.setAttribute('data-state', 'error');
          }
        })
        .catch(function () {
          submitBtn.disabled = false;
          status.textContent = 'Something went wrong sending that. Please try again.';
          status.setAttribute('data-state', 'error');
        });
    });
  }
})();
