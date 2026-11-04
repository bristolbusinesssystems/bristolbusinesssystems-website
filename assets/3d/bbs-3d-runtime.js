/*! Shared runtime for the WebGL BBS logo variants: sizing, framing, battery-friendly loop, reduced motion.
 * Exposes window.BBS3D. Needs window.THREE (vendor/three.r170.min.js).
 */
(function (root) {
  'use strict';
  var TAU = Math.PI * 2;

  /* Eased turn: one full Y turn every `period` s, lingering slightly when the face is toward the viewer
     (speed x0.64 face-on, x1.36 edge-on) so the mark reads, and the thin edge passes quickly. */
  function turnAngle(t, period, k) {
    var w = TAU / period; k = k == null ? 0.18 : k;
    return w * t - k * Math.sin(2 * w * t);
  }

  /* Creates renderer + camera bound to `el`, frames a mark of size (mw, mh) world units.
     opts: align (0..1 horizontal position of the mark's centre in wide containers, default 0.74),
           fill (mark height as a fraction of the container height, default 0.66), fov (deg, default 24),
           transparent (default true: canvas has no background, the page/CSS shows through). */
  function stage(el, mw, mh, opts) {
    var THREE = root.THREE;
    opts = opts || {};
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: opts.transparent !== false, powerPreference: 'low-power' });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = opts.exposure || 1;
    var c = renderer.domElement;
    c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
    c.setAttribute('aria-hidden', 'true');
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.appendChild(c);

    var camera = new THREE.PerspectiveCamera(opts.fov || 24, 1, 1, 10000);
    var api = { renderer: renderer, camera: camera, width: 1, height: 1, dist: 1000 };

    api.resize = function () {
      var w = Math.max(1, el.clientWidth), h = Math.max(1, el.clientHeight);
      api.width = w; api.height = h;
      renderer.setPixelRatio(Math.min(root.devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);
      var aspect = w / h, fov = camera.fov * Math.PI / 180, fill = opts.fill || 0.66;
      // distance so the mark fills `fill` of the height, but never more than 62% of the width
      var maxW = opts.maxWidth || 0.62;
      var visH = Math.max(mh / fill, (mw / maxW) / aspect);
      api.dist = (visH / 2) / Math.tan(fov / 2);
      camera.aspect = aspect;
      camera.position.set(0, visH * 0.04, api.dist);
      camera.lookAt(0, 0, 0);
      camera.near = api.dist / 10; camera.far = api.dist * 10;
      // put the mark at `align` across wide containers (shift the view window, not the object => no skew)
      var align = aspect >= 1.25 ? (opts.align == null ? (w < 600 ? 0.79 : 0.74) : opts.align) : 0.5;
      var visW = visH * aspect, half = (mw * maxW) / visW;            // keep it inside the frame
      align = Math.min(Math.max(align, half + 0.04), 1 - half - 0.04);
      camera.setViewOffset(w, h, (0.5 - align) * w, 0, w, h);
      camera.updateProjectionMatrix();
    };

    /* Loop that only runs while the element is on screen and the tab is visible. tick(t, dt) gets
       "animation time" (seconds) that does not jump after a pause. reducedMotion => tick(null) once per resize. */
    api.run = function (tick, render) {
      var mq = root.matchMedia ? root.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
      // ?t=SECONDS freezes the animation at that moment (screenshots, poster frames, video export)
      var fixed = /[?&]t=([\d.]+)/.exec(root.location.search);
      if (fixed) {
        var ft = parseFloat(fixed[1]);
        var draw = function () { api.resize(); tick(ft, 0); render(); };
        if ('ResizeObserver' in root) new ResizeObserver(draw).observe(el); else root.addEventListener('resize', draw);
        draw(); api.stop = function () {};
        (root.__bbsRenderAt = root.__bbsRenderAt || []).push(function (t2) { tick(t2, 0); render(); });  // used by export_video.py
        return;
      }
      // opts.clock() => animation time comes from outside (e.g. scroll position): draw only when it
      // moves, easing toward it. The page calls api.kick() when the source changes (a scroll event).
      if (opts.clock) {
        var cur = opts.clock(), pend = 0;
        var step = function () {
          pend = 0;
          var want = opts.clock();
          cur += (want - cur) * 0.16;
          if (Math.abs(want - cur) < 0.003) cur = want;
          tick(mq.matches ? null : cur, 0); render();
          if (cur !== want && !mq.matches) pend = root.requestAnimationFrame(step);
        };
        api.kick = function () { if (!pend) pend = root.requestAnimationFrame(step); };
        if ('ResizeObserver' in root) new ResizeObserver(function () { api.resize(); tick(mq.matches ? null : cur, 0); render(); }).observe(el);
        else root.addEventListener('resize', function () { api.resize(); render(); });
        if (mq.addEventListener) mq.addEventListener('change', api.kick);
        api.resize(); tick(mq.matches ? null : cur, 0); render();
        api.stop = function () { if (pend) root.cancelAnimationFrame(pend); pend = 0; };
        return;
      }
      var onScreen = true, raf = 0, last = 0, t = opts.startTime || 0;
      function frame(now) {
        raf = 0;
        var dt = last ? Math.min((now - last) / 1000, 0.05) : 0; last = now;
        t += dt;
        tick(t, dt); render();
        schedule();
      }
      function schedule() {
        if (!raf && onScreen && !document.hidden && !mq.matches) raf = root.requestAnimationFrame(frame);
      }
      function stop() { if (raf) root.cancelAnimationFrame(raf); raf = 0; last = 0; }
      function still() { stop(); tick(null, 0); render(); }
      function refresh() { if (mq.matches) still(); else schedule(); }
      if ('IntersectionObserver' in root) {
        new IntersectionObserver(function (es) {
          onScreen = es[es.length - 1].isIntersecting;
          if (!onScreen) stop(); else refresh();
        }, { rootMargin: '80px' }).observe(el);
      }
      document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else refresh(); });
      if (mq.addEventListener) mq.addEventListener('change', refresh);
      var ro = 'ResizeObserver' in root ? new ResizeObserver(function () { api.resize(); if (mq.matches || !raf) { tick(mq.matches ? null : t, 0); render(); } }) : null;
      if (ro) ro.observe(el); else root.addEventListener('resize', function () { api.resize(); render(); });
      api.resize();
      tick(mq.matches ? null : t, 0); render();
      refresh();
      api.stop = stop;
    };
    return api;
  }

  /* Soft radial texture (canvas, no network): used for contact shadows and glows. */
  function radialTexture(size, stops) {
    var THREE = root.THREE, cv = document.createElement('canvas');
    cv.width = cv.height = size;
    var g = cv.getContext('2d'), gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    stops.forEach(function (s) { gr.addColorStop(s[0], s[1]); });
    g.fillStyle = gr; g.fillRect(0, 0, size, size);
    var tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace;
    return tx;
  }

  function shapeFrom(pts, holes) {
    var THREE = root.THREE, s = new THREE.Shape(pts.map(function (p) { return new THREE.Vector2(p[0], p[1]); }));
    (holes || []).forEach(function (h) {
      s.holes.push(new THREE.Path(h.slice().reverse().map(function (p) { return new THREE.Vector2(p[0], p[1]); })));
    });
    return s;
  }
  function circleShape(x, y, r, seg) {
    var THREE = root.THREE, s = new THREE.Shape();
    s.absarc(x, y, r, 0, TAU, false);
    return s;
  }

  root.BBS3D = { stage: stage, turnAngle: turnAngle, radialTexture: radialTexture, shapeFrom: shapeFrom, circleShape: circleShape, TAU: TAU };
})(window);
