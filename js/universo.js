(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FONT = '"Cormorant Garamond", Georgia, serif';
  function $(id) { return document.getElementById(id); }

  /* ================= datos ================= */
  var THEMES = {
    rosa:    { name: 'Rosa',     heartA: '#ff2f66', heartB: '#ffc2d8', gIn: '#ffd6e6', gMid: '#ff5c8a', gOut: '#6f5cff', halo: 0xff3d78,
               accent: '#ff5c8a', glow: 'rgba(255,92,138,0.85)', bg1: '#1c0b33', bg2: 'rgba(143,107,255,0.16)',
               tints: ['#fff0f5', '#ffd1e3', '#e4d9ff', '#ffc2d8'] },
    violeta: { name: 'Violeta',  heartA: '#a855ff', heartB: '#e9d5ff', gIn: '#f0e0ff', gMid: '#a06bff', gOut: '#3a6bff', halo: 0x9a5bff,
               accent: '#a98bff', glow: 'rgba(168,120,255,0.85)', bg1: '#150a36', bg2: 'rgba(58,107,255,0.16)',
               tints: ['#f5eeff', '#e4d5ff', '#d3e2ff', '#eadcff'] },
    oro:     { name: 'Atardecer', heartA: '#ff8a3d', heartB: '#ffe2a8', gIn: '#fff1c9', gMid: '#ffa94d', gOut: '#ff4f7a', halo: 0xff9a3d,
               accent: '#ffb15c', glow: 'rgba(255,170,90,0.85)', bg1: '#2a0f12', bg2: 'rgba(255,79,122,0.14)',
               tints: ['#fff6e6', '#ffe3b8', '#ffd6d6', '#fff0d0'] },
    mar:     { name: 'Océano',   heartA: '#30c8ff', heartB: '#d6f6ff', gIn: '#e0fbff', gMid: '#4fb7ff', gOut: '#7a5cff', halo: 0x3fb7ff,
               accent: '#5cc8ff', glow: 'rgba(92,200,255,0.85)', bg1: '#07213a', bg2: 'rgba(122,92,255,0.16)',
               tints: ['#eefcff', '#cdeeff', '#dcd6ff', '#d6f6ff'] }
  };

  var DEFAULT_PHRASES = [
    'Eres mi universo entero',
    'Contigo el tiempo se detiene',
    'Cada estrella me recuerda a ti',
    'Mi lugar favorito es a tu lado',
    'Te elegiría en todas las galaxias',
    'Tu sonrisa ilumina mi cielo',
    'Eres mi casualidad más bonita',
    'Amarte es mi órbita favorita',
    'Contigo todo late distinto',
    'Eres mi hogar en cualquier lugar',
    'Ni mil estrellas alcanzan para contarte cuánto te quiero',
    'Tú eres mi norte y mi destino',
    'Mi corazón te encontró entre millones de luces',
    'Si volviera a nacer, te buscaría otra vez',
    'Eres la luz que no sabía que necesitaba',
    'Te quiero más allá de las estrellas',
    'Gracias por existir en mi mundo',
    'Contigo, cualquier día es especial',
    'Eres mi sueño favorito',
    'Juntos somos infinito',
    'Mi amor por ti no tiene fin',
    'Tus abrazos son mi refugio'
  ];

  /* ================= configuración (URL o panel) ================= */
  var params = new URLSearchParams(window.location.search);
  var viewer = params.has('para');
  var state = { tema: 'rosa' };

  function clean(s, max) { return String(s || '').replace(/\s+/g, ' ').trim().slice(0, max); }
  function validDate(s) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s || '')) return '';
    var p = s.split('-'), d = new Date(+p[0], +p[1] - 1, +p[2]);
    return (d.getFullYear() === +p[0] && d.getMonth() === +p[1] - 1 && d.getDate() === +p[2]) ? s : '';
  }
  function parsePhrases(raw, sep) {
    return String(raw || '').split(sep)
      .map(function (x) { return clean(x.replace(/\|/g, ' '), 70); })
      .filter(Boolean).slice(0, 14);
  }
  var viewerCfg = null;
  if (viewer) {
    viewerCfg = {
      para: clean(params.get('para'), 24),
      de: clean(params.get('de'), 24),
      msg: clean(params.get('msg'), 200),
      desde: validDate(params.get('desde')),
      tema: THEMES[params.get('tema')] ? params.get('tema') : 'rosa',
      frases: parsePhrases(params.get('f'), '|'),
      solo: params.get('solo') === '1'
    };
    state.tema = viewerCfg.tema;
  }
  function cfgNow() {
    if (viewer) return viewerCfg;
    return {
      para: clean($('para').value, 24),
      de: clean($('de').value, 24),
      msg: clean($('msg').value, 200),
      desde: validDate($('desde').value),
      tema: state.tema,
      frases: parsePhrases($('frases').value, /\r?\n/),
      solo: $('solo').checked
    };
  }
  function phraseList(cfg) {
    var custom = cfg.frases;
    if (cfg.solo && custom.length) return custom.slice();
    var out = DEFAULT_PHRASES.slice(0, 22 - custom.length);
    custom.forEach(function (p, i) {
      var idx = Math.floor((i + 0.5) * out.length / custom.length) + i;
      out.splice(Math.min(idx, out.length), 0, p);
    });
    return out;
  }
  function counterText(desde) {
    if (!desde) return '';
    var p = desde.split('-');
    var start = new Date(+p[0], +p[1] - 1, +p[2]);
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var days = Math.round((today - start) / 86400000);
    if (isNaN(days)) return '';
    function fmt(n) { return n.toLocaleString('es'); }
    if (days === 0) return 'Hoy empieza nuestra historia';
    if (days > 0) return days === 1 ? '1 día juntos' : fmt(days) + ' días juntos';
    var f = -days;
    return f === 1 ? 'Falta 1 día' : 'Faltan ' + fmt(f) + ' días';
  }
  function hexToRgb(h) {
    var n = parseInt(h.slice(1), 16);
    return ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255);
  }

  /* ================= escena ================= */
  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch (err) {
    $('fallback').style.display = 'flex';
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  var stage = $('stage');
  stage.appendChild(renderer.domElement);
  var dom = renderer.domElement;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 400);
  var group = new THREE.Group();
  group.rotation.x = 0.35;
  scene.add(group);

  function baseZoom() { return window.innerWidth / window.innerHeight < 0.8 ? 27 : 17; }
  var zoom = baseZoom() * 2.2;
  var zoomTarget = viewer ? zoom : baseZoom();

  function resize() {
    var w = stage.clientWidth || window.innerWidth;
    var h = stage.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  function glowTexture() {
    var c = document.createElement('canvas');
    c.width = c.height = 64;
    var g = c.getContext('2d');
    var gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.25, 'rgba(255,255,255,0.75)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }
  var glow = glowTexture();
  function rnd3() { return (Math.random() < 0.5 ? -1 : 1) * Math.pow(Math.random(), 3); }

  /* ---- galaxia ---- */
  var GN = 14000, galGeo, galT = new Float32Array(GN);
  (function () {
    var pos = new Float32Array(GN * 3), col = new Float32Array(GN * 3);
    for (var i = 0; i < GN; i++) {
      var r = Math.pow(Math.random(), 1.5) * 15 + 0.9;
      var ang = (i % 4) / 4 * Math.PI * 2 + r * 0.42;
      pos[i * 3]     = Math.cos(ang) * r + rnd3() * r * 0.38;
      pos[i * 3 + 1] = rnd3() * Math.max(0.2, 1.6 - r * 0.08);
      pos[i * 3 + 2] = Math.sin(ang) * r + rnd3() * r * 0.38;
      galT[i] = Math.min(1, r / 16);
    }
    galGeo = new THREE.BufferGeometry();
    galGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    galGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    group.add(new THREE.Points(galGeo, new THREE.PointsMaterial({
      size: 0.16, map: glow, vertexColors: true, transparent: true, opacity: 0.9,
      depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
    })));
  })();
  function colorGalaxy(th) {
    var a = new THREE.Color(th.gIn), b = new THREE.Color(th.gMid), c = new THREE.Color(th.gOut), t = new THREE.Color();
    var col = galGeo.attributes.color.array;
    for (var i = 0; i < GN; i++) {
      var k = galT[i];
      if (k < 0.5) t.copy(a).lerp(b, k * 2); else t.copy(b).lerp(c, (k - 0.5) * 2);
      col[i * 3] = t.r; col[i * 3 + 1] = t.g; col[i * 3 + 2] = t.b;
    }
    galGeo.attributes.color.needsUpdate = true;
  }

  /* ---- estrellas lejanas ---- */
  var farStars;
  (function () {
    var N = 2600;
    var pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
    var tints = [new THREE.Color('#ffffff'), new THREE.Color('#ffd0e2'), new THREE.Color('#c9bcff')];
    for (var i = 0; i < N; i++) {
      var R = 70 + Math.random() * 90;
      var u = Math.random() * 2 - 1, a = Math.random() * Math.PI * 2, s = Math.sqrt(1 - u * u);
      pos[i * 3] = Math.cos(a) * s * R; pos[i * 3 + 1] = u * R; pos[i * 3 + 2] = Math.sin(a) * s * R;
      var tc = tints[(Math.random() * 3) | 0], k = 0.5 + Math.random() * 0.5;
      col[i * 3] = tc.r * k; col[i * 3 + 1] = tc.g * k; col[i * 3 + 2] = tc.b * k;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    farStars = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 1.3, map: glow, vertexColors: true, transparent: true,
      depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
    }));
    scene.add(farStars);
  })();

  /* ---- corazón ---- */
  var heart = new THREE.Group();
  group.add(heart);
  var HN = 7000, heartGeo, heartR = new Float32Array(HN), haloMat;
  (function () {
    var k = 0.17;
    var pos = new Float32Array(HN * 3), col = new Float32Array(HN * 3);
    for (var i = 0; i < HN; i++) {
      var t = Math.random() * Math.PI * 2;
      var s = Math.random() < 0.7 ? 1 - Math.pow(Math.random(), 3) * 0.25 : Math.pow(Math.random(), 0.6);
      var x = 16 * Math.pow(Math.sin(t), 3);
      var y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      pos[i * 3]     = x * k * s;
      pos[i * 3 + 1] = y * k * s + 0.2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 2.4 * (1.1 - s * 0.6);
      heartR[i] = Math.random() * Math.random();
    }
    heartGeo = new THREE.BufferGeometry();
    heartGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    heartGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    heart.add(new THREE.Points(heartGeo, new THREE.PointsMaterial({
      size: 0.1, map: glow, vertexColors: true, transparent: true, opacity: 0.95,
      depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
    })));
    haloMat = new THREE.SpriteMaterial({
      map: glow, color: 0xff3d78, transparent: true, opacity: 0.32,
      depthWrite: false, blending: THREE.AdditiveBlending
    });
    var halo = new THREE.Sprite(haloMat);
    halo.scale.set(10, 10, 1);
    heart.add(halo);
  })();
  function colorHeart(th) {
    var a = new THREE.Color(th.heartA), b = new THREE.Color(th.heartB), c = new THREE.Color();
    var col = heartGeo.attributes.color.array;
    for (var i = 0; i < HN; i++) {
      c.copy(a).lerp(b, heartR[i]);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    heartGeo.attributes.color.needsUpdate = true;
  }

  /* zona invisible para detectar el toque en el corazón */
  var hitHeart = new THREE.Mesh(new THREE.SphereGeometry(3.4, 12, 12), new THREE.MeshBasicMaterial({ visible: false }));
  group.add(hitHeart);

  /* ---- chispas al tocar el corazón ---- */
  var BN = 160, burstPos = new Float32Array(BN * 3), burstVel = new Float32Array(BN * 3), burstLife = 0, boost = 0;
  var burstGeo = new THREE.BufferGeometry();
  burstGeo.setAttribute('position', new THREE.BufferAttribute(burstPos, 3));
  var burstMat = new THREE.PointsMaterial({
    size: 0.24, map: glow, color: 0xffffff, transparent: true, opacity: 0,
    depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
  });
  var burst = new THREE.Points(burstGeo, burstMat);
  burst.frustumCulled = false;
  group.add(burst);
  function triggerBurst() {
    for (var i = 0; i < BN; i++) {
      var u = Math.random() * 2 - 1, a = Math.random() * Math.PI * 2, s = Math.sqrt(1 - u * u), sp = 2 + Math.random() * 5;
      burstPos[i * 3] = burstPos[i * 3 + 1] = burstPos[i * 3 + 2] = 0;
      burstVel[i * 3] = Math.cos(a) * s * sp; burstVel[i * 3 + 1] = u * sp; burstVel[i * 3 + 2] = Math.sin(a) * s * sp;
    }
    burstGeo.attributes.position.needsUpdate = true;
    burstLife = 1; boost = 1;
  }

  /* ---- estrellas fugaces ---- */
  var streaks = [], nextStreak = 2.5;
  function spawnStreak() {
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0, 7, 2.6, 0]), 3));
    var line = new THREE.Line(g, new THREE.LineBasicMaterial({
      color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false
    }));
    var head = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glow, color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending
    }));
    head.scale.set(1.8, 1.8, 1);
    var obj = new THREE.Group();
    obj.add(line); obj.add(head);
    obj.position.set(8 + Math.random() * 30, 6 + Math.random() * 20, -55);
    scene.add(obj);
    streaks.push({ obj: obj, line: line, head: head, age: 0, life: 1.5, vx: -38, vy: -14 });
  }

  /* ================= textos 3D ================= */
  var theme = THEMES.rosa, ready = false;
  var sprites = [], nameSprite = null, counterSprite = null;
  var UNIT = 0.0085;

  function wrapLines(text, max) {
    if (text.length <= max) return [text];
    var words = text.split(' '), lines = [], cur = '';
    words.forEach(function (w) {
      if (!cur) cur = w;
      else if ((cur + ' ' + w).length <= max) cur += ' ' + w;
      else { lines.push(cur); cur = w; }
    });
    if (cur) lines.push(cur);
    return lines;
  }
  function labelSprite(text, px, color, glowColor, maxChars, opacity) {
    var lines = wrapLines(text, maxChars);
    var c = document.createElement('canvas'), g = c.getContext('2d');
    var font = 'italic 600 ' + px + 'px ' + FONT;
    g.font = font;
    var w = 0;
    lines.forEach(function (l) { w = Math.max(w, g.measureText(l).width); });
    var lh = px * 1.15, pad = px * 0.7;
    c.width = Math.ceil(w + pad * 2);
    c.height = Math.ceil(lh * lines.length + pad * 2);
    g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = color; g.shadowColor = glowColor; g.shadowBlur = px * 0.5;
    lines.forEach(function (l, i) { g.fillText(l, c.width / 2, pad + lh * (i + 0.5)); });
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, opacity: opacity
    }));
    sp.scale.set(c.width * UNIT, c.height * UNIT, 1);
    sp.userData.size = { w: c.width * UNIT, h: c.height * UNIT };
    return sp;
  }
  function disposeSprite(sp) {
    if (!sp) return;
    if (sp.parent) sp.parent.remove(sp);
    sp.material.map.dispose();
    sp.material.dispose();
  }

  function setName() {
    if (!ready) return;
    disposeSprite(nameSprite);
    var v = cfgNow().para || 'ti';
    nameSprite = labelSprite('Para ' + v, 84, '#fff0f5', theme.glow, 40, 1);
    nameSprite.position.set(0, -3.6, 0.5);
    heart.add(nameSprite);
  }
  function setCounter() {
    if (!ready) return;
    disposeSprite(counterSprite);
    counterSprite = null;
    var txt = counterText(cfgNow().desde);
    if (!txt) return;
    counterSprite = labelSprite(txt, 52, theme.tints[1], theme.glow, 40, 0.95);
    counterSprite.position.set(0, -5.6, 0.5);
    heart.add(counterSprite);
  }
  function buildPhrases() {
    if (!ready) return;
    sprites.forEach(disposeSprite);
    sprites = [];
    var list = phraseList(cfgNow()), n = list.length;
    list.forEach(function (text, i) {
      var y = 1 - 2 * (i + 0.5) / n;
      var rad = Math.sqrt(1 - y * y);
      var phi = i * 2.39996;
      var R = 7.5 + Math.random() * 5;
      var sp = labelSprite(text, 56, theme.tints[i % theme.tints.length], theme.glow, 26, 0.9);
      sp.position.set(Math.cos(phi) * rad * R, y * R * 0.8, Math.sin(phi) * rad * R);
      sp.userData.base = sp.position.clone();
      sp.userData.phase = Math.random() * 6.28;
      sp.userData.text = text;
      sp.userData.bump = 0;
      group.add(sp);
      sprites.push(sp);
    });
  }

  function applyTheme(key) {
    theme = THEMES[key] || THEMES.rosa;
    var rs = document.documentElement.style;
    rs.setProperty('--accent', theme.accent);
    rs.setProperty('--accent-rgb', hexToRgb(theme.accent));
    rs.setProperty('--glowbg', theme.bg1);
    rs.setProperty('--glow2', theme.bg2);
    colorGalaxy(theme);
    colorHeart(theme);
    haloMat.color.set(theme.halo);
    burstMat.color.set(theme.heartB);
    setName(); setCounter(); buildPhrases();
  }

  /* ================= frase destacada ================= */
  var caption = $('caption'), capTimer = null;
  function showPhrase(sp) {
    if (!sp) return;
    caption.textContent = sp.userData.text;
    caption.classList.add('on');
    sp.userData.bump = 1;
    chime();
    clearTimeout(capTimer);
    capTimer = setTimeout(function () { caption.classList.remove('on'); }, 5000);
  }
  function randomPhrase() {
    if (sprites.length) showPhrase(sprites[(Math.random() * sprites.length) | 0]);
  }
  $('random').addEventListener('click', randomPhrase);

  var auto = !reduce;
  var autoBtn = $('auto');
  autoBtn.setAttribute('aria-pressed', String(auto));
  autoBtn.addEventListener('click', function () {
    auto = !auto;
    autoBtn.setAttribute('aria-pressed', String(auto));
  });

  /* ================= sonido (generado en el navegador) ================= */
  var audio = { ctx: null, master: null, on: false, padTimer: null, chimeTimer: null, step: 0 };
  var CHORDS = [[220, 261.63, 329.63], [174.61, 220, 261.63], [261.63, 329.63, 392], [196, 246.94, 293.66]];
  var PENTA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
  function initAudio() {
    if (audio.ctx) return true;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    var ctx = new AC();
    var master = ctx.createGain();
    master.gain.value = 0;
    var delay = ctx.createDelay(1.5); delay.delayTime.value = 0.42;
    var fb = ctx.createGain(); fb.gain.value = 0.38;
    var wet = ctx.createGain(); wet.gain.value = 0.35;
    master.connect(ctx.destination);
    master.connect(delay); delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(ctx.destination);
    audio.ctx = ctx; audio.master = master;
    return true;
  }
  function playChord() {
    var ctx = audio.ctx, now = ctx.currentTime, ch = CHORDS[audio.step++ % CHORDS.length];
    ch.forEach(function (f, i) {
      var o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = f; o.detune.value = (i - 1) * 4;
      var o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = f * 2;
      var g2 = ctx.createGain(); g2.gain.value = 0.35;
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.05, now + 2.2);
      g.gain.linearRampToValueAtTime(0.0001, now + 7.5);
      var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900;
      o.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(g); g.connect(audio.master);
      o.start(now); o2.start(now); o.stop(now + 8); o2.stop(now + 8);
    });
  }
  function chime(freq, vol) {
    if (!audio.on || !audio.ctx) return;
    var ctx = audio.ctx, now = ctx.currentTime;
    var o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.value = freq || PENTA[(Math.random() * PENTA.length) | 0];
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(vol || 0.09, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 2.6);
    o.connect(g); g.connect(audio.master);
    o.start(now); o.stop(now + 2.7);
  }
  function scheduleChime() {
    audio.chimeTimer = setTimeout(function () { chime(); scheduleChime(); }, 2500 + Math.random() * 4000);
  }
  var soundBtn = $('sound');
  function setSound(on) {
    if (on && !initAudio()) { on = false; }
    audio.on = on;
    soundBtn.setAttribute('aria-pressed', String(on));
    clearInterval(audio.padTimer); clearTimeout(audio.chimeTimer);
    if (!audio.ctx) return;
    var now = audio.ctx.currentTime;
    if (on) {
      audio.ctx.resume();
      audio.master.gain.setTargetAtTime(0.9, now, 1.0);
      playChord();
      audio.padTimer = setInterval(playChord, 6000);
      scheduleChime();
    } else {
      audio.master.gain.setTargetAtTime(0, now, 0.25);
    }
  }
  soundBtn.addEventListener('click', function () { setSound(!audio.on); });
  document.addEventListener('visibilitychange', function () {
    if (!audio.ctx) return;
    if (document.hidden) audio.ctx.suspend(); else if (audio.on) audio.ctx.resume();
  });

  /* ================= controles ================= */
  var ptrs = {}, vel = { x: 0, y: 0 }, moved = 0, lastPinch = 0;
  function count() { return Object.keys(ptrs).length; }
  function pinchDist() {
    var k = Object.keys(ptrs), a = ptrs[k[0]], b = ptrs[k[1]];
    return Math.hypot(a.x - b.x, a.y - b.y);
  }
  dom.addEventListener('pointerdown', function (e) {
    try { dom.setPointerCapture(e.pointerId); } catch (err) {}
    ptrs[e.pointerId] = { x: e.clientX, y: e.clientY };
    moved = 0; vel.x = vel.y = 0;
    lastPinch = count() === 2 ? pinchDist() : 0;
  });
  dom.addEventListener('pointermove', function (e) {
    var p = ptrs[e.pointerId];
    if (!p) return;
    var n = count();
    if (n === 1) {
      var dx = e.clientX - p.x, dy = e.clientY - p.y;
      group.rotation.y += dx * 0.006;
      group.rotation.x = Math.max(-1.3, Math.min(1.3, group.rotation.x + dy * 0.006));
      vel.y = dx * 0.006; vel.x = dy * 0.006;
      moved += Math.abs(dx) + Math.abs(dy);
      p.x = e.clientX; p.y = e.clientY;
    } else if (n === 2) {
      p.x = e.clientX; p.y = e.clientY;
      var d = pinchDist();
      if (lastPinch) zoomTarget = Math.max(6, Math.min(34, zoomTarget * lastPinch / d));
      lastPinch = d; moved += 10;
    }
  });
  function endPtr(e) {
    if (!ptrs[e.pointerId]) return;
    var wasTap = count() === 1 && moved < 6 && e.type === 'pointerup';
    delete ptrs[e.pointerId];
    lastPinch = 0;
    if (wasTap) pick(e.clientX, e.clientY);
  }
  dom.addEventListener('pointerup', endPtr);
  dom.addEventListener('pointercancel', endPtr);
  dom.addEventListener('wheel', function (e) {
    e.preventDefault();
    zoomTarget = Math.max(6, Math.min(34, zoomTarget * (1 + e.deltaY * 0.0012)));
  }, { passive: false });

  var ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function pick(cx, cy) {
    var r = dom.getBoundingClientRect();
    ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    var hits = ray.intersectObjects(sprites.concat([hitHeart]));
    if (!hits.length) return;
    if (hits[0].object === hitHeart) { triggerBurst(); chime(392, 0.11); randomPhrase(); }
    else showPhrase(hits[0].object);
  }

  /* ================= mensaje del remitente ================= */
  var msgcard = $('msgcard'), msgTimer = null;
  function showMsg() {
    msgcard.hidden = false;
    requestAnimationFrame(function () { msgcard.classList.add('on'); });
    clearTimeout(msgTimer);
    msgTimer = setTimeout(hideMsg, 16000);
  }
  function hideMsg() {
    clearTimeout(msgTimer);
    msgcard.classList.remove('on');
    setTimeout(function () { if (!msgcard.classList.contains('on')) msgcard.hidden = true; }, 520);
  }
  $('msgClose').addEventListener('click', hideMsg);
  $('msgBtn').addEventListener('click', showMsg);

  /* ================= modo receptor / modo creador ================= */
  if (viewer) {
    document.body.classList.add('viewer');
    $('panel').remove();
    $('leftBtns').remove();
    document.title = 'Un universo para ' + (viewerCfg.para || 'ti');
    $('introName').textContent = viewerCfg.para || 'ti';
    if (viewerCfg.de) { $('introFrom').textContent = 'De parte de ' + viewerCfg.de; $('introFrom').hidden = false; }
    $('msgText').textContent = viewerCfg.msg;
    $('msgFrom').textContent = viewerCfg.de ? '— ' + viewerCfg.de : '';
    if (viewerCfg.msg) $('msgBtn').hidden = false;
    $('intro').hidden = false;
    $('enter').addEventListener('click', function () {
      $('intro').classList.add('hide');
      zoomTarget = baseZoom();
      setSound(true);
      if (viewerCfg.msg) setTimeout(showMsg, 2600);
    });
    $('enter').focus();
  } else {
    var panel = $('panel'), openBtn = $('openPanel'), linkBox = $('link'), resultBox = $('result');
    var phraseTimer = null;
    function invalidate() { resultBox.hidden = true; }

    openBtn.addEventListener('click', function () {
      panel.hidden = !panel.hidden;
      openBtn.setAttribute('aria-expanded', String(!panel.hidden));
    });

    Object.keys(THEMES).forEach(function (key) {
      var th = THEMES[key];
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'sw'; b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', String(key === state.tema));
      var dot = document.createElement('i');
      dot.style.background = 'linear-gradient(135deg,' + th.gIn + ',' + th.gMid + ' 55%,' + th.gOut + ')';
      var lbl = document.createElement('span');
      lbl.textContent = th.name;
      b.appendChild(dot); b.appendChild(lbl);
      b.addEventListener('click', function () {
        state.tema = key;
        Array.prototype.forEach.call($('swatches').children, function (el) { el.setAttribute('aria-checked', 'false'); });
        b.setAttribute('aria-checked', 'true');
        applyTheme(key);
        invalidate();
      });
      $('swatches').appendChild(b);
    });

    ['para', 'de', 'msg', 'desde', 'frases'].forEach(function (id) { $(id).addEventListener('input', invalidate); });
    $('solo').addEventListener('change', invalidate);
    $('para').addEventListener('input', setName);
    $('desde').addEventListener('input', setCounter);
    $('desde').addEventListener('change', setCounter);
    $('frases').addEventListener('input', function () {
      clearTimeout(phraseTimer);
      phraseTimer = setTimeout(buildPhrases, 350);
    });
    $('solo').addEventListener('change', buildPhrases);

    $('make').addEventListener('click', function () {
      var cfg = cfgNow();
      if (!cfg.para) { $('para').focus(); return; }
      var p = new URLSearchParams();
      p.set('para', cfg.para);
      if (cfg.de) p.set('de', cfg.de);
      if (cfg.msg) p.set('msg', cfg.msg);
      if (cfg.desde) p.set('desde', cfg.desde);
      if (cfg.tema !== 'rosa') p.set('tema', cfg.tema);
      if (cfg.frases.length) { p.set('f', cfg.frases.join('|')); if (cfg.solo) p.set('solo', '1'); }
      var base = window.location.protocol === 'file:'
        ? 'https://amr-star-dev.github.io/TAREA-04/'
        : window.location.href.split(/[?#]/)[0];
      var url = base + '?' + p.toString();
      linkBox.value = url;
      $('preview').href = url;
      $('wa').href = 'https://wa.me/?text=' + encodeURIComponent('Preparé algo para ti: ' + url);
      $('note').textContent = window.location.protocol === 'file:'
        ? 'Se creó un enlace público de GitHub Pages. Comprueba que el sitio esté publicado antes de enviarlo.'
        : 'Envía este enlace. Quien lo abra verá su nombre y solo podrá explorar el universo.';
      resultBox.hidden = false;
      linkBox.scrollIntoView({ block: 'nearest' });
    });

    var copyBtn = $('copy');
    copyBtn.addEventListener('click', function () {
      function done(ok) {
        copyBtn.textContent = ok ? 'Copiado' : 'Selecciona y copia';
        setTimeout(function () { copyBtn.textContent = 'Copiar'; }, 2000);
      }
      linkBox.select();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(linkBox.value).then(function () { done(true); }, function () { done(false); });
      } else {
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (err) {}
        done(ok);
      }
    });
    if (navigator.share) {
      $('share').hidden = false;
      $('share').addEventListener('click', function () {
        navigator.share({ title: 'Un universo para ti', text: 'Preparé algo para ti', url: linkBox.value }).catch(function () {});
      });
    }
  }

  /* ================= animación ================= */
  var clock = new THREE.Clock(), tmp = new THREE.Vector3(), last = 0;
  function frame() {
    requestAnimationFrame(frame);
    var t = clock.getElapsedTime(), dt = Math.min(0.05, t - last);
    last = t;
    var dragging = count() > 0;

    if (!dragging) {
      group.rotation.y += vel.y + (auto ? 0.0014 : 0);
      group.rotation.x = Math.max(-1.3, Math.min(1.3, group.rotation.x + vel.x));
      vel.x *= 0.94; vel.y *= 0.94;
    }
    zoom += (zoomTarget - zoom) * 0.05;
    camera.position.set(0, 2.2, zoom);
    camera.lookAt(0, 0, 0);
    farStars.rotation.y = group.rotation.y * 0.25;
    farStars.rotation.x = group.rotation.x * 0.25;

    var appear = Math.min(1, t / 2.4), ease = 1 - Math.pow(1 - appear, 3);
    heart.rotation.y = -group.rotation.y * 0.65 + (reduce ? 0 : Math.sin(t * 0.5) * 0.2);
    heart.rotation.x = -group.rotation.x * 0.5;
    var ph = (t * 1.1) % 1, beat = 1;
    if (!reduce) {
      beat = 1 + 0.07 * (Math.pow(Math.max(0, Math.sin(ph * Math.PI * 2)), 6) +
                         0.6 * Math.pow(Math.max(0, Math.sin(ph * Math.PI * 2 - 1.2)), 6));
    }
    boost *= Math.pow(0.02, dt);
    heart.scale.setScalar(Math.max(0.001, ease * (beat + boost * 0.22)));

    if (burstLife > 0) {
      var damp = Math.pow(0.25, dt);
      for (var b = 0; b < BN * 3; b++) { burstPos[b] += burstVel[b] * dt; burstVel[b] *= damp; }
      burstLife -= dt * 0.75;
      burstMat.opacity = Math.max(0, burstLife);
      burstGeo.attributes.position.needsUpdate = true;
    }

    for (var i = 0; i < sprites.length; i++) {
      var sp = sprites[i], u = sp.userData;
      if (!reduce) sp.position.y = u.base.y + Math.sin(t * 0.6 + u.phase) * 0.25;
      sp.getWorldPosition(tmp);
      var d = tmp.distanceTo(camera.position);
      var op = Math.max(0.2, Math.min(1, 1.2 - (d - 8) / 22));
      u.bump *= 0.97;
      var s = 1 + u.bump * 0.45;
      sp.scale.set(u.size.w * s, u.size.h * s, 1);
      sp.material.opacity = Math.min(1, op + u.bump);
    }

    if (!reduce) {
      nextStreak -= dt;
      if (nextStreak <= 0) { spawnStreak(); nextStreak = 3 + Math.random() * 6; }
    }
    for (var j = streaks.length - 1; j >= 0; j--) {
      var st = streaks[j];
      st.age += dt;
      var k = st.age / st.life;
      if (k >= 1) {
        scene.remove(st.obj);
        st.line.geometry.dispose(); st.line.material.dispose(); st.head.material.dispose();
        streaks.splice(j, 1);
        continue;
      }
      st.obj.position.x += st.vx * dt;
      st.obj.position.y += st.vy * dt;
      var a = Math.sin(Math.PI * k);
      st.line.material.opacity = 0.9 * a;
      st.head.material.opacity = a;
    }

    renderer.render(scene, camera);
  }

  /* ================= arranque ================= */
  applyTheme(state.tema);
  function start() { ready = true; applyTheme(state.tema); }
  var fontsReady = (document.fonts && document.fonts.load)
    ? Promise.race([
        document.fonts.load('italic 600 56px "Cormorant Garamond"'),
        new Promise(function (res) { setTimeout(res, 2000); })
      ])
    : Promise.resolve();
  fontsReady.then(start, start);
  frame();
})();
