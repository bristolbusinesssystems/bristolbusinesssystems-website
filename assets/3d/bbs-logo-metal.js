/*! BBS logo, variant 1 "Cast metal": satin/brushed gold tile with green enamel field, double-sided.
 * Usage: BBSLogoMetal.mount(element, { align: 0.74, period: 16, transparent: true })
 *   Scroll-driven: { clock: () => seconds, shadow: false, maxWidth: 0.9 } then call .kick() on scroll.
 * Needs: vendor/three.r170.min.js, src/bbs-mark.js, src/bbs-3d-runtime.js (classic scripts, in that order).
 */
(function (root) {
  'use strict';

  function brushedTexture(THREE) {
    // fine horizontal "brushed" streaks -> roughness map (canvas generated, no downloads)
    var W = 512, H = 512, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    var g = cv.getContext('2d'); g.fillStyle = 'rgb(128,128,128)'; g.fillRect(0, 0, W, H);
    var seed = 7; function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    for (var i = 0; i < 2600; i++) {
      var y = rnd() * H, v = 100 + rnd() * 70 | 0, a = 0.25 + rnd() * 0.5;
      g.fillStyle = 'rgba(' + v + ',' + v + ',' + v + ',' + a + ')';
      var x = rnd() * W, len = 60 + rnd() * 420;
      g.fillRect(x, y, len, 0.6 + rnd() * 0.9); g.fillRect(x - W, y, len, 1);
    }
    var t = new THREE.CanvasTexture(cv);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / 140, 1 / 140); t.anisotropy = 4;
    return t;
  }

  function mount(el, opts) {
    var THREE = root.THREE, M = root.BBSMark, K = root.BBS3D;
    opts = opts || {};
    var S = 0.01;                                      // mark units (px) -> world units
    var st = K.stage(el, M.W * S * 1.08, M.H * S * 1.08, { align: opts.align, fill: opts.fill || 0.6, maxWidth: opts.maxWidth, clock: opts.clock, fov: 22, transparent: opts.transparent, exposure: 1.0, startTime: opts.startTime == null ? 1.4 : opts.startTime });
    var renderer = st.renderer, camera = st.camera, scene = new THREE.Scene();

    var pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new THREE.RoomEnvironment(), 0.035).texture;
    scene.environmentIntensity = 1.1;
    pmrem.dispose();

    var brush = brushedTexture(THREE);
    var gold = new THREE.MeshPhysicalMaterial({
      color: 0xe8cc94, metalness: 1, roughness: 0.27, roughnessMap: brush,
      anisotropy: 0.55, anisotropyRotation: 0, clearcoat: 0.25, clearcoatRoughness: 0.35
    });
    var goldEdge = new THREE.MeshPhysicalMaterial({ color: 0xd7b77c, metalness: 1, roughness: 0.42, roughnessMap: brush });
    var enamel = new THREE.MeshPhysicalMaterial({
      color: 0x0f4a2e, metalness: 0, roughness: 0.55, clearcoat: 0.7, clearcoatRoughness: 0.08, envMapIntensity: 0.4
    });

    var P = M.parts(0, 1.5), Pin = M.parts(0.5, 1.5);
    var logo = new THREE.Group(), face = new THREE.Group();

    // base tile
    var plate = new THREE.ExtrudeGeometry(K.shapeFrom(M.parts(3, 1.5).plate), {
      depth: 14, bevelEnabled: true, bevelThickness: 3, bevelSize: 3, bevelSegments: 5, curveSegments: 18
    });
    plate.translate(0, 0, -7);
    logo.add(new THREE.Mesh(plate, [goldEdge, goldEdge]));
    var faceZ = 10;                                   // plate front face (7 + bevel 3)

    // green enamel field, just proud of the plate face
    var field = new THREE.ExtrudeGeometry(K.shapeFrom(P.field), { depth: 1.2, bevelEnabled: false, curveSegments: 18 });
    field.translate(0, 0, faceZ - 0.2);
    face.add(new THREE.Mesh(field, enamel));

    // raised gold frame + circuit
    var raise = { depth: 7, bevelEnabled: true, bevelThickness: 1.8, bevelSize: 1.1, bevelSegments: 4, curveSegments: 18 };
    var shapes = [K.shapeFrom(Pin.frameOuter, [Pin.frameInner])];
    Pin.strokes.forEach(function (s) { shapes.push(K.shapeFrom(s)); });
    var raised = new THREE.ExtrudeGeometry(shapes, raise);
    raised.translate(0, 0, faceZ - 1);
    face.add(new THREE.Mesh(raised, gold));
    var dotShapes = Pin.dots.map(function (d) { return K.circleShape(d.x, d.y, d.r); });
    var dots = new THREE.ExtrudeGeometry(dotShapes, { depth: 8.5, bevelEnabled: true, bevelThickness: 2.6, bevelSize: 1.2, bevelSegments: 5, curveSegments: 28 });
    dots.translate(0, 0, faceZ - 1);
    face.add(new THREE.Mesh(dots, gold));

    logo.add(face);
    var back = face.clone(); back.scale.z = -1;       // the mark is left/right symmetric, so it reads correctly from behind
    logo.add(back);
    logo.scale.setScalar(S);
    var pivot = new THREE.Group(); pivot.add(logo); scene.add(pivot);

    // soft studio key + cool rim; env does most of the work
    var key = new THREE.DirectionalLight(0xfff3dc, 2.2); key.position.set(-3, 4, 5); scene.add(key);
    var rim = new THREE.DirectionalLight(0xbfe8d2, 1.1); rim.position.set(4, 1.5, -3); scene.add(rim);
    var fillL = new THREE.DirectionalLight(0xffffff, 0.35); fillL.position.set(2, -3, 4); scene.add(fillL);

    // contact shadow (soft ellipse below the floating tile)
    var shTex = K.radialTexture(128, [[0, 'rgba(0,0,0,0.55)'], [0.45, 'rgba(0,0,0,0.22)'], [1, 'rgba(0,0,0,0)']]);
    var shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false, toneMapped: false }));
    shadow.position.set(0, -M.H * S * 0.5 - 0.42, -0.2);
    scene.add(shadow);

    var period = opts.period || 16;
    function tick(t) {
      var still = t == null, a, tilt, fl, roll;
      if (still) { a = -0.62; tilt = -0.09; fl = 0; roll = 0.0; }
      else {
        a = K.turnAngle(t, period, 0.18);
        tilt = -0.085 + 0.035 * Math.sin(K.TAU * t / (period / 2));
        fl = 0.06 * Math.sin(K.TAU * t / (period / 3));
        roll = 0.018 * Math.sin(K.TAU * t / period);
      }
      pivot.rotation.set(tilt, a, roll);
      pivot.position.y = fl;
      var span = Math.abs(Math.cos(a)) * M.W * S + Math.abs(Math.sin(a)) * 0.3;
      shadow.scale.set(span * 1.05 + 0.25, 0.32, 1);
      shadow.material.opacity = 0.85 - fl * 2.2;
    }
    if (opts.shadow === false) shadow.visible = false;
    st.run(tick, function () { renderer.render(scene, camera); });
    return st;
  }

  root.BBSLogoMetal = { mount: mount };
})(window);
