/* ===================================================
   FLANGED BEARING HOUSING – MECHANICAL DRAWING ENGINE
   Three-view orthographic projection (1st Angle)
   Front View · Top View · Side View
   ISO/ASME dimensioning standards
   =================================================== */

(function () {
  "use strict";

  /* ── CANVAS ─────────────────────────────────────── */
  const canvas = document.getElementById("mechCanvas");
  const ctx    = canvas.getContext("2d");

  // Sheet size: A2 landscape in px at 96dpi equivalent
  const SW = 1060;
  const SH = 760;
  canvas.width  = SW;
  canvas.height = SH;

  /* ── STATE ──────────────────────────────────────── */
  let showDims   = true;
  let showHidden = true;
  let activeView = "all";

  /* ── COLOURS (drawing on white paper) ──────────── */
  const C = {
    paper:   "#f5f2eb",
    line:    "#0d0d1a",      // visible edges (thick)
    lineThin:"#0d0d1a",      // thin lines
    hidden:  "#8b4513",      // hidden lines (dashed)
    center:  "#006400",      // centre lines (chain dash)
    dim:     "#00008b",      // dimension lines
    dimText: "#00008b",
    cut:     "#cc0000",      // section / cutting plane
    hatching:"rgba(13,13,26,0.25)",
    border:  "#0d0d1a",
    title:   "#0d0d1a",
    accent:  "#cc3300",
    phantom: "#888",
  };

  const LW = {
    thick:  2.5,   // visible outlines
    medium: 1.2,   // features
    thin:   0.6,   // dim lines, centre
    ghost:  0.4,
  };

  /* ── PART DIMENSIONS (all in mm → px at 1:2 scale) */
  // 1 mm = 2.5 px
  const MM = 2.5;
  const d  = {
    L:   160,   // housing length
    OD:  120,   // housing OD
    ID:   80,   // bore ID
    flangeOD: 180,
    flangeT:   20,
    wallT:     20,
    boltPCD:  150,
    boltHole:  12,
    nBolts:     4,
    keyW:      22,
    keyD:       9,
    oilPort:   10,
    chamfer:    2,
  };

  /* ── LAYOUT: view origins (in px on canvas) ─────── */
  // Front view center
  const FX = 330, FY = 390;
  // Top view center (above front)
  const TX = 330, TY = 145;
  // Side view center (right of front, 1st angle: right of front = left side view)
  const SX = 790, SY = 390;
  // Padding around views
  const PAD = 50;

  /* ── UTILITIES ──────────────────────────────────── */
  const p  = v => v * MM;   // mm to px

  function setLine(color, lw, dash = []) {
    ctx.strokeStyle = color;
    ctx.lineWidth   = lw;
    ctx.setLineDash(dash);
  }

  function line(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  function rect(x, y, w, h, fill, stroke, lw) {
    if (fill)   { ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth   = lw || LW.thick;
      ctx.strokeRect(x, y, w, h);
    }
  }

  function circle(cx, cy, r, fill, stroke, lw) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    if (fill)   { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || LW.thick; ctx.stroke(); }
  }

  function hatch(x, y, w, h, angle = 45) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.strokeStyle = C.hatching;
    ctx.lineWidth   = 0.6;
    const step = 6;
    for (let i = -(w + h); i < w + h + h; i += step) {
      ctx.beginPath();
      if (angle === 45) {
        ctx.moveTo(x + i, y);
        ctx.lineTo(x + i + h, y + h);
      } else {
        ctx.moveTo(x + i, y + h);
        ctx.lineTo(x + i + h, y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  /* ── DIMENSION LINE ENGINE ──────────────────────── */
  function dimH(x1, x2, y, labelText, offset = 0, arrowSize = 6) {
    if (!showDims) return;
    const yo = y - offset;
    ctx.save();
    setLine(C.dim, LW.thin);
    // witness
    line(x1, yo - 3, x1, y + 3);
    line(x2, yo - 3, x2, y + 3);
    // dim line
    line(x1, yo, x2, yo);
    // arrows
    drawArrowH(x1, yo, "right", arrowSize);
    drawArrowH(x2, yo, "left",  arrowSize);
    // label
    const mx = (x1 + x2) / 2;
    ctx.fillStyle = C.bg;
    const tw = ctx.measureText(labelText).width + 6;
    ctx.fillStyle = C.paper;
    ctx.fillRect(mx - tw / 2, yo - 7, tw, 14);
    ctx.font      = "bold 8.5px 'IBM Plex Mono', monospace";
    ctx.fillStyle = C.dimText;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(labelText, mx, yo);
    ctx.restore();
  }

  function dimV(x, y1, y2, labelText, offset = 0, arrowSize = 6) {
    if (!showDims) return;
    const xo = x - offset;
    ctx.save();
    setLine(C.dim, LW.thin);
    line(xo - 3, y1, x + 3, y1);
    line(xo - 3, y2, x + 3, y2);
    line(xo, y1, xo, y2);
    drawArrowV(xo, y1, "down", arrowSize);
    drawArrowV(xo, y2, "up",   arrowSize);
    const my = (y1 + y2) / 2;
    ctx.save();
    ctx.translate(xo, my);
    ctx.rotate(-Math.PI / 2);
    const tw = ctx.measureText(labelText).width + 6;
    ctx.fillStyle = C.paper;
    ctx.fillRect(-tw / 2, -7, tw, 14);
    ctx.font      = "bold 8.5px 'IBM Plex Mono', monospace";
    ctx.fillStyle = C.dimText;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(labelText, 0, 0);
    ctx.restore();
    ctx.restore();
  }

  function dimDia(cx, cy, r, angle, labelText, leaderLen = 30) {
    if (!showDims) return;
    ctx.save();
    const rad  = (angle * Math.PI) / 180;
    const ex   = cx + (r + leaderLen) * Math.cos(rad);
    const ey   = cy + (r + leaderLen) * Math.sin(rad);
    const ex2  = cx - (r + 4) * Math.cos(rad);
    const ey2  = cy - (r + 4) * Math.sin(rad);
    setLine(C.dim, LW.thin);
    line(cx + r * Math.cos(rad), cy + r * Math.sin(rad), ex, ey);
    line(cx - r * Math.cos(rad), cy - r * Math.sin(rad), ex2, ey2);
    // arrow on circle
    const ax = cx + r * Math.cos(rad), ay = cy + r * Math.sin(rad);
    ctx.fillStyle = C.dim;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(ax - 6 * Math.cos(rad) + 2.5 * Math.sin(rad), ay - 6 * Math.sin(rad) - 2.5 * Math.cos(rad));
    ctx.lineTo(ax - 6 * Math.cos(rad) - 2.5 * Math.sin(rad), ay - 6 * Math.sin(rad) + 2.5 * Math.cos(rad));
    ctx.fill();
    // label
    const lx = ex + (angle > 90 && angle < 270 ? -5 : 5);
    ctx.font      = "bold 8.5px 'IBM Plex Mono', monospace";
    ctx.fillStyle = C.dimText;
    ctx.textAlign = angle > 90 && angle < 270 ? "right" : "left";
    ctx.textBaseline = "middle";
    ctx.fillText(labelText, lx, ey);
    ctx.restore();
  }

  function drawArrowH(x, y, dir, s = 6) {
    ctx.fillStyle = C.dim;
    ctx.beginPath();
    if (dir === "right") {
      ctx.moveTo(x, y); ctx.lineTo(x + s, y - s * 0.35); ctx.lineTo(x + s, y + s * 0.35);
    } else {
      ctx.moveTo(x, y); ctx.lineTo(x - s, y - s * 0.35); ctx.lineTo(x - s, y + s * 0.35);
    }
    ctx.closePath(); ctx.fill();
  }

  function drawArrowV(x, y, dir, s = 6) {
    ctx.fillStyle = C.dim;
    ctx.beginPath();
    if (dir === "down") {
      ctx.moveTo(x, y); ctx.lineTo(x - s * 0.35, y + s); ctx.lineTo(x + s * 0.35, y + s);
    } else {
      ctx.moveTo(x, y); ctx.lineTo(x - s * 0.35, y - s); ctx.lineTo(x + s * 0.35, y - s);
    }
    ctx.closePath(); ctx.fill();
  }

  function centreLines(cx, cy, r, len) {
    const ext = r + 12;
    setLine(C.center, LW.thin, [8, 3, 2, 3]);
    line(cx - ext, cy, cx + ext, cy);
    line(cx, cy - ext, cx, cy + ext);
    ctx.setLineDash([]);
  }

  function centreLinesRect(cx, cy, w, h) {
    const ex = w / 2 + 12, ey = h / 2 + 12;
    setLine(C.center, LW.thin, [8, 3, 2, 3]);
    line(cx - ex, cy, cx + ex, cy);
    line(cx, cy - ey, cx, cy + ey);
    ctx.setLineDash([]);
  }

  function leader(x1, y1, x2, y2, x3, y3, label) {
    ctx.save();
    setLine(C.dim, LW.thin);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    if (x3 !== undefined) ctx.lineTo(x3, y3);
    ctx.stroke();
    // arrowhead at x1,y1
    const ang = Math.atan2(y2 - y1, x2 - x1);
    ctx.fillStyle = C.dim;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 + 7 * Math.cos(ang + 0.35), y1 + 7 * Math.sin(ang + 0.35));
    ctx.lineTo(x1 + 7 * Math.cos(ang - 0.35), y1 + 7 * Math.sin(ang - 0.35));
    ctx.closePath(); ctx.fill();
    if (label) {
      ctx.font = "bold 8px 'IBM Plex Mono', monospace";
      ctx.fillStyle = C.dimText;
      ctx.textAlign = x3 !== undefined ? (x3 > x2 ? "left" : "right") : "left";
      ctx.textBaseline = "bottom";
      ctx.fillText(label, (x3 || x2) + 3, (y3 || y2) - 2);
    }
    ctx.restore();
  }

  /* ── FRONT VIEW ─────────────────────────────────── */
  function drawFrontView() {
    const cx = FX, cy = FY;
    const hw = p(d.L) / 2;       // half length = 200px
    const hr = p(d.OD) / 2;      // half OD = 150px
    const br = p(d.ID) / 2;      // bore radius = 100px
    const fR = p(d.flangeOD) / 2;
    const fT = p(d.flangeT);
    const bpR = p(d.boltPCD) / 2;
    const bhR = p(d.boltHole) / 2;
    const kwH = p(d.keyW) / 2;
    const kwD = p(d.keyD);
    const chamf = p(d.chamfer);

    // Label
    ctx.save();
    ctx.font = "bold 9px 'IBM Plex Mono', monospace";
    ctx.fillStyle = C.title;
    ctx.textAlign = "center";
    ctx.fillText("FRONT VIEW", cx, cy + hr + 55);
    ctx.restore();

    // ── BODY OUTLINE ───────────────────────────────
    setLine(C.line, LW.thick);
    ctx.beginPath();
    ctx.rect(cx - hw, cy - hr, hw * 2, hr * 2);
    ctx.stroke();
    ctx.fillStyle = "#ede9df";
    ctx.fillRect(cx - hw, cy - hr, hw * 2, hr * 2);

    // Hatching for solid walls (top & bottom strips — cross section feel)
    hatch(cx - hw, cy - hr, hw * 2, p(d.wallT));
    hatch(cx - hw, cy + hr - p(d.wallT), hw * 2, p(d.wallT));

    // ── BORE HOLE (center) ─────────────────────────
    if (showHidden) {
      setLine(C.hidden, LW.medium, [8, 4]);
      ctx.beginPath();
      ctx.rect(cx - hw, cy - br, hw * 2, br * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // ── FLANGE (left end) ──────────────────────────
    setLine(C.line, LW.thick);
    ctx.strokeRect(cx - hw - fT, cy - fR, fT, fR * 2);
    ctx.fillStyle = "#e0dbd0";
    ctx.fillRect(cx - hw - fT, cy - fR, fT, fR * 2);
    hatch(cx - hw - fT, cy - fR, fT, fR * 2);

    // Bolt holes on flange (4 holes: top, bottom, front implied)
    const bAngles = [90, 270, 0, 180]; // degrees
    // In front view only top & bottom visible
    // top bolt hole
    setLine(C.line, LW.medium);
    circle(cx - hw - fT / 2, cy - bpR, bhR, "#f5f2eb", C.line, LW.medium);
    centreLines(cx - hw - fT / 2, cy - bpR, bhR, bhR);
    // bottom bolt hole
    circle(cx - hw - fT / 2, cy + bpR, bhR, "#f5f2eb", C.line, LW.medium);
    centreLines(cx - hw - fT / 2, cy + bpR, bhR, bhR);
    // left & right bolt holes (hidden)
    if (showHidden) {
      setLine(C.hidden, LW.thin, [6, 3]);
      line(cx - hw - fT, cy - bhR, cx - hw, cy - bhR);
      line(cx - hw - fT, cy + bhR, cx - hw, cy + bhR);
      ctx.setLineDash([]);
    }

    // ── KEYWAY ─────────────────────────────────────
    // At top of bore, right-hand side of housing
    setLine(C.line, LW.medium);
    ctx.strokeRect(cx + hw * 0.3 - kwH, cy - br - kwD, kwH * 2, kwD);
    if (showHidden) {
      setLine(C.hidden, LW.thin, [6, 3]);
      ctx.strokeRect(cx + hw * 0.3 - kwH, cy - br - kwD, kwH * 2, kwD);
      ctx.setLineDash([]);
    }
    // Keyway solid lines
    setLine(C.line, LW.medium);
    ctx.beginPath();
    ctx.moveTo(cx + hw * 0.3 - kwH, cy - br);
    ctx.lineTo(cx + hw * 0.3 - kwH, cy - br - kwD);
    ctx.lineTo(cx + hw * 0.3 + kwH, cy - br - kwD);
    ctx.lineTo(cx + hw * 0.3 + kwH, cy - br);
    ctx.stroke();

    // ── OIL PORT ───────────────────────────────────
    // Top of housing, near center
    const opR = p(d.oilPort) / 2;
    setLine(C.line, LW.medium);
    ctx.beginPath();
    ctx.moveTo(cx - opR, cy - hr);
    ctx.lineTo(cx - opR, cy - hr + p(30));
    ctx.lineTo(cx + opR, cy - hr + p(30));
    ctx.lineTo(cx + opR, cy - hr);
    ctx.stroke();
    if (showHidden) {
      setLine(C.hidden, LW.thin, [4, 3]);
      line(cx, cy - hr, cx, cy - br);
      ctx.setLineDash([]);
    }

    // ── CHAMFERS ───────────────────────────────────
    setLine(C.line, LW.medium);
    // bore chamfers (both ends)
    line(cx - hw, cy - br, cx - hw + chamf, cy - br - chamf);
    line(cx - hw, cy + br, cx - hw + chamf, cy + br + chamf);
    line(cx + hw, cy - br, cx + hw - chamf, cy - br - chamf);
    line(cx + hw, cy + br, cx + hw - chamf, cy + br + chamf);

    // ── CENTRE LINES ───────────────────────────────
    centreLinesRect(cx, cy, hw * 2, hr * 2);

    // ── DIMENSIONS ─────────────────────────────────
    // Overall length
    dimH(cx - hw, cx + hw, cy + hr + 18, `${d.L}`, 0);
    // Flange thickness
    dimH(cx - hw - fT, cx - hw, cy + fR + 18, `${d.flangeT}`, 0);
    // OD (right side)
    dimV(cx + hw + 30, cy - hr, cy + hr, `Ø${d.OD}`, 0);
    // Bore ID
    dimV(cx + hw + 48, cy - br, cy + br, `Ø${d.ID} H7`, 0);
    // Flange OD
    dimV(cx - hw - fT - 30, cy - fR, cy + fR, `Ø${d.flangeOD}`, 0);
    // Bolt PCD
    dimV(cx - hw - fT - 48, cy - bpR, cy + bpR, `Ø${d.boltPCD} PCD`, 0);
    // Keyway dims
    dimH(cx + hw * 0.3 - kwH, cx + hw * 0.3 + kwH, cy - br - kwD - 14, `${d.keyW}`, 0);
    dimV(cx + hw * 0.3 + kwH + 16, cy - br - kwD, cy - br, `${d.keyD}`, 0);

    // Leaders
    leader(cx, cy - hr + p(15), cx + 40, cy - hr - 20, cx + 75, cy - hr - 20, "OIL PORT Ø10");
    leader(cx + hw * 0.3, cy - br - kwD / 2, cx + hw * 0.3 + 35, cy - br - kwD - 25, cx + hw * 0.3 + 70, cy - br - kwD - 25, "KEYWAY 22×9");
    leader(cx - hw + chamf / 2, cy - br - chamf / 2, cx - hw - 20, cy - br - 20, undefined, undefined, "CHMF 2×45°");

    // View box border
    setLine(C.border, 0.5, []);
  }

  /* ── TOP VIEW ───────────────────────────────────── */
  function drawTopView() {
    const cx = TX, cy = TY;
    const hw = p(d.L) / 2;
    const hr = p(d.OD) / 2;        // half-width = OD/2
    const fR = p(d.flangeOD) / 2;
    const fT = p(d.flangeT);
    const bpR = p(d.boltPCD) / 2;
    const bhR = p(d.boltHole) / 2;
    const kwH = p(d.keyW) / 2;
    const kwD = p(d.keyD);
    const opR = p(d.oilPort) / 2;

    // Label
    ctx.save();
    ctx.font = "bold 9px 'IBM Plex Mono', monospace";
    ctx.fillStyle = C.title;
    ctx.textAlign = "center";
    ctx.fillText("TOP VIEW", cx, cy + hr + 30);
    ctx.restore();

    // ── BODY PLAN (rectangle — looking from above) ──
    setLine(C.line, LW.thick);
    ctx.fillStyle = "#ede9df";
    ctx.fillRect(cx - hw, cy - hr, hw * 2, hr * 2);
    ctx.strokeRect(cx - hw, cy - hr, hw * 2, hr * 2);

    // Bore outline (hidden) — rectangle in top view
    if (showHidden) {
      setLine(C.hidden, LW.medium, [8, 4]);
      ctx.strokeRect(cx - hw, cy - p(d.ID) / 2, hw * 2, p(d.ID));
      ctx.setLineDash([]);
    }

    // ── FLANGE ─────────────────────────────────────
    setLine(C.line, LW.thick);
    ctx.fillStyle = "#e0dbd0";
    ctx.fillRect(cx - hw - fT, cy - fR, fT, fR * 2);
    ctx.strokeRect(cx - hw - fT, cy - fR, fT, fR * 2);

    // all 4 bolt holes in top view
    const bPositions = [
      [cx - hw - fT / 2, cy - bpR],  // top
      [cx - hw - fT / 2, cy + bpR],  // bottom
    ];
    bPositions.forEach(([bx, by]) => {
      circle(bx, by, bhR, "#f5f2eb", C.line, LW.medium);
      centreLines(bx, by, bhR, 6);
    });
    // Left/Right bolt holes as hidden rectangles in top view
    if (showHidden) {
      setLine(C.hidden, LW.thin, [5, 3]);
      // The left/right bolts appear as elongated hidden dash segments
      line(cx - hw - fT, cy, cx - hw, cy);
      ctx.setLineDash([]);
    }

    // ── KEYWAY (visible from top) ───────────────────
    setLine(C.line, LW.thick);
    ctx.fillStyle = "#f5f2eb";
    ctx.fillRect(cx + hw * 0.3 - kwH, cy - p(d.ID) / 2 - kwD, kwH * 2, kwD);
    ctx.strokeRect(cx + hw * 0.3 - kwH, cy - p(d.ID) / 2 - kwD, kwH * 2, kwD);

    // ── OIL PORT (circle from top — centre-drilled) ─
    setLine(C.line, LW.medium);
    circle(cx, cy, p(d.oilPort) / 2, "#f5f2eb", C.line, LW.medium);
    centreLines(cx, cy, p(d.oilPort) / 2, p(d.oilPort));

    // ── CENTRE LINES ───────────────────────────────
    centreLinesRect(cx, cy, hw * 2, hr * 2);

    // ── DIMENSIONS ─────────────────────────────────
    dimH(cx - hw, cx + hw, cy + hr + 14, `${d.L}`, 0);
    dimH(cx - hw - fT, cx - hw, cy + fR + 14, `${d.flangeT}`, 0);
    dimV(cx + hw + 22, cy - hr, cy + hr, `${d.OD}`, 0);
    dimV(cx + hw + 40, cy - fR, cy + fR, `Ø${d.flangeOD}`, 0);
    dimH(cx - hw - fT / 2 - bpR, cx - hw - fT / 2 + bpR, cy - fR - 18, `Ø${d.boltPCD} PCD`, 0);
  }

  /* ── SIDE VIEW ──────────────────────────────────── */
  function drawSideView() {
    const cx = SX, cy = SY;
    const fR  = p(d.flangeOD) / 2;
    const hr  = p(d.OD) / 2;
    const br  = p(d.ID) / 2;
    const bpR = p(d.boltPCD) / 2;
    const bhR = p(d.boltHole) / 2;
    const fT  = p(d.flangeT);
    const kwH = p(d.keyW) / 2;
    const kwD = p(d.keyD);

    // Label
    ctx.save();
    ctx.font = "bold 9px 'IBM Plex Mono', monospace";
    ctx.fillStyle = C.title;
    ctx.textAlign = "center";
    ctx.fillText("LEFT SIDE VIEW", cx, cy + fR + 30);
    ctx.restore();

    // ── FLANGE CIRCLE ──────────────────────────────
    setLine(C.line, LW.thick);
    circle(cx, cy, fR, "#e0dbd0", C.line, LW.thick);

    // Housing circle (inside flange)
    circle(cx, cy, hr, "#ede9df", C.line, LW.thick);

    // Bore circle
    circle(cx, cy, br, "#f5f2eb", C.line, LW.medium);

    // ── BOLT HOLES (4 × equally spaced) ─────────── 
    const bAngles45 = [45, 135, 225, 315];
    bAngles45.forEach(ang => {
      const rad = (ang * Math.PI) / 180;
      const bx  = cx + bpR * Math.cos(rad);
      const by  = cy + bpR * Math.sin(rad);
      circle(bx, by, bhR, "#f5f2eb", C.line, LW.medium);
      centreLines(bx, by, bhR, bhR * 0.5);
    });

    // Bolt PCD circle (thin)
    setLine(C.center, LW.thin, [8, 3, 2, 3]);
    ctx.beginPath();
    ctx.arc(cx, cy, bpR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // ── KEYWAY (top of bore) ────────────────────────
    setLine(C.line, LW.medium);
    ctx.beginPath();
    ctx.moveTo(cx - kwH, cy - br);
    ctx.lineTo(cx - kwH, cy - br - kwD);
    ctx.lineTo(cx + kwH, cy - br - kwD);
    ctx.lineTo(cx + kwH, cy - br);
    ctx.stroke();
    // fill keyway
    ctx.fillStyle = "#f5f2eb";
    ctx.beginPath();
    ctx.moveTo(cx - kwH, cy - br);
    ctx.lineTo(cx - kwH, cy - br - kwD);
    ctx.lineTo(cx + kwH, cy - br - kwD);
    ctx.lineTo(cx + kwH, cy - br);
    ctx.fill();

    // ── OIL PORT (at top, 90°) ─────────────────────
    const opR = p(d.oilPort) / 2;
    setLine(C.line, LW.medium);
    if (showHidden) {
      setLine(C.hidden, LW.thin, [5, 3]);
      ctx.beginPath();
      ctx.arc(cx, cy, p(5), 0, Math.PI * 2);  // port end view
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // ── CENTRE LINES ───────────────────────────────
    centreLines(cx, cy, fR, fR);

    // ── HATCHING (wall section) ─────────────────────
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, hr, 0, Math.PI * 2);
    ctx.arc(cx, cy, br, 0, Math.PI * 2, true); // bore cutout
    ctx.clip("evenodd");
    ctx.strokeStyle = C.hatching;
    ctx.lineWidth = 0.7;
    for (let i = -fR * 2; i < fR * 2; i += 6) {
      ctx.beginPath();
      ctx.moveTo(cx - fR, cy + i);
      ctx.lineTo(cx + fR, cy + i - fR * 2);
      ctx.stroke();
    }
    ctx.restore();

    // Redraw bore circle cleanly on top
    setLine(C.line, LW.medium);
    ctx.beginPath();
    ctx.arc(cx, cy, br, 0, Math.PI * 2);
    ctx.stroke();

    // ── DIMENSIONS ─────────────────────────────────
    dimDia(cx, cy, fR, 35,  `Ø${d.flangeOD}`, 28);
    dimDia(cx, cy, hr, 140, `Ø${d.OD}`,       28);
    dimDia(cx, cy, br, 215, `Ø${d.ID} H7`,    28);
    dimDia(cx, cy, bpR, 60, `Ø${d.boltPCD} PCD`, 20);

    // Keyway
    dimH(cx - kwH, cx + kwH, cy - br - kwD - 14, `${d.keyW}`, 0);
    dimV(cx + kwH + 16, cy - br - kwD, cy - br, `${d.keyD}`, 0);

    // Bolt hole
    leader(cx + bpR * Math.cos((45 * Math.PI) / 180) + bhR * 0.7,
           cy + bpR * Math.sin((45 * Math.PI) / 180) - bhR * 0.7,
           cx + fR + 10, cy - fR + 10,
           cx + fR + 55, cy - fR + 10, `4× Ø${d.boltHole}`);

    // Surface finish callout
    ctx.save();
    ctx.font = "9px 'IBM Plex Mono', monospace";
    ctx.fillStyle = C.accent;
    ctx.textAlign = "left";
    ctx.fillText("√ Ra 1.6", cx + fR + 10, cy + fR - 10);
    ctx.fillText("√ Ra 0.8 (BORE)", cx + 5, cy - br + 14);
    ctx.restore();
  }

  /* ── PROJECTION LINES ───────────────────────────── */
  function drawProjectionLines() {
    if (activeView !== "all") return;
    setLine("#aaaaaa", 0.3, [4, 4]);

    const hw   = p(d.L) / 2;
    const hr   = p(d.OD) / 2;
    const fR   = p(d.flangeOD) / 2;
    const fT   = p(d.flangeT);

    // Front ↔ Top vertical projections
    line(FX - hw - fT, FY - hr, FX - hw - fT, TY + fR);
    line(FX + hw,     FY - hr, FX + hw,     TY + hr);

    // Front ↔ Side horizontal projections
    line(FX + hw,  FY - hr,  SX - fR, FY - hr);
    line(FX + hw,  FY + hr,  SX - fR, FY + hr);
    line(FX + hw,  FY - p(d.ID)/2, SX - fR, FY - p(d.ID)/2);
    line(FX + hw,  FY + p(d.ID)/2, SX - fR, FY + p(d.ID)/2);

    ctx.setLineDash([]);
  }

  /* ── SHEET BORDER & TITLE BLOCK ─────────────────── */
  function drawSheetBorder() {
    // Paper background
    ctx.fillStyle = C.paper;
    ctx.fillRect(0, 0, SW, SH);

    // Outer border
    setLine(C.border, 1.5);
    ctx.strokeRect(5, 5, SW - 10, SH - 10);
    // Inner frame
    setLine(C.border, 0.8);
    ctx.strokeRect(20, 20, SW - 40, SH - 40);

    // Sheet subdivision lines (zones)
    const zones = 6;
    for (let i = 1; i < zones; i++) {
      const x = 20 + (SW - 40) * i / zones;
      setLine(C.border, 0.3);
      line(x, 5, x, 20);
      line(x, SH - 20, x, SH - 5);
    }
    const hzones = 4;
    for (let i = 1; i < hzones; i++) {
      const y = 20 + (SH - 40) * i / hzones;
      line(5, y, 20, y);
      line(SW - 20, y, SW - 5, y);
    }

    // Zone labels A-F
    ["A","B","C","D","E","F"].forEach((z, i) => {
      const x = 20 + (SW - 40) * (i + 0.5) / zones;
      ctx.save();
      ctx.font = "7px 'IBM Plex Mono', monospace";
      ctx.fillStyle = C.title;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(z, x, 12);
      ctx.fillText(z, x, SH - 12);
      ctx.restore();
    });

    ["1","2","3","4"].forEach((z, i) => {
      const y = 20 + (SH - 40) * (i + 0.5) / hzones;
      ctx.save();
      ctx.font = "7px 'IBM Plex Mono', monospace";
      ctx.fillStyle = C.title;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(z, 12, y);
      ctx.fillText(z, SW - 12, y);
      ctx.restore();
    });

    // ── TITLE BLOCK (bottom-right) ──────────────────
    const tbX = SW - 260, tbY = SH - 115;
    const tbW = 240, tbH = 95;

    ctx.fillStyle = "#ede9df";
    ctx.fillRect(tbX, tbY, tbW, tbH);
    setLine(C.border, 1);
    ctx.strokeRect(tbX, tbY, tbW, tbH);

    // Title block internal lines
    const rows = [0, 22, 38, 52, 66, 80, 95];
    rows.forEach(r => {
      setLine(C.border, 0.5);
      line(tbX, tbY + r, tbX + tbW, tbY + r);
    });

    const cols = [0, 80, 160, 240];
    cols.forEach(c => {
      setLine(C.border, 0.5);
      line(tbX + c, tbY, tbX + c, tbY + tbH);
    });

    // Title block content
    const tbData = [
      ["DRAWN", "AI Studio",    "DATE",   "2026-05-16"],
      ["CHECKED", "",           "SCALE",  "1:2"],
      ["APPROVED", "",          "SHEET",  "1 OF 1"],
      ["DWG NO.",  "BH-2026-001","REV",   "A"],
    ];

    ctx.save();
    ctx.font = "6px 'IBM Plex Mono', monospace";
    ctx.fillStyle = C.title;
    tbData.forEach((row, i) => {
      const y0 = tbY + rows[i + 1];
      const y1 = tbY + rows[i + 2] || tbY + tbH;
      const midY = (y0 + (y1)) / 2 - 1;
      ctx.textBaseline = "middle";
      ctx.textAlign    = "left";
      ctx.fillStyle    = "#555";
      ctx.fillText(row[0], tbX + 3, y0 - 6);
      ctx.fillStyle    = C.title;
      ctx.font         = "bold 8px 'IBM Plex Mono', monospace";
      ctx.fillText(row[1], tbX + 4, y0 + 8);
      ctx.font         = "6px 'IBM Plex Mono', monospace";
      ctx.fillStyle    = "#555";
      ctx.fillText(row[2], tbX + 163, y0 - 6);
      ctx.fillStyle    = C.title;
      ctx.font         = "bold 8px 'IBM Plex Mono', monospace";
      ctx.fillText(row[3], tbX + 164, y0 + 8);
      ctx.font         = "6px 'IBM Plex Mono', monospace";
    });
    ctx.restore();

    // Company / part name block (above title block)
    const nbX = SW - 260, nbY = SH - 155;
    ctx.fillStyle = "#ddd8cc";
    ctx.fillRect(nbX, nbY, 240, 40);
    setLine(C.border, 1);
    ctx.strokeRect(nbX, nbY, 240, 40);
    ctx.save();
    ctx.font = "bold 13px 'Orbitron', sans-serif";
    ctx.fillStyle = C.accent;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("FLANGED BEARING HOUSING", nbX + 120, nbY + 13);
    ctx.font = "8px 'IBM Plex Mono', monospace";
    ctx.fillStyle = C.title;
    ctx.fillText("IS 210 FG 260 · CAST IRON · STRESS RELIEVED", nbX + 120, nbY + 30);
    ctx.restore();

    // Projection symbol (1st angle)
    const psX = SW - 350, psY = SH - 130;
    ctx.save();
    ctx.font = "7px 'IBM Plex Mono', monospace";
    ctx.fillStyle = C.title;
    ctx.textAlign = "center";
    ctx.fillText("1ST ANGLE PROJECTION", psX, psY - 5);
    // draw 1st angle symbol
    setLine(C.title, 0.8);
    ctx.beginPath();
    ctx.arc(psX - 12, psY + 14, 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(psX + 12, psY + 14, 8, 0, Math.PI * 2);
    ctx.stroke();
    // truncated cone
    ctx.beginPath();
    ctx.moveTo(psX - 5, psY + 8);
    ctx.lineTo(psX + 5, psY + 5);
    ctx.lineTo(psX + 5, psY + 23);
    ctx.lineTo(psX - 5, psY + 20);
    ctx.closePath();
    ctx.fillStyle = "#ccc";
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // General tolerance note
    ctx.save();
    ctx.font = "6.5px 'IBM Plex Mono', monospace";
    ctx.fillStyle = "#444";
    ctx.textAlign = "left";
    const notes = [
      "GENERAL TOLERANCES: ISO 2768-m",
      "ALL DIMS IN mm UNLESS STATED",
      "SURFACE FINISH: Ra 3.2 UNLESS NOTED",
      "REMOVE ALL BURRS & SHARP EDGES",
      "DO NOT SCALE THIS DRAWING",
    ];
    notes.forEach((n, i) => ctx.fillText(n, 25, SH - 100 + i * 10));
    ctx.restore();
  }

  /* ── SECTION VIEW INDICATOR ─────────────────────── */
  function drawSectionIndicator() {
    // A-A cutting plane on front view (vertical)
    const cx = FX, cy = FY;
    const hr = p(d.OD) / 2;
    const fR = p(d.flangeOD) / 2;

    setLine(C.cut, LW.medium, [10, 4, 2, 4]);
    line(cx, cy - fR - 10, cx, cy + fR + 10);
    ctx.setLineDash([]);

    // Arrows
    ctx.save();
    ctx.font = "bold 9px 'IBM Plex Mono', monospace";
    ctx.fillStyle = C.cut;
    ctx.textAlign = "center";
    ctx.fillText("A", cx, cy - fR - 16);
    ctx.fillText("A", cx, cy + fR + 22);
    ctx.restore();

    // Arrow tips
    setLine(C.cut, LW.medium);
    ctx.fillStyle = C.cut;
    ctx.beginPath();
    ctx.moveTo(cx, cy - fR - 6);
    ctx.lineTo(cx - 4, cy - fR - 2);
    ctx.lineTo(cx + 4, cy - fR - 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx, cy + fR + 5);
    ctx.lineTo(cx - 4, cy + fR + 1);
    ctx.lineTo(cx + 4, cy + fR + 1);
    ctx.fill();
  }

  /* ── GDT FRAME ──────────────────────────────────── */
  function drawGDTFrames() {
    if (!showDims) return;
    // Cylindricity on bore (front view)
    const bx = FX + p(d.L) / 2 + p(d.ID) / 2 + 50;
    const by = FY;
    gdtFrame(bx, by, "⊙", "0.02", "A");
    setLine(C.dim, LW.thin);
    line(FX + p(d.L) / 2, by, bx - 1, by);

    // Perpendicularity on flange (side view)
    gdtFrame(SX + p(d.flangeOD) / 2 + 20, SY - p(d.flangeOD) / 2 + 15, "⊥", "0.05", "A");
  }

  function gdtFrame(x, y, sym, val, datum) {
    const w = 70, h = 16;
    ctx.save();
    setLine(C.dim, LW.thin);
    ctx.fillStyle = "#f5f2eb";
    ctx.fillRect(x, y - h / 2, w, h);
    ctx.strokeRect(x, y - h / 2, w, h);
    // dividers
    line(x + 16, y - h / 2, x + 16, y + h / 2);
    line(x + 46, y - h / 2, x + 46, y + h / 2);
    line(x + 60, y - h / 2, x + 60, y + h / 2);
    ctx.font = "8px 'IBM Plex Mono', monospace";
    ctx.fillStyle = C.dimText;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(sym, x + 8, y);
    ctx.fillText(val, x + 31, y);
    ctx.font = "bold 8px 'IBM Plex Mono', monospace";
    ctx.fillText(datum, x + 65, y);
    ctx.restore();
  }

  /* ── MAIN DRAW ──────────────────────────────────── */
  function draw() {
    ctx.clearRect(0, 0, SW, SH);
    drawSheetBorder();

    if (activeView === "all" || activeView === "front") drawFrontView();
    if (activeView === "all" || activeView === "top")   drawTopView();
    if (activeView === "all" || activeView === "side")  drawSideView();
    if (activeView === "all") {
      drawProjectionLines();
      drawSectionIndicator();
      drawGDTFrames();
    }
  }

  draw();

  /* ── ZOOM ───────────────────────────────────────── */
  let scale = 1;
  const wrapper = document.getElementById("canvasWrapper");
  const label   = document.getElementById("zoomLabel");

  function setZoom(s) {
    scale = Math.max(0.4, Math.min(2.5, s));
    wrapper.style.transform = `scale(${scale})`;
    label.textContent = `${Math.round(scale * 100)}%`;
  }

  document.getElementById("zoomIn").onclick  = () => setZoom(scale + 0.15);
  document.getElementById("zoomOut").onclick = () => setZoom(scale - 0.15);
  document.getElementById("zoomReset").onclick = () => setZoom(1);

  // Mouse wheel zoom
  document.getElementById("drawingArea").addEventListener("wheel", e => {
    e.preventDefault();
    setZoom(scale - e.deltaY * 0.001);
  }, { passive: false });

  /* ── VIEW TOGGLE ────────────────────────────────── */
  document.querySelectorAll(".view-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".view-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeView = btn.dataset.view;
      draw();
    });
  });

  /* ── DISPLAY TOGGLES ────────────────────────────── */
  const btnDim = document.getElementById("toggleDim");
  btnDim.addEventListener("click", () => {
    showDims = !showDims;
    btnDim.textContent = `⊕ DIMS ${showDims ? "ON" : "OFF"}`;
    btnDim.style.color = showDims ? "" : "#888";
    draw();
  });

  const btnHid = document.getElementById("toggleHidden");
  btnHid.addEventListener("click", () => {
    showHidden = !showHidden;
    btnHid.textContent = `◌ HIDDEN ${showHidden ? "ON" : "OFF"}`;
    btnHid.style.color = showHidden ? "" : "#888";
    draw();
  });

  /* ── PDF EXPORT ─────────────────────────────────── */
  document.getElementById("btnPDF").addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a2" });

    // Cover page header
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.setTextColor(180, 50, 0);
    pdf.text("FLANGED BEARING HOUSING", 20, 22);
    pdf.setFontSize(10);
    pdf.setTextColor(80, 80, 80);
    pdf.text("Technical Drawing · 3-View Orthographic · 1st Angle Projection · Scale 1:2", 20, 30);
    pdf.setDrawColor(180, 50, 0);
    pdf.setLineWidth(0.8);
    pdf.line(20, 33, 574, 33);

    // Canvas snapshot
    const img = canvas.toDataURL("image/png", 1.0);
    const pw = 554, ph = (SH / SW) * pw;
    pdf.addImage(img, "PNG", 20, 38, pw, ph);

    // Bottom metadata
    const by = ph + 44;
    pdf.setFontSize(7);
    pdf.setTextColor(120, 120, 120);
    pdf.text("DWG NO: BH-2026-001  |  REV: A  |  DATE: 2026-05-16  |  MATERIAL: IS 210 FG 260 CI  |  SCALE: 1:2  |  STANDARDS: ISO 286-1, ISO 1302, ASME Y14.5", 20, by);
    pdf.text("© AI Studio 2026 · All dimensions in mm unless stated · General Tolerances: ISO 2768-m · Do not scale this drawing", 20, by + 6);

    // Sheet border
    pdf.setDrawColor(13, 13, 26);
    pdf.setLineWidth(1.2);
    pdf.rect(10, 10, 574, by + 10);

    pdf.save("Bearing_Housing_BH-2026-001.pdf");
  });

  /* ── DXF EXPORT ─────────────────────────────────── */
  document.getElementById("btnDXF").addEventListener("click", () => {
    const dxf = buildDXF();
    const blob = new Blob([dxf], { type: "application/octet-stream" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "Bearing_Housing_BH-2026-001.dxf";
    a.click();
    URL.revokeObjectURL(url);
  });

  /* ── DXF BUILDER ────────────────────────────────── */
  function buildDXF() {
    const L = d.L, OD = d.OD, ID = d.ID;
    const fOD = d.flangeOD, fT = d.flangeT;
    const bPCD = d.boltPCD, bH = d.boltHole;
    const kW = d.keyW, kD = d.keyD;
    const oP = d.oilPort;

    let e = [];

    function ln(layer, x1, y1, x2, y2) {
      e.push(`0\nLINE\n8\n${layer}\n10\n${x1.toFixed(3)}\n20\n${y1.toFixed(3)}\n30\n0.000\n11\n${x2.toFixed(3)}\n21\n${y2.toFixed(3)}\n31\n0.000`);
    }

    function circ(layer, cx, cy, r) {
      e.push(`0\nCIRCLE\n8\n${layer}\n10\n${cx.toFixed(3)}\n20\n${cy.toFixed(3)}\n30\n0.000\n40\n${r.toFixed(3)}`);
    }

    function txt(layer, str, x, y, h = 3) {
      e.push(`0\nTEXT\n8\n${layer}\n10\n${x.toFixed(3)}\n20\n${y.toFixed(3)}\n30\n0.000\n40\n${h}\n1\n${str}\n72\n1\n11\n${x.toFixed(3)}\n21\n${y.toFixed(3)}\n31\n0.000`);
    }

    function box(layer, x, y, w, h) {
      ln(layer, x,     y,     x+w, y    );
      ln(layer, x+w,   y,     x+w, y+h  );
      ln(layer, x+w,   y+h,   x,   y+h  );
      ln(layer, x,     y+h,   x,   y    );
    }

    // ── FRONT VIEW ─────────────────────────────────
    // Origin: front view at (0,0)
    box("VISIBLE", -L/2, -OD/2, L, OD);
    // Bore (hidden)
    box("HIDDEN", -L/2, -ID/2, L, ID);
    // Flange
    box("VISIBLE", -L/2-fT, -fOD/2, fT, fOD);
    // Keyway
    box("VISIBLE", 25-kW/2, ID/2, kW, kD);
    // Oil port
    box("VISIBLE", -oP/2, OD/2-30, oP, 30);
    // Centre lines
    ln("CENTRE", -L/2-fT-15, 0, L/2+15, 0);
    ln("CENTRE", 0, -OD/2-15, 0, OD/2+15);
    // Dimensions
    txt("DIMENSIONS", `LENGTH = ${L}mm`, 0, -OD/2-25, 3.5);
    txt("DIMENSIONS", `OD = Ø${OD}mm`, L/2+40, 0, 3.5);
    txt("DIMENSIONS", `BORE = Ø${ID}mm H7`, L/2+55, ID/4, 3.5);
    txt("DIMENSIONS", `FLANGE = Ø${fOD}mm`, -L/2-fT-50, 0, 3.5);
    txt("DIMENSIONS", `FLANGE-T = ${fT}mm`, -L/2-fT/2, -fOD/2-20, 3.5);

    // ── SIDE VIEW ──────────────────────────────────
    // Offset side view to X=350
    const SoX = 350;
    circ("VISIBLE", SoX, 0, fOD/2);
    circ("VISIBLE", SoX, 0, OD/2);
    circ("VISIBLE", SoX, 0, ID/2);
    circ("CENTRE",  SoX, 0, bPCD/2);
    // 4 bolt holes at 45°
    [45,135,225,315].forEach(ang => {
      const rad = ang * Math.PI / 180;
      circ("VISIBLE", SoX + (bPCD/2)*Math.cos(rad), (bPCD/2)*Math.sin(rad), bH/2);
    });
    // Keyway
    box("VISIBLE", SoX-kW/2, ID/2, kW, kD);
    // Centre lines
    ln("CENTRE", SoX-fOD/2-15, 0, SoX+fOD/2+15, 0);
    ln("CENTRE", SoX, -fOD/2-15, SoX, fOD/2+15);
    // Labels
    txt("DIMENSIONS", `Ø${fOD} FLANGE`, SoX+fOD/2+10, fOD/4, 3.5);
    txt("DIMENSIONS", `Ø${OD} HOUSING`, SoX+OD/2+10, -OD/4, 3.5);
    txt("DIMENSIONS", `Ø${ID} H7 BORE`, SoX+5, ID/4, 3.5);
    txt("DIMENSIONS", `4× Ø${bH} BOLTS`, SoX+bPCD/2+15, bPCD/2+15, 3.5);

    // ── TOP VIEW ───────────────────────────────────
    // Offset to Y=200
    const ToY = 200;
    box("VISIBLE", -L/2, ToY-OD/2, L, OD);
    box("HIDDEN",  -L/2, ToY-ID/2, L, ID);
    box("VISIBLE", -L/2-fT, ToY-fOD/2, fT, fOD);
    // Bolt holes (top view)
    circ("VISIBLE", -L/2-fT/2, ToY-bPCD/2, bH/2);
    circ("VISIBLE", -L/2-fT/2, ToY+bPCD/2, bH/2);
    // Keyway
    box("VISIBLE", 25-kW/2, ToY+ID/2, kW, kD);
    // Oil port
    circ("VISIBLE", 0, ToY, oP/2);
    // Centre lines
    ln("CENTRE", -L/2-fT-15, ToY, L/2+15, ToY);
    txt("DIMENSIONS", "TOP VIEW", 0, ToY+OD/2+30, 4);

    // VIEW LABELS
    txt("ANNOTATIONS", "FRONT VIEW", 0, -OD/2-40, 4);
    txt("ANNOTATIONS", "LEFT SIDE VIEW", SoX, -fOD/2-40, 4);
    txt("ANNOTATIONS", "MATERIAL: IS 210 FG 260 CI", -L/2, -OD/2-65, 3.5);
    txt("ANNOTATIONS", "TOLERANCES: ISO 2768-m", -L/2, -OD/2-72, 3.5);
    txt("ANNOTATIONS", "SCALE: 1:2 · DWG NO: BH-2026-001", -L/2, -OD/2-79, 3.5);

    const header = `0\nSECTION\n2\nHEADER\n9\n$ACADVER\n1\nAC1015\n9\n$INSUNITS\n70\n4\n9\n$MEASUREMENT\n70\n1\n0\nENDSEC\n0\nSECTION\n2\nENTITIES`;
    return header + "\n" + e.join("\n") + "\n0\nENDSEC\n0\nEOF";
  }

})();
