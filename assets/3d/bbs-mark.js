/*! BBS mark geometry (Bristol Business Systems "circuit X").
 * Measured from brand assets/Bristol Business Systems Logo.png (331x343 px; mark bbox 286x300 px).
 * Units = PNG pixels, origin at the centre of the frame, y UP. The mark is ~286 wide x 300 tall.
 * Exposes window.BBSMark. No dependencies. Used by the WebGL variants (metal, glass) and to generate the flat SVG.
 */
(function (root) {
  'use strict';
  var M = {
    W: 286, H: 300,                 // outer frame size
    frame: { r: 36, t: 19 },        // outer corner radius, stroke thickness (inner radius = 17)
    line: { w: 19, topEnd: 42, botEnd: -46 },  // centre vertical bar; round-capped ends (cap centres)
    cross: { x: 0, y: -2 },         // where the two S-strokes cross
    dot: { r: 18.5, dx: 72, dy: 68.5 },        // terminal dots, offset from the crossing
    stroke: { w: 18.5 }             // S-stroke thickness
  };

  function roundedRect(hw, hh, r, seg) {
    seg = seg || 10;
    var pts = [], cs = [[hw - r, hh - r, 0], [-hw + r, hh - r, 90], [-hw + r, -hh + r, 180], [hw - r, -hh + r, 270]];
    for (var c = 0; c < 4; c++) {
      for (var i = 0; i <= seg; i++) {
        var a = (cs[c][2] + 90 * i / seg) * Math.PI / 180;
        pts.push([cs[c][0] + r * Math.cos(a), cs[c][1] + r * Math.sin(a)]);
      }
    }
    return pts; // CCW
  }

  function cubic(p0, p1, p2, p3, n, out) {
    for (var i = (out.length ? 1 : 0); i <= n; i++) {
      var t = i / n, u = 1 - t;
      out.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
                u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]);
    }
    return out;
  }

  // One S-stroke centreline from the top-left dot through the crossing to the bottom-right dot (sx=-1 mirrors it).
  function sCurve(sx, n) {
    var c = M.cross, d = M.dot, P = [];
    var a0 = [c.x - d.dx, c.y + d.dy], a1 = [c.x - d.dx, c.y + d.dy - 30],
        a2 = [c.x - 22, c.y + 21], a3 = [c.x, c.y];
    cubic(a0, a1, a2, a3, n, P);
    cubic(a3, [2 * c.x - a2[0], 2 * c.y - a2[1]], [2 * c.x - a1[0], 2 * c.y - a1[1]], [2 * c.x - a0[0], 2 * c.y - a0[1]], n, P);
    return P.map(function (p) { return [p[0] * sx, p[1]]; });
  }

  // Closed outline of a polyline stroked with half-width hw and round caps (CCW).
  function strokeOutline(P, hw, capSeg) {
    capSeg = capSeg || 10;
    var L = [], R = [], n = P.length;
    for (var i = 0; i < n; i++) {
      var a = P[Math.max(0, i - 1)], b = P[Math.min(n - 1, i + 1)];
      var dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
      var nx = -dy / len, ny = dx / len;
      L.push([P[i][0] + nx * hw, P[i][1] + ny * hw]);
      R.push([P[i][0] - nx * hw, P[i][1] - ny * hw]);
    }
    function cap(p, from) { // half circle around p from angle 'from' sweeping +180deg
      var out = [];
      for (var k = 1; k < capSeg; k++) {
        var ang = from + Math.PI * k / capSeg;
        out.push([p[0] + hw * Math.cos(ang), p[1] + hw * Math.sin(ang)]);
      }
      return out;
    }
    var e = P[n - 1], s = P[0];
    var angEnd = Math.atan2(L[n - 1][1] - e[1], L[n - 1][0] - e[0]);
    var angStart = Math.atan2(R[0][1] - s[1], R[0][0] - s[0]);
    // walk: right side forward, end cap, left side backward, start cap
    var outl = R.slice();
    outl = outl.concat(cap(e, angEnd + Math.PI));
    outl = outl.concat(L.slice().reverse());
    outl = outl.concat(cap(s, angStart + Math.PI));
    // ensure CCW
    var area = 0;
    for (var j = 0; j < outl.length; j++) { var p = outl[j], q = outl[(j + 1) % outl.length]; area += p[0] * q[1] - q[0] * p[1]; }
    if (area < 0) outl.reverse();
    return outl;
  }

  /* All parts of the mark. inset shrinks every part by that many units (to compensate a 3D bevel that grows it). */
  function parts(inset, quality) {
    inset = inset || 0; var q = quality || 1;
    var hw = M.W / 2, hh = M.H / 2, f = M.frame;
    var lineTop = [[0, hh - f.t / 2], [0, M.line.topEnd]], lineBot = [[0, M.line.botEnd], [0, -hh + f.t / 2]];
    return {
      plate: roundedRect(hw - inset, hh - inset, f.r - inset, 12 * q),
      frameOuter: roundedRect(hw - inset, hh - inset, f.r - inset, 12 * q),
      frameInner: roundedRect(hw - f.t + inset, hh - f.t + inset, f.r - f.t + inset, 10 * q),
      field: roundedRect(hw - f.t, hh - f.t, f.r - f.t, 10 * q),
      strokes: [
        strokeOutline(sCurve(1, 28 * q), M.stroke.w / 2 - inset, 10 * q),
        strokeOutline(sCurve(-1, 28 * q), M.stroke.w / 2 - inset, 10 * q),
        strokeOutline(lineTop, M.line.w / 2 - inset, 10 * q),
        strokeOutline(lineBot, M.line.w / 2 - inset, 10 * q)
      ],
      dots: [[-1, 1], [1, 1], [-1, -1], [1, -1]].map(function (s) {
        return { x: M.cross.x + s[0] * M.dot.dx, y: M.cross.y + s[1] * M.dot.dy, r: M.dot.r - inset };
      }),
      centrelines: { s1: sCurve(1, 28), s2: sCurve(-1, 28), top: lineTop, bot: lineBot }
    };
  }

  /* Flat SVG path data (y flipped to SVG's y-down), viewBox "-143 -150 286 300". */
  function svgPaths() {
    var p = parts(0, 1);
    function d(pts) { return 'M' + pts.map(function (v) { return v[0].toFixed(1) + ' ' + (-v[1]).toFixed(1); }).join('L') + 'Z'; }
    function circle(c) { return 'M' + (c.x - c.r).toFixed(1) + ' ' + (-c.y).toFixed(1) + 'a' + c.r + ' ' + c.r + ' 0 1 0 ' + (2 * c.r) + ' 0a' + c.r + ' ' + c.r + ' 0 1 0 ' + (-2 * c.r) + ' 0Z'; }
    return {
      frame: d(p.frameOuter) + d(p.frameInner.slice().reverse()),
      field: d(p.field),
      circuit: p.strokes.map(d).join('') + p.dots.map(circle).join('')
    };
  }

  M.roundedRect = roundedRect; M.strokeOutline = strokeOutline; M.parts = parts; M.svgPaths = svgPaths;
  root.BBSMark = M;
})(typeof window !== 'undefined' ? window : globalThis);
