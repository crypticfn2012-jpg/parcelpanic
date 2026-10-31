(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const THREE = window.THREE;
  if (!THREE) throw new Error('Three.js did not load.');

  const GAME = {
    duration: { rush: 150, team: 150, survival: 105, gold: 150 },
    names: ['ZIP', 'BOXBUD', 'TAPE', 'DASH', 'PIP', 'ROCKET', 'MAILO'],
    colours: [0x4bd4be, 0xffcf68, 0x9a83ed, 0x65a9e8, 0xf08fb5, 0x8bcf67, 0xf18b64],
    parcels: [
      { id: 'common', label: 'COMMON', points: 10, weight: 60, speed: 1, colour: 0xc69b6d, glow: 0x4b2c14, size: 0.78 },
      { id: 'rare', label: 'RARE', points: 25, weight: 25, speed: 0.93, colour: 0x4c9fe4, glow: 0x153b62, size: 0.82 },
      { id: 'epic', label: 'EPIC', points: 50, weight: 11, speed: 0.85, colour: 0xa079e5, glow: 0x392052, size: 0.88 },
      { id: 'golden', label: 'GOLDEN', points: 100, weight: 3.5, speed: 0.78, colour: 0xffcf63, glow: 0x6b4512, size: 0.94 },
      { id: 'diamond', label: 'DIAMOND', points: 150, weight: 0.5, speed: 0.70, colour: 0x7ce5db, glow: 0x205e62, size: 1.0 }
    ],
    spawnPoints: [
      [-27, -20], [-21, -2], [-25, 24], [-12, -27], [-10, 7], [-7, 27],
      [8, -27], [10, -3], [12, 27], [26, -20], [27, 7], [25, 25],
      [0, 19], [-1, -12], [18, 15], [-18, -16], [0, -30], [30, 0]
    ]
  };

  const MAPS = {
    neon: {
      name: 'NEON CITY',
      tag: 'ROOFTOP RUN',
      sky: 0x8db9c1,
      fog: 0x8db9c1,
      floor: 0x334956,
      grid: 0x718f98,
      accent: 0x4bd4be,
      obstacles: [
        [-13, -17, 6, 3.2, 2.7], [12, -16, 5, 4, 2.5], [-18, 3, 4, 7, 2.4],
        [18, 5, 5, 5, 2.3], [-5, 11, 7, 2.2, 1.8], [7, 13, 6, 2.2, 1.8],
        [-24, -9, 3, 3, 2.1], [25, -5, 3, 3, 2.2], [0, 21, 3.6, 3.6, 2.6]
      ],
      zones: [{ x: 0, z: 31, r: 5.4 }, { x: 0, z: -31, r: 5.4 }],
      skyline: 0x496d7b
    },
    tropical: {
      name: 'TROPICAL TROUBLE',
      tag: 'ISLAND EXPRESS',
      sky: 0x8acbd0,
      fog: 0x8acbd0,
      floor: 0x397b68,
      grid: 0x90c6a8,
      accent: 0xffd16c,
      obstacles: [
        [-15, -16, 7, 3.5, 2.4], [14, -17, 7, 3.5, 2.6], [-19, 2, 4, 8, 2.1],
        [19, 1, 4, 8, 2.1], [-6, 12, 5, 3, 1.7], [7, 11, 5, 3, 1.7],
        [0, -5, 7, 3, 1.1], [-25, 23, 4, 4, 2.2], [25, 23, 4, 4, 2.2]
      ],
      zones: [{ x: 25, z: 24, r: 5.2 }, { x: -25, z: -24, r: 5.2 }],
      skyline: 0x477d78
    },
    factory: {
      name: 'THE FACTORY',
      tag: 'SORTING FLOOR',
      sky: 0x829aa7,
      fog: 0x829aa7,
      floor: 0x3f5057,
      grid: 0x85999b,
      accent: 0xff795f,
      obstacles: [
        [-14, -17, 8, 4, 3.6], [13, -16, 8, 4, 3.3], [-19, 1, 4, 8, 3.1],
        [19, 1, 4, 8, 3.1], [-6, 13, 8, 3, 2.2], [7, 13, 8, 3, 2.2],
        [-25, -12, 4, 4, 2.8], [25, -12, 4, 4, 2.8], [0, -1, 4, 7, 2.5]
      ],
      zones: [{ x: 26, z: 25, r: 5.2 }, { x: -26, z: -25, r: 5.2 }],
      skyline: 0x5b6c71
    },
    skyfall: {
      name: 'SKYFALL',
      tag: 'HIGH ALTITUDE',
      sky: 0x91abc7,
      fog: 0x91abc7,
      floor: 0x45577d,
      grid: 0xa3b9dc,
      accent: 0x9c88f1,
      obstacles: [
        [-15, -17, 7, 6, 2.7], [14, -16, 7, 6, 2.7], [-19, 3, 6, 6, 2.5],
        [19, 2, 6, 6, 2.5], [-5, 14, 7, 5, 2.3], [7, 14, 7, 5, 2.3],
        [-27, -27, 6, 5, 2], [27, -27, 6, 5, 2], [-27, 27, 6, 5, 2], [27, 27, 6, 5, 2]
      ],
      zones: [{ x: 25, z: 24, r: 5 }, { x: -25, z: -24, r: 5 }],
      skyline: 0x60749a
    }
  };

  const DEFAULT_PROFILE = {
    xp: 0, coins: 0, matches: 0, wins: 0, deliveries: 0, stolen: 0,
    bestScore: 0, streak: 0, playTime: 0,
    settings: { quality: 'high', sensitivity: 1, volume: 0.7, music: 0.25, effects: 0.8, invertY: false }
  };

  const clone = (value) => JSON.parse(JSON.stringify(value));
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const distance = (a, b) => { const pa = a.position || a; const pb = b.position || b; return Math.hypot(pa.x - pb.x, pa.z - pb.z); };
  const hex = (value) => '#' + value.toString(16).padStart(6, '0');

  class AudioSystem {
    constructor(profile) {
      this.context = null;
      this.profile = profile;
      this.sdkMuted = false;
    }
    unlock() {
      if (!this.context) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (Ctx) this.context = new Ctx();
      }
      if (!this.sdkMuted && this.context && this.context.state === 'suspended') this.context.resume();
    }
    setSdkMute(muted) {
      this.sdkMuted = !!muted;
      if (this.context) {
        if (this.sdkMuted) this.context.suspend();
        else if (this.context.state === 'suspended') this.context.resume();
      }
    }
    play(kind) {
      const settings = this.profile.settings;
      if (this.sdkMuted || !settings || settings.volume <= 0 || settings.effects <= 0) return;
      this.unlock();
      if (!this.context) return;
      const presets = {
        pickup: [520, 780, 0.11, 'sine'],
        deliver: [440, 990, 0.24, 'triangle'],
        steal: [270, 130, 0.16, 'sawtooth'],
        jump: [240, 380, 0.09, 'sine'],
        push: [140, 65, 0.13, 'square'],
        event: [340, 850, 0.36, 'triangle'],
        win: [520, 1040, 0.42, 'triangle'],
        click: [430, 500, 0.045, 'sine'],
        warning: [220, 150, 0.18, 'square']
      };
      const spec = presets[kind] || presets.click;
      const now = this.context.currentTime;
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.type = spec[3];
      oscillator.frequency.setValueAtTime(spec[0], now);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, spec[1]), now + spec[2]);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(settings.volume * settings.effects * 0.19, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + spec[2] + 0.04);
      oscillator.connect(gain);
      gain.connect(this.context.destination);
      oscillator.start(now);
      oscillator.stop(now + spec[2] + 0.05);
    }
  }

  class Input {
    constructor(canvas, game) {
      this.canvas = canvas;
      this.game = game;
      this.keys = new Set();
      this.pressed = new Set();
      this.mouseX = 0;
      this.mouseY = 0;
      this.pointerLocked = false;
      this.dragging = false;
      this.lastMouse = { x: 0, y: 0 };
      this.axis = { x: 0, y: 0 };
      this.touchPointers = new Map();
      this.enabled = false;
      this.coarse = navigator.maxTouchPoints > 0 || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);

      this.onKeyDown = (event) => {
        const key = event.code;
        if (key === 'Escape') {
          event.preventDefault();
          if (this.game.state === 'playing') this.game.pause();
          else if (this.game.state === 'paused') this.game.resume();
          return;
        }
        if (!this.enabled) return;
        if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) event.preventDefault();
        if (!this.keys.has(key)) this.pressed.add(key);
        this.keys.add(key);
        if (event.repeat) return;
        if (this.game.state === 'playing') {
          if (key === 'KeyE') this.game.interact(this.game.player);
          if (key === 'KeyQ') this.game.throwParcel(this.game.player);
          if (key === 'KeyF') this.game.push(this.game.player);
        }
      };
      this.onKeyUp = (event) => this.keys.delete(event.code);
      this.onMouseMove = (event) => {
        if (!this.enabled) return;
        if (this.pointerLocked) {
          this.mouseX += event.movementX || 0;
          this.mouseY += event.movementY || 0;
        } else if (this.dragging) {
          this.mouseX += event.clientX - this.lastMouse.x;
          this.mouseY += event.clientY - this.lastMouse.y;
          this.lastMouse.x = event.clientX;
          this.lastMouse.y = event.clientY;
        }
      };
      this.onPointerLock = () => { this.pointerLocked = document.pointerLockElement === this.canvas; };
      this.touchLookId = null;
      this.touchLookLast = { x: 0, y: 0 };
      this.onTouchLookDown = (event) => {
        if (!this.enabled || event.pointerType !== 'touch' || event.clientX < innerWidth * 0.42 || event.target.closest('.touch-actions,.joystick,.pause-button')) return;
        this.touchLookId = event.pointerId;
        this.touchLookLast.x = event.clientX;
        this.touchLookLast.y = event.clientY;
      };
      this.onTouchLookMove = (event) => {
        if (this.touchLookId !== event.pointerId) return;
        this.mouseX += event.clientX - this.touchLookLast.x;
        this.mouseY += event.clientY - this.touchLookLast.y;
        this.touchLookLast.x = event.clientX;
        this.touchLookLast.y = event.clientY;
      };
      this.onTouchLookUp = (event) => {
        if (this.touchLookId === event.pointerId) this.touchLookId = null;
      };
      this.onCanvasDown = (event) => {
        if (!this.enabled || event.pointerType === 'touch') return;
        this.dragging = true;
        this.lastMouse.x = event.clientX;
        this.lastMouse.y = event.clientY;
        if (this.canvas.requestPointerLock && !this.pointerLocked) {
          const promise = this.canvas.requestPointerLock();
          if (promise && promise.catch) promise.catch(() => {});
        }
      };
      this.onCanvasUp = () => { this.dragging = false; };

      window.addEventListener('keydown', this.onKeyDown);
      window.addEventListener('keyup', this.onKeyUp);
      window.addEventListener('mousemove', this.onMouseMove);
      window.addEventListener('pointermove', this.onTouchLookMove);
      window.addEventListener('pointerup', this.onTouchLookUp);
      window.addEventListener('pointercancel', this.onTouchLookUp);
      window.addEventListener('pointerup', this.onCanvasUp);
      document.addEventListener('pointerlockchange', this.onPointerLock);
      canvas.addEventListener('pointerdown', this.onCanvasDown);
      canvas.addEventListener('pointerdown', this.onTouchLookDown);
      this.bindTouch();
    }
    bindTouch() {
      const zone = $('joystick');
      const knob = $('joystick-knob');
      const radius = 40;
      if (zone && knob) {
        let pointer = null;
        let center = { x: 0, y: 0 };
        const move = (event) => {
          if (pointer !== event.pointerId) return;
          const dx = event.clientX - center.x;
          const dy = event.clientY - center.y;
          const length = Math.hypot(dx, dy);
          const scale = length > radius ? radius / length : 1;
          this.axis.x = clamp(dx * scale / radius, -1, 1);
          this.axis.y = clamp(dy * scale / radius, -1, 1);
          knob.style.transform = 'translate(' + (this.axis.x * radius) + 'px,' + (this.axis.y * radius) + 'px)';
        };
        const release = (event) => {
          if (pointer !== event.pointerId) return;
          pointer = null;
          this.axis.x = this.axis.y = 0;
          knob.style.transform = 'translate(0,0)';
        };
        zone.addEventListener('pointerdown', (event) => {
          event.preventDefault();
          pointer = event.pointerId;
          const rect = zone.getBoundingClientRect();
          center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
          if (zone.setPointerCapture) zone.setPointerCapture(pointer);
          move(event);
        });
        zone.addEventListener('pointermove', move);
        zone.addEventListener('pointerup', release);
        zone.addEventListener('pointercancel', release);
      }
      const bind = (selector, key, action) => {
        const button = $(selector);
        if (!button) return;
        const press = (event) => {
          event.preventDefault();
          if (!this.enabled) return;
          if (button.setPointerCapture) button.setPointerCapture(event.pointerId);
          button.classList.add('pressed');
          this.keys.add(key);
          this.pressed.add(key);
          if (action) action();
        };
        const release = () => {
          this.keys.delete(key);
          button.classList.remove('pressed');
        };
        button.addEventListener('pointerdown', press);
        button.addEventListener('pointerup', release);
        button.addEventListener('pointercancel', release);
        button.addEventListener('lostpointercapture', release);
      };
      bind('touch-jump', 'Space');
      bind('touch-sprint', 'ShiftLeft');
      bind('touch-interact', 'KeyE', () => this.game.interact(this.game.player));
      bind('touch-throw', 'KeyQ', () => this.game.throwParcel(this.game.player));
      bind('touch-push', 'KeyF', () => this.game.push(this.game.player));
    }
    down(code) {
      if (this.keys.has(code)) return true;
      if (code === 'KeyW' || code === 'ArrowUp') return this.axis.y < -0.22;
      if (code === 'KeyS' || code === 'ArrowDown') return this.axis.y > 0.22;
      if (code === 'KeyA' || code === 'ArrowLeft') return this.axis.x < -0.22;
      if (code === 'KeyD' || code === 'ArrowRight') return this.axis.x > 0.22;
      return false;
    }
    consume(code) {
      const result = this.pressed.has(code);
      this.pressed.delete(code);
      return result;
    }
    consumeMouse() {
      const result = { x: this.mouseX, y: this.mouseY };
      this.mouseX = this.mouseY = 0;
      return result;
    }
    enable(value) {
      this.enabled = value;
      if (!value) {
        this.keys.clear();
        this.pressed.clear();
        this.axis.x = this.axis.y = 0;
        this.dragging = false;
        this.touchLookId = null;
        if (this.pointerLocked && document.exitPointerLock) document.exitPointerLock();
        $('joystick-knob').style.transform = 'translate(0,0)';
      }
    }
  }

  class Arena {
    constructor(scene) {
      this.scene = scene;
      this.root = new THREE.Group();
      this.scene.add(this.root);
      this.colliders = [];
      this.zones = [];
      this.moving = [];
      this.safeRing = null;
      this.safeRadius = 34;
      this.time = 0;
      this.config = MAPS.neon;
    }
    clear() {
      const geometries = new Set();
      const materials = new Set();
      this.root.traverse((object) => {
        if (object.geometry) geometries.add(object.geometry);
        if (object.material) {
          const list = Array.isArray(object.material) ? object.material : [object.material];
          list.forEach((material) => materials.add(material));
        }
      });
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      this.root.clear();
      this.colliders = [];
      this.zones = [];
      this.moving = [];
      this.safeRing = null;
    }
    box(x, y, z, w, h, d, color, opts = {}) {
      const geometry = new THREE.BoxGeometry(w, h, d);
      const material = new THREE.MeshStandardMaterial({
        color,
        roughness: opts.roughness ?? 0.72,
        metalness: opts.metalness ?? 0.05,
        emissive: opts.emissive || 0x000000,
        emissiveIntensity: opts.glow || 0
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      mesh.castShadow = opts.shadow !== false;
      mesh.receiveShadow = true;
      this.root.add(mesh);
      return mesh;
    }
    cylinder(x, y, z, rt, rb, height, color, segments = 20, opts = {}) {
      const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(rt, rb, height, segments),
        new THREE.MeshStandardMaterial({ color, roughness: opts.roughness ?? 0.58, metalness: opts.metalness ?? 0.06, emissive: opts.emissive || 0x000000, emissiveIntensity: opts.glow || 0 })
      );
      mesh.position.set(x, y, z);
      mesh.castShadow = opts.shadow !== false;
      mesh.receiveShadow = true;
      this.root.add(mesh);
      return mesh;
    }
    addCollider(data) {
      const [x, z, w, d, h] = data;
      this.colliders.push({ x, z, w, d, h, minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2 });
    }
    clearGroup(group) {
      while (group.children.length) {
        const child = group.children.pop();
        child.parent = null;
      }
      group.clear();
    }
    makePalm(x, z, scale = 1) {
      const trunk = this.cylinder(x, 1.6 * scale, z, 0.18 * scale, 0.28 * scale, 3.2 * scale, 0x99714b, 10);
      trunk.rotation.z = (x % 2 ? 0.14 : -0.13);
      for (let i = 0; i < 5; i++) {
        const angle = i / 5 * Math.PI * 2;
        const leaf = new THREE.Mesh(
          new THREE.ConeGeometry(0.48 * scale, 2.6 * scale, 7),
          new THREE.MeshStandardMaterial({ color: i % 2 ? 0x39a86b : 0x65bd75, roughness: 0.82 })
        );
        leaf.position.set(x + Math.cos(angle) * 0.8 * scale, 3.0 * scale, z + Math.sin(angle) * 0.8 * scale);
        leaf.rotation.z = Math.cos(angle) * 0.95;
        leaf.rotation.x = Math.sin(angle) * 0.95;
        leaf.castShadow = true;
        this.root.add(leaf);
      }
      return trunk;
    }
    makeBuilding(x, z, w, d, h, color, accent) {
      this.box(x, h / 2 - 0.2, z, w, h, d, color, { roughness: 0.82, shadow: false });
      this.box(x, h - 0.36, z, w + 0.4, 0.42, d + 0.4, accent, { metalness: 0.2 });
      const columns = Math.max(2, Math.floor(w / 3));
      for (let c = 0; c < columns; c++) {
        const wx = x - w / 2 + 1.4 + c * (w - 2.8) / Math.max(1, columns - 1);
        for (let row = 0; row < Math.floor(h / 4); row++) {
          this.box(wx, 1.5 + row * 3.2, z - d / 2 - 0.03, 0.9, 1.4, 0.07, row % 2 ? 0xf3c879 : 0x73b7c0, { glow: 0.15, shadow: false });
        }
      }
    }
    build(mapId, mode) {
      this.clear();
      const cfg = MAPS[mapId] || MAPS.neon;
      this.config = cfg;
      this.scene.background = new THREE.Color(cfg.sky);
      this.scene.fog = new THREE.Fog(cfg.fog, 62, mapId === 'skyfall' ? 135 : 155);

      const floor = new THREE.Mesh(
        new THREE.BoxGeometry(76, 1.2, 76),
        new THREE.MeshStandardMaterial({ color: cfg.floor, roughness: 0.9 })
      );
      floor.position.y = -0.62;
      floor.receiveShadow = true;
      this.root.add(floor);
      const surface = new THREE.Mesh(
        new THREE.PlaneGeometry(72, 72),
        new THREE.MeshStandardMaterial({ color: cfg.floor, roughness: 0.88 })
      );
      surface.rotation.x = -Math.PI / 2;
      surface.position.y = 0.012;
      surface.receiveShadow = true;
      this.root.add(surface);

      const grid = new THREE.GridHelper(72, 36, cfg.accent, cfg.grid);
      grid.position.y = 0.028;
      grid.material.transparent = true;
      grid.material.opacity = 0.25;
      this.root.add(grid);

      this.buildPerimeter(cfg);
      cfg.obstacles.forEach((o, i) => {
        const [x, z, w, d, h] = o;
        const colour = mapId === 'factory' ? (i % 2 ? 0x65777a : 0x495c63)
          : mapId === 'tropical' ? (i % 2 ? 0x8fbd82 : 0x6b9d6d)
          : mapId === 'skyfall' ? (i % 2 ? 0x697eaa : 0x51648b)
          : (i % 2 ? 0x768b93 : 0x526a79);
        this.box(x, h / 2, z, w, h, d, colour, { roughness: 0.68, metalness: mapId === 'factory' ? 0.22 : 0.04 });
        this.box(x, h + 0.08, z, w + 0.12, 0.15, d + 0.12, cfg.accent, { emissive: cfg.accent, glow: 0.1, shadow: false });
        this.addCollider(o);
        if (mapId === 'factory') {
          for (let n = -1; n <= 1; n++) this.box(x + n * (w / 3), h + 0.18, z, 0.11, 0.08, d - 0.3, 0xffca68, { shadow: false });
        }
        if (mapId === 'tropical') {
          this.cylinder(x, h + 0.17, z, 0.2, 0.2, 0.16, 0x7b5b3a, 12);
        }
      });

      // Map-specific landmarks and scenery.
      if (mapId === 'neon') {
        for (let i = 0; i < 12; i++) {
          const a = i / 12 * Math.PI * 2;
          const x = Math.sin(a) * 55;
          const z = Math.cos(a) * 55;
          this.makeBuilding(x, z, 9 + i % 3 * 2, 9, 15 + (i % 4) * 5, i % 2 ? 0x496878 : 0x3f5968, cfg.accent);
        }
        this.box(0, 2.3, 22, 3.4, 4.6, 3.4, 0x253a49, { metalness: 0.25 });
        this.cylinder(0, 4.8, 22, 1.25, 1.25, 0.18, cfg.accent, 24, { emissive: cfg.accent, glow: 0.8 });
        this.box(0, 1.4, 7, 12, 0.2, 0.25, 0xffca70, { emissive: 0xffca70, glow: 0.3 });
      } else if (mapId === 'tropical') {
        const water = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshStandardMaterial({ color: 0x3c9eb0, roughness: 0.3, metalness: 0.1 }));
        water.rotation.x = -Math.PI / 2;
        water.position.y = -1.12;
        this.root.add(water);
        for (let i = 0; i < 14; i++) {
          const a = i / 14 * Math.PI * 2;
          const r = 43 + i % 3 * 5;
          this.makePalm(Math.sin(a) * r, Math.cos(a) * r, 0.8 + (i % 3) * 0.12);
        }
        this.box(0, 0.4, -1, 9, 0.8, 4, 0x97734d);
        for (let i = 0; i < 4; i++) this.box(-3.3 + i * 2.2, 0.85, -1, 0.16, 0.15, 4.2, 0xf0d28f);
        this.cylinder(-27, 0.15, 0, 2.1, 2.1, 0.3, 0x42ad9b, 20);
      } else if (mapId === 'factory') {
        for (let i = 0; i < 4; i++) {
          const x = -25 + i * 16;
          this.box(x, 2.3, -34, 7, 4.6, 1.5, 0x5b6a70, { metalness: 0.35 });
          this.cylinder(x + 1.8, 6.2, -34, 0.55, 0.7, 3.4, 0x56676e, 12, { metalness: 0.4 });
          this.cylinder(x + 1.8, 8.0, -34, 0.56, 0.6, 0.18, 0xff795f, 12, { emissive: 0xff795f, glow: 0.35 });
        }
        for (let i = 0; i < 3; i++) {
          const group = new THREE.Group();
          group.position.set(-22 + i * 22, 0.4, -1 + i * 2);
          const belt = this.box(0, 0, 0, 9, 0.35, 2.5, 0x243940, { metalness: 0.4 });
          group.add(belt);
          for (let n = 0; n < 6; n++) {
            const roller = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 2.6, 10), new THREE.MeshStandardMaterial({ color: 0x99a6a3, metalness: 0.65 }));
            roller.rotation.z = Math.PI / 2;
            roller.position.set(-3.8 + n * 1.5, -0.2, 0);
            group.add(roller);
          }
          this.root.add(group);
          this.moving.push({ object: group, speed: i % 2 ? -0.35 : 0.35, type: 'belt' });
        }
      } else {
        // Floating islands, suspension cables and airship silhouettes.
        for (let i = 0; i < 7; i++) {
          const a = i / 7 * Math.PI * 2;
          const x = Math.sin(a) * 44;
          const z = Math.cos(a) * 44;
          const island = this.cylinder(x, 3.3 + i % 3, z, 5.5, 4.2, 1.5, i % 2 ? 0x7a88a8 : 0x6677a0, 7);
          island.rotation.x = 0.1;
          for (let c = 0; c < 3; c++) this.cylinder(x + (c - 1) * 1.2, -0.4, z, 0.3, 0.05, 5 + c, 0x53638b, 7);
        }
        const balloon = this.cylinder(0, 17, -43, 3.2, 3.2, 7, 0x9f8ce6, 18);
        balloon.rotation.z = Math.PI / 2;
        for (let i = 0; i < 3; i++) this.box(-2 + i * 2, 12.3, -43, 1.8, 0.3, 1.7, 0x5c6585);
      }

      // Delivery pads. Team mode uses the left and right depot as separate team goals.
      cfg.zones.forEach((zone, index) => {
        const padMat = new THREE.MeshStandardMaterial({ color: index ? 0x4d8de1 : 0x2e8c78, emissive: index ? 0x15385e : 0x0c4337, emissiveIntensity: 0.45, roughness: 0.42 });
        const pad = this.cylinder(zone.x, 0.09, zone.z, zone.r + 0.3, zone.r + 0.3, 0.18, index ? 0x4d8de1 : 0x4bd4be, 32);
        pad.material.dispose();
        pad.material = padMat;
        const torus = new THREE.Mesh(
          new THREE.TorusGeometry(zone.r, 0.15, 10, 56),
          new THREE.MeshStandardMaterial({ color: index ? 0x70b6ff : 0x70efcf, emissive: index ? 0x2364a8 : 0x1b9475, emissiveIntensity: 1.1, roughness: 0.2 })
        );
        torus.rotation.x = Math.PI / 2;
        torus.position.set(zone.x, 0.24, zone.z);
        this.root.add(torus);
        const light = new THREE.PointLight(index ? 0x62b5ff : 0x5dffdc, 16, 16, 2);
        light.position.set(zone.x, 3.1, zone.z);
        this.root.add(light);
        this.zones.push({ x: zone.x, z: zone.z, r: zone.r, team: mode === 'team' ? index : null, torus, light });
      });

      if (mode === 'survival') this.createSafeRing();
      this.deliveryObjects = this.root.children.filter((child) => child.isMesh && child.geometry && child.geometry.type === 'TorusGeometry');
    }
    buildPerimeter(cfg) {
      const mat = new THREE.MeshStandardMaterial({ color: 0x8fa7ad, metalness: 0.45, roughness: 0.45 });
      for (let side = -1; side <= 1; side += 2) {
        this.box(side * 36, 0.34, 0, 0.42, 0.68, 72, mat.color);
        this.box(0, 0.34, side * 36, 72, 0.68, 0.42, mat.color);
        this.box(side * 36, 0.76, 0, 0.12, 0.1, 72, cfg.accent, { emissive: cfg.accent, glow: 0.3, shadow: false });
        this.box(0, 0.76, side * 36, 72, 0.1, 0.12, cfg.accent, { emissive: cfg.accent, glow: 0.3, shadow: false });
      }
    }
    createSafeRing() {
      this.safeRadius = 34;
      this.safeRing = new THREE.Mesh(
        new THREE.TorusGeometry(this.safeRadius, 0.18, 8, 112),
        new THREE.MeshStandardMaterial({ color: 0xff765e, emissive: 0xc23f2e, emissiveIntensity: 1.25, roughness: 0.25 })
      );
      this.safeRing.rotation.x = Math.PI / 2;
      this.safeRing.position.y = 0.26;
      this.root.add(this.safeRing);
    }
    setSafeRadius(radius) {
      this.safeRadius = radius;
      if (this.safeRing) this.safeRing.scale.set(radius / 34, radius / 34, 1);
    }
    supportHeight(x, z, previousY) {
      let height = 0;
      for (const b of this.colliders) {
        if (x > b.minX - 0.32 && x < b.maxX + 0.32 && z > b.minZ - 0.32 && z < b.maxZ + 0.32 && previousY >= b.h - 0.12) {
          height = Math.max(height, b.h);
        }
      }
      return height;
    }
    resolve(entity) {
      const position = entity.position || entity;
      const radius = 0.43;
      for (const b of this.colliders) {
        if (position.y > b.h + 0.25) continue;
        const closestX = clamp(position.x, b.minX, b.maxX);
        const closestZ = clamp(position.z, b.minZ, b.maxZ);
        const dx = position.x - closestX;
        const dz = position.z - closestZ;
        const d2 = dx * dx + dz * dz;
        if (d2 < radius * radius) {
          if (d2 > 0.0001) {
            const d = Math.sqrt(d2);
            const push = radius - d;
            position.x += dx / d * push;
            position.z += dz / d * push;
          } else {
            const edges = [
              [Math.abs(position.x - b.minX), 'x', b.minX - radius],
              [Math.abs(b.maxX - position.x), 'x', b.maxX + radius],
              [Math.abs(position.z - b.minZ), 'z', b.minZ - radius],
              [Math.abs(b.maxZ - position.z), 'z', b.maxZ + radius]
            ].sort((a, b) => a[0] - b[0]);
            position[edges[0][1]] = edges[0][2];
          }
          entity.velocity.x *= 0.35;
          entity.velocity.z *= 0.35;
        }
      }
      position.x = clamp(position.x, -34.3, 34.3);
      position.z = clamp(position.z, -34.3, 34.3);
    }
    update(delta) {
      this.time += delta;
      this.moving.forEach((item) => {
        if (item.type === 'belt') item.object.children.forEach((child, index) => { if (index > 0) child.rotation.x += delta * item.speed * 2; });
      });
      this.zones.forEach((zone, index) => {
        zone.torus.scale.setScalar(1 + Math.sin(this.time * 2.4 + index) * 0.025);
        zone.light.intensity = 14 + Math.sin(this.time * 2.2 + index) * 2;
      });
    }
  }

  class Runner {
    constructor(scene, name, colour, bot) {
      this.name = name;
      this.bot = bot;
      this.colour = colour;
      this.baseColour = colour;
      this.team = 0;
      this.scene = scene;
      this.group = new THREE.Group();
      this.scene.add(this.group);
      this.position = this.group.position;
      this.velocity = new THREE.Vector3();
      this.score = 0;
      this.deliveries = 0;
      this.stolen = 0;
      this.goldDeliveries = 0;
      this.carrying = null;
      this.grounded = true;
      this.jumpCount = 0;
      this.jumpPadCooldown = 0;
      this.stun = 0;
      this.protection = 0;
      this.interactCooldown = 0;
      this.pushCooldown = 0;
      this.animation = Math.random() * 5;
      this.target = null;
      this.think = Math.random();
      this.lastPosition = new THREE.Vector3();
      this.stuckTime = 0;
      this.alive = true;
      this.outsideTime = 0;
      this.survivalTime = 0;
      this.createModel();
    }
    material(color, roughness = 0.65, metalness = 0.04) {
      return new THREE.MeshStandardMaterial({ color, roughness, metalness });
    }
    createModel() {
      const uniform = this.material(this.colour);
      const skin = this.material(0xf2c7a3, 0.8);
      const dark = this.material(0x293c48, 0.78);
      const accent = this.material(0xffd16c, 0.48, 0.1);
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.76, 5, 10), uniform);
      body.position.y = 1.08;
      body.castShadow = true;
      this.group.add(body);
      this.body = body;
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.36, 18, 14), skin);
      head.position.y = 2.0;
      head.castShadow = true;
      this.group.add(head);
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.39, 16, 10), uniform);
      cap.scale.y = 0.48;
      cap.position.set(0, 2.31, 0.02);
      cap.castShadow = true;
      this.group.add(cap);
      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.09, 0.1), accent);
      visor.position.set(0, 2.14, -0.32);
      this.group.add(visor);

      this.arms = [];
      this.legs = [];
      for (const side of [-1, 1]) {
        const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.42, 3, 8), uniform);
        arm.position.set(side * 0.49, 1.21, 0.02);
        arm.rotation.z = side * -0.22;
        arm.castShadow = true;
        this.group.add(arm);
        this.arms.push(arm);
        const hand = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), skin);
        hand.position.set(side * 0.52, 0.92, 0.02);
        this.group.add(hand);
        const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.35, 3, 8), dark);
        leg.position.set(side * 0.2, 0.34, 0.02);
        leg.castShadow = true;
        this.group.add(leg);
        this.legs.push(leg);
      }
      const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.59, 0.72, 0.28), dark);
      backpack.position.set(0, 1.24, 0.43);
      backpack.castShadow = true;
      this.group.add(backpack);
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.13, 0.31), accent);
      stripe.position.set(0, 1.36, 0.46);
      this.group.add(stripe);
      const teamRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.55, 0.045, 8, 32),
        new THREE.MeshStandardMaterial({ color: this.colour, emissive: this.colour, emissiveIntensity: 0.55 })
      );
      teamRing.rotation.x = Math.PI / 2;
      teamRing.position.y = 0.055;
      this.group.add(teamRing);
      this.teamRing = teamRing;
      this.uniform = uniform;

      const labelCanvas = document.createElement('canvas');
      labelCanvas.width = 256;
      labelCanvas.height = 64;
      const ctx = labelCanvas.getContext('2d');
      ctx.fillStyle = 'rgba(13,26,39,.82)';
      ctx.fillRect(6, 7, 244, 50);
      ctx.font = '700 27px Space Grotesk, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = this.bot ? '#b7c6c5' : '#ffd16c';
      ctx.fillText(this.bot ? this.name + '  ·  BOT' : 'YOU', 128, 41);
      const texture = new THREE.CanvasTexture(labelCanvas);
      const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
      label.position.y = 3.12;
      label.scale.set(2.8, 0.7, 1);
      label.renderOrder = 5;
      this.group.add(label);
      this.nameLabel = label;
    }
    setTeam(team) {
      this.team = team === null ? 0 : team;
      const colours = [0x46b9f0, 0xff765e];
      const colour = team === null ? this.baseColour : colours[team];
      if (this.uniform) this.uniform.color.setHex(colour);
      if (this.teamRing) {
        this.teamRing.material.color.setHex(colour);
        this.teamRing.material.emissive.setHex(colour);
      }
    }
    reset(x, z) {
      this.position.set(x, 0, z);
      this.velocity.set(0, 0, 0);
      this.score = this.deliveries = this.stolen = this.goldDeliveries = 0;
      this.carrying = null;
      this.grounded = true;
      this.jumpCount = 0;
      this.stun = 0;
      this.protection = 2.4;
      this.interactCooldown = 0;
      this.pushCooldown = 0;
      this.target = null;
      this.think = 0.1 + Math.random() * 0.4;
      this.stuckTime = 0;
      this.alive = true;
      this.outsideTime = 0;
      this.survivalTime = 0;
      this.group.visible = true;
      this.lastPosition.set(x, 0, z);
    }
    animate(moving, delta) {
      this.animation += delta;
      const run = moving && this.grounded ? Math.sin(this.animation * 13) : 0;
      this.body.position.y = 1.08 + (moving && this.grounded ? Math.abs(run) * 0.045 : 0);
      this.arms[0].rotation.x = moving ? run * 0.55 : 0;
      this.arms[1].rotation.x = moving ? -run * 0.55 : 0;
      this.legs[0].rotation.x = moving ? -run * 0.55 : 0;
      this.legs[1].rotation.x = moving ? run * 0.55 : 0;
      if (this.carrying) {
        this.arms[0].rotation.x = -0.58;
        this.arms[1].rotation.x = -0.58;
      }
      if (this.protection > 0) this.group.visible = (Math.floor(this.animation * 12) % 2) === 0;
      else this.group.visible = true;
      this.teamRing.material.opacity = this.protection > 0 ? 0.5 : 0.9;
    }
  }

  class ParcelManager {
    constructor(scene, arena, game) {
      this.scene = scene;
      this.arena = arena;
      this.game = game;
      this.parcels = [];
      this.time = 0;
      this.serial = 0;
      this.slots = [];
      for (let i = 0; i < 18; i++) this.parcels.push(this.makeParcel(i));
    }
    makeParcel(slot) {
      const group = new THREE.Group();
      group.visible = false;
      const material = new THREE.MeshStandardMaterial({ color: 0xc69b6d, roughness: 0.42, metalness: 0.05 });
      const tape = new THREE.MeshStandardMaterial({ color: 0xf2e6ca, roughness: 0.5 });
      const dark = new THREE.MeshStandardMaterial({ color: 0x293c48, roughness: 0.72 });
      const carton = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.68, 0.76), material);
      carton.position.y = 0.43;
      carton.castShadow = true;
      group.add(carton);
      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.7, 0.79), tape);
      strip.position.y = 0.43;
      group.add(strip);
      const sideStrip = new THREE.Mesh(new THREE.BoxGeometry(0.79, 0.12, 0.14), tape);
      sideStrip.position.y = 0.43;
      group.add(sideStrip);
      const label = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.19, 0.04), dark);
      label.position.set(0.21, 0.46, -0.395);
      group.add(label);
      const seal = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.05), tape);
      seal.position.set(0.21, 0.47, -0.423);
      group.add(seal);
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.08, 0.84), dark);
      base.position.y = 0.07;
      group.add(base);
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.68, 0.035, 8, 32),
        new THREE.MeshStandardMaterial({ color: 0xc69b6d, emissive: 0xc69b6d, emissiveIntensity: 0.2 })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.18;
      ring.visible = false;
      group.add(ring);
      const light = new THREE.PointLight(0xffcf63, 0, 5, 2);
      light.position.y = 1.2;
      group.add(light);
      this.scene.add(group);
      return {
        id: 'parcel-' + (++this.serial), slot, mesh: group, material, ring, light,
        active: false, carriedBy: null, tier: 0, x: 0, y: 0, z: 0,
        velocity: new THREE.Vector3(), bob: Math.random() * Math.PI * 2,
        respawn: 0, expires: 0
      };
    }
    rollTier() {
      let roll = Math.random() * 100;
      for (let i = 0; i < GAME.parcels.length; i++) {
        roll -= GAME.parcels[i].weight;
        if (roll <= 0) return i;
      }
      return 0;
    }
    chooseSpawn(slot) {
      const spots = GAME.spawnPoints;
      const start = Math.floor(Math.random() * spots.length);
      for (let n = 0; n < spots.length; n++) {
        const spot = spots[(start + n) % spots.length];
        const blocked = this.arena.colliders.some((box) =>
          Math.abs(spot[0] - box.x) < box.w / 2 + 1.25 && Math.abs(spot[1] - box.z) < box.d / 2 + 1.25
        );
        if (!blocked && Math.hypot(spot[0], spot[1]) < 32) return spot;
      }
      return spots[slot % spots.length];
    }
    spawn(parcel, forceGold = false) {
      const spot = this.chooseSpawn(parcel.slot);
      const tier = forceGold ? 3 : this.rollTier();
      const data = GAME.parcels[tier];
      parcel.tier = tier;
      parcel.x = spot[0];
      parcel.z = spot[1];
      parcel.y = this.arena.supportHeight(parcel.x, parcel.z, 0);
      parcel.velocity.set(0, 0, 0);
      parcel.active = true;
      parcel.carriedBy = null;
      parcel.respawn = 0;
      parcel.expires = 0;
      parcel.material.color.setHex(data.colour);
      parcel.material.emissive.setHex(data.glow);
      parcel.material.emissiveIntensity = tier >= 2 ? 0.45 : 0.13;
      parcel.mesh.scale.setScalar(data.size);
      parcel.mesh.position.set(parcel.x, parcel.y + 0.05, parcel.z);
      parcel.mesh.rotation.set(0, Math.random() * Math.PI * 2, 0);
      parcel.ring.visible = tier >= 3;
      parcel.ring.material.color.setHex(data.colour);
      parcel.ring.material.emissive.setHex(data.colour);
      parcel.light.color.setHex(data.colour);
      parcel.light.intensity = tier === 4 ? 2.2 : tier === 3 ? 1.4 : 0;
      parcel.mesh.visible = true;
      if (tier >= 3) this.game.showToast(data.label + ' PACKAGE!', data.points + ' POINTS · EVERYONE CAN SEE IT', 'gold');
      return parcel;
    }
    reset(mode) {
      this.time = 0;
      this.parcels.forEach((parcel) => {
        parcel.active = false;
        parcel.carriedBy = null;
        parcel.mesh.visible = false;
        if (parcel.mesh.parent !== this.scene) {
          parcel.mesh.parent.remove(parcel.mesh);
          this.scene.add(parcel.mesh);
        }
        parcel.respawn = 0;
      });
      if (mode === 'survival') return;
      if (mode === 'gold') {
        this.spawn(this.parcels[0], true);
        return;
      }
      for (let i = 0; i < 12; i++) this.spawn(this.parcels[i]);
    }
    availableNear(position, range = 2.6) {
      let target = null;
      let best = range;
      this.parcels.forEach((parcel) => {
        if (!parcel.active || parcel.carriedBy) return;
        const d = Math.hypot(position.x - parcel.x, position.z - parcel.z);
        if (d < best && Math.abs(position.y - parcel.y) < 2.3) {
          best = d;
          target = parcel;
        }
      });
      return target;
    }
    nearest(position, maxDistance = 90) {
      let target = null;
      let best = maxDistance;
      this.parcels.forEach((parcel) => {
        if (!parcel.active || parcel.carriedBy) return;
        const d = Math.hypot(position.x - parcel.x, position.z - parcel.z);
        const score = d + (parcel.tier >= 3 ? -1.8 : 0) + (parcel.tier >= 4 ? -1.4 : 0);
        if (score < best) {
          best = score;
          target = parcel;
        }
      });
      return target;
    }
    pickup(runner, parcel) {
      if (!parcel || !parcel.active || parcel.carriedBy || runner.carrying || !runner.alive) return false;
      parcel.carriedBy = runner;
      runner.carrying = parcel;
      parcel.mesh.parent.remove(parcel.mesh);
      runner.group.add(parcel.mesh);
      parcel.mesh.position.set(0, 1.95, -0.58);
      parcel.mesh.rotation.set(-0.12, Math.PI, 0.08);
      parcel.mesh.scale.setScalar(GAME.parcels[parcel.tier].size * 0.82);
      if (runner === this.game.player) {
        this.game.audio.play('pickup');
        this.game.showToast('PACKAGE SECURED', GAME.parcels[parcel.tier].label + ' · ' + GAME.parcels[parcel.tier].points + ' POINTS', 'good');
      }
      return true;
    }
    interact(runner) {
      if (!runner || runner.carrying || runner.interactCooldown > 0 || !runner.alive) return false;
      let carrier = null;
      let carrierDistance = 2.1;
      this.game.runners.forEach((other) => {
        if (other === runner || !other.carrying || other.protection > 0 || !other.alive) return;
        if (this.game.mode === 'team' && other.team === runner.team) return;
        const d = distance(runner, other);
        if (d < carrierDistance) {
          carrierDistance = d;
          carrier = other;
        }
      });
      if (carrier) {
        const parcel = carrier.carrying;
        carrier.carrying = null;
        parcel.carriedBy = runner;
        runner.carrying = parcel;
        parcel.mesh.parent.remove(parcel.mesh);
        runner.group.add(parcel.mesh);
        parcel.mesh.position.set(0, 1.95, -0.58);
        parcel.mesh.rotation.set(-0.12, Math.PI, 0.08);
        runner.stolen++;
        runner.interactCooldown = 0.8;
        if (runner === this.game.player || carrier === this.game.player) {
          this.game.audio.play('steal');
          this.game.showToast(runner === this.game.player ? 'CLEAN SNATCH!' : 'PACKAGE STOLEN!', runner === this.game.player ? 'You grabbed their load.' : carrier.name + ' took your parcel.', 'warn');
        }
        return true;
      }
      const parcel = this.availableNear(runner.position, 2.65);
      if (!parcel) return false;
      runner.interactCooldown = 0.22;
      return this.pickup(runner, parcel);
    }
    drop(runner, direction, thrown = true) {
      const parcel = runner.carrying;
      if (!parcel) return false;
      runner.carrying = null;
      parcel.carriedBy = null;
      parcel.mesh.parent.remove(parcel.mesh);
      this.scene.add(parcel.mesh);
      parcel.mesh.scale.setScalar(GAME.parcels[parcel.tier].size);
      parcel.x = runner.position.x + direction.x * 1.05;
      parcel.z = runner.position.z + direction.z * 1.05;
      parcel.y = runner.position.y + 1.25;
      parcel.velocity.set(direction.x * (thrown ? 9.2 : 2.2), thrown ? 6 : 2, direction.z * (thrown ? 9.2 : 2.2));
      parcel.expires = this.time + (thrown ? 16 : 12);
      parcel.mesh.rotation.set(0.15, runner.group.rotation.y, 0.12);
      parcel.active = true;
      parcel.mesh.visible = true;
      runner.interactCooldown = 0.6;
      return true;
    }
    deliver(runner, zone) {
      const parcel = runner.carrying;
      if (!parcel) return;
      const data = GAME.parcels[parcel.tier];
      let points = data.points;
      if (this.game.event && this.game.event.id === 'double') points *= 2;
      runner.score += points;
      runner.deliveries++;
      if (parcel.tier >= 3) runner.goldDeliveries++;
      if (this.game.mode === 'team') this.game.teamScores[runner.team] += points;
      this.game.onDelivery(runner, points, data);
      runner.carrying = null;
      parcel.carriedBy = null;
      parcel.active = false;
      parcel.mesh.parent.remove(parcel.mesh);
      this.scene.add(parcel.mesh);
      parcel.mesh.visible = false;
      parcel.respawn = this.time + (this.game.mode === 'gold' ? 4.0 : 3.2 + Math.random() * 1.2);
    }
    update(delta) {
      this.time += delta;
      this.parcels.forEach((parcel) => {
        if (!parcel.active) {
          if (parcel.respawn > 0 && this.time >= parcel.respawn) {
            parcel.respawn = 0;
            if (this.game.state === 'playing') this.spawn(parcel, this.game.mode === 'gold');
          }
          return;
        }
        if (parcel.carriedBy) return;
        if (parcel.expires > 0) {
          parcel.velocity.y -= 19 * delta;
          parcel.x += parcel.velocity.x * delta;
          parcel.z += parcel.velocity.z * delta;
          parcel.y += parcel.velocity.y * delta;
          const top = this.arena.supportHeight(parcel.x, parcel.z, parcel.y);
          if (parcel.velocity.y <= 0 && parcel.y <= top + 0.08) {
            parcel.y = top + 0.04;
            parcel.velocity.y = Math.max(0, -parcel.velocity.y * 0.25);
            parcel.velocity.x *= 0.76;
            parcel.velocity.z *= 0.76;
            if (parcel.velocity.lengthSq() < 0.7) parcel.velocity.set(0, 0, 0);
          }
          if (this.time >= parcel.expires) {
            parcel.active = false;
            parcel.mesh.visible = false;
            parcel.respawn = this.time + 1.2;
            return;
          }
        } else {
          parcel.y = this.arena.supportHeight(parcel.x, parcel.z, 0);
          parcel.mesh.rotation.y += delta * 0.42;
        }
        parcel.mesh.position.set(parcel.x, parcel.y + 0.05 + Math.sin(this.time * 2.2 + parcel.bob) * 0.09, parcel.z);
      });
    }
  }

  class Game {
    constructor() {
      this.canvas = $('game-canvas');
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 220);
      this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, powerPreference: 'high-performance' });
      this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.6));
      this.renderer.setSize(innerWidth, innerHeight);
      this.renderer.outputEncoding = THREE.sRGBEncoding;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.1;
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      this.hemi = new THREE.HemisphereLight(0xe2f6f1, 0x3b4851, 1.75);
      this.scene.add(this.hemi);
      this.sun = new THREE.DirectionalLight(0xfff2de, 2.5);
      this.sun.position.set(-26, 44, 19);
      this.sun.castShadow = true;
      this.sun.shadow.mapSize.set(1536, 1536);
      this.sun.shadow.camera.left = -48;
      this.sun.shadow.camera.right = 48;
      this.sun.shadow.camera.top = 48;
      this.sun.shadow.camera.bottom = -48;
      this.sun.shadow.bias = -0.0002;
      this.scene.add(this.sun);
      this.ambientFill = new THREE.PointLight(0x6bd4c8, 10, 70, 2);
      this.ambientFill.position.set(0, 13, 0);
      this.scene.add(this.ambientFill);

      this.profile = clone(DEFAULT_PROFILE);
      this.audio = new AudioSystem(this.profile);
      this.arena = new Arena(this.scene);
      this.player = new Runner(this.scene, 'YOU', 0xff765e, false);
      this.bots = GAME.names.map((name, i) => new Runner(this.scene, name, GAME.colours[i], true));
      this.runners = [this.player, ...this.bots];
      this.parcels = new ParcelManager(this.scene, this.arena, this);
      this.input = new Input(this.canvas, this);
      this.state = 'menu';
      this.mode = 'rush';
      this.mapId = 'neon';
      this.remaining = 150;
      this.elapsed = 0;
      this.yaw = 0;
      this.pitch = 0.46;
      this.cameraGoal = new THREE.Vector3();
      this.cameraLook = new THREE.Vector3();
      this.tmp = new THREE.Vector3();
      this.teamScores = [0, 0];
      this.event = null;
      this.eventNext = 28;
      this.eventTime = 0;
      this.hudTime = 0;
      this.toastTime = 0;
      this.safeRadius = 34;
      this.spectate = null;
      this.pendingAd = false;
      this.clock = new THREE.Clock();
      this.resize = this.resize.bind(this);
      this.frame = this.frame.bind(this);
      this.onVisibility = () => {
        // CrazyGames handles browser focus changes itself; pause only for a real hidden-tab break.
        if (document.hidden && this.state === 'playing') this.pause(false);
      };
      window.addEventListener('resize', this.resize);
      document.addEventListener('visibilitychange', this.onVisibility);
      this.bindUI();
      this.arena.build(this.mapId, this.mode);
      this.placeLobbyRunners();
      this.resize();
      this.updateCamera(0, true);
      this.renderer.setAnimationLoop(this.frame);
    }

    async init() {
      const loading = $('loading-screen');
      try {
        const sdkState = await window.CrazyIntegration.init();
        const stored = sdkState.profile || window.CrazyIntegration.load();
        if (stored) this.profile = this.mergeProfile(stored);
        this.audio.profile = this.profile;
        if (sdkState.ready && window.CrazyGames && window.CrazyGames.SDK.game && window.CrazyGames.SDK.game.settings) {
          this.audio.setSdkMute(!!window.CrazyGames.SDK.game.settings.muteAudio);
        }
        const user = sdkState.user || window.CrazyIntegration.getUser();
        if (user && user.username) $('profile-name').textContent = user.username.slice(0, 16).toUpperCase();
        $('sdk-status').textContent = sdkState.ready ? 'CRAZYGAMES SDK · ' + sdkState.environment.toUpperCase() : 'PRACTICE BUILD · LOCAL PROFILE';
        $('sdk-status').style.color = sdkState.ready ? 'rgba(113,225,200,.58)' : 'rgba(245,246,235,.32)';
      } catch (error) {
        console.warn('[Parcel Panic] SDK init failed:', error);
        $('sdk-status').textContent = 'PRACTICE BUILD · LOCAL PROFILE';
      }
      this.applySettings();
      this.refreshProfile();
      $('loading-progress').style.width = '100%';
      $('loading-status').textContent = 'DEPOT READY';
      window.setTimeout(() => loading.classList.add('done'), 350);
      this.audio.unlock();
    }

    mergeProfile(value) {
      const profile = clone(DEFAULT_PROFILE);
      if (value && typeof value === 'object') {
        Object.keys(profile).forEach((key) => {
          if (key === 'settings') {
            profile.settings = Object.assign({}, profile.settings, value.settings || {});
          } else if (typeof value[key] === 'number' && Number.isFinite(value[key])) {
            profile[key] = Math.max(0, value[key]);
          }
        });
      }
      return profile;
    }

    bindUI() {
      $('play-button').addEventListener('click', () => this.startMatch());
      $('again-button').addEventListener('click', () => this.startMatch());
      $('results-home-button').addEventListener('click', () => this.returnMenu());
      $('leave-button').addEventListener('click', () => this.returnMenu());
      $('pause-button').addEventListener('click', () => this.pause());
      $('resume-button').addEventListener('click', () => this.resume());
      $('sound-button').addEventListener('click', () => this.toggleSound());
      $('fullscreen-button').addEventListener('click', () => this.toggleFullscreen());
      $('settings-button').addEventListener('click', () => this.openSettings());
      $('how-button').addEventListener('click', () => this.openHowTo());
      $('modal-close').addEventListener('click', () => this.closeModal());
      $('mode-grid').addEventListener('click', (event) => {
        const button = event.target.closest('[data-mode]');
        if (!button) return;
        this.mode = button.dataset.mode;
        document.querySelectorAll('.mode-card').forEach((item) => item.classList.toggle('selected', item === button));
        this.audio.play('click');
        $('map-tag').textContent = this.mode === 'team' ? 'TWO CREWS' : this.mode === 'survival' ? 'SAFE ZONE' : this.mode === 'gold' ? 'ONE GOLD DROP' : MAPS[this.mapId].tag;
      });
      $('map-select').addEventListener('change', (event) => {
        this.mapId = event.target.value;
        $('map-tag').textContent = this.mode === 'team' ? 'TWO CREWS' : this.mode === 'survival' ? 'SAFE ZONE' : this.mode === 'gold' ? 'ONE GOLD DROP' : MAPS[this.mapId].tag;
        this.arena.build(this.mapId, this.mode);
        this.placeLobbyRunners();
        this.updateCamera(0, true);
      });
      $('reward-ad-button').addEventListener('click', () => this.watchRewardedAd());
      $('pause-button').addEventListener('pointerdown', (e) => e.stopPropagation());
      window.addEventListener('parcelpanic:sdk-settings', (event) => {
        this.audio.setSdkMute(!!event.detail.muteAudio);
      });
    }

    placeLobbyRunners() {
      this.runners.forEach((runner, i) => {
        runner.position.set(i === 0 ? 0 : 45 + i * 2, -20, i === 0 ? 0 : 45);
        runner.group.visible = i === 0;
      });
      this.player.group.rotation.y = -0.4;
    }

    resize() {
      this.camera.aspect = Math.max(320, innerWidth) / Math.max(320, innerHeight);
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(innerWidth, innerHeight);
      this.applySettings();
    }

    applySettings() {
      const quality = this.profile.settings.quality || 'high';
      const scale = quality === 'low' ? 0.85 : quality === 'medium' ? 1.15 : 1.6;
      this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, scale));
      this.renderer.shadowMap.enabled = quality !== 'low';
      this.sun.castShadow = quality === 'high';
      this.ambientFill.intensity = quality === 'low' ? 5 : 10;
    }

    refreshProfile() {
      const p = this.profile;
      const level = Math.floor(Math.sqrt(p.xp / 55)) + 1;
      const prior = 55 * (level - 1) ** 2;
      const next = 55 * level ** 2;
      $('profile-level').textContent = 'LEVEL ' + level;
      $('coin-count').textContent = p.coins.toLocaleString();
      $('profile-avatar').textContent = (p.settings.username || $('profile-name').textContent || 'P').charAt(0).toUpperCase();
      $('profile-avatar').style.background = level % 2 ? 'var(--mint)' : 'var(--gold)';
      $('profile-level').title = Math.floor((p.xp - prior) / Math.max(1, next - prior) * 100) + '% to next level';
    }

    saveProfile() {
      window.CrazyIntegration.save(this.profile);
      this.refreshProfile();
    }

    findSpawnPositions() {
      const chosen = [];
      const teamMode = this.mode === 'team';
      for (let slot = 0; slot < this.runners.length; slot++) {
        const team = teamMode ? slot % 2 : null;
        let found = null;
        const preferredAngle = team === null ? (slot / this.runners.length) * Math.PI * 2 : (team === 0 ? 0 : Math.PI);
        const lateralBias = teamMode ? ((Math.floor(slot / 2) - 1.5) * 0.22) : 0;
        for (const radius of [26, 29, 23, 20, 17]) {
          for (let step = 0; step < 80; step++) {
            const angle = preferredAngle + lateralBias + step * 0.0785;
            const x = Math.sin(angle) * radius;
            const z = Math.cos(angle) * radius;
            if (team === 0 && z < 7) continue;
            if (team === 1 && z > -7) continue;
            const blocked = this.arena.colliders.some((box) =>
              Math.abs(x - box.x) < box.w / 2 + 1.1 && Math.abs(z - box.z) < box.d / 2 + 1.1
            );
            if (blocked) continue;
            if (chosen.some((point) => Math.hypot(point.x - x, point.z - z) < 3.6)) continue;
            found = { x, z };
            break;
          }
          if (found) break;
        }
        if (!found) {
          const angle = preferredAngle + lateralBias;
          found = { x: Math.sin(angle) * 14, z: Math.cos(angle) * 14 };
        }
        chosen.push(found);
      }
      return chosen;
    }

    startMatch() {
      this.audio.unlock();
      this.audio.play('click');
      this.arena.build(this.mapId, this.mode);
      this.remaining = GAME.duration[this.mode];
      this.elapsed = 0;
      this.event = null;
      this.eventTime = 0;
      this.eventNext = this.mode === 'survival' ? 30 : 24;
      this.teamScores = [0, 0];
      this.safeRadius = 34;
      this.spectate = null;
      const spawn = this.findSpawnPositions();
      this.runners.forEach((runner, index) => {
        runner.reset(spawn[index].x, spawn[index].z);
        if (this.mode === 'team') runner.setTeam(index % 2);
        else runner.setTeam(null);
        runner.group.rotation.y = Math.atan2(-runner.position.x, -runner.position.z);
      });
      this.parcels.reset(this.mode);
      this.input.enable(true);
      this.state = 'playing';
      $('menu-screen').classList.add('hidden');
      $('game-hud').classList.remove('hidden');
      $('pause-overlay').classList.add('hidden');
      $('results-overlay').classList.add('hidden');
      $('hud-score').textContent = '000';
      $('hud-timer').textContent = '02:30';
      this.showToast('THE SHIFT IS ON', this.mode === 'survival' ? 'Stay inside the shrinking safe zone.' : 'Grab a parcel and make the drop.', 'good');
      window.CrazyIntegration.startGameplay();
      this.updateCamera(0, true);
    }

    returnMenu() {
      this.state = 'menu';
      this.input.enable(false);
      window.CrazyIntegration.stopGameplay();
      $('game-hud').classList.add('hidden');
      $('pause-overlay').classList.add('hidden');
      $('results-overlay').classList.add('hidden');
      $('menu-screen').classList.remove('hidden');
      this.placeLobbyRunners();
      this.arena.build(this.mapId, this.mode);
      this.updateCamera(0, true);
      this.refreshProfile();
    }

    pause(stopSdk = true) {
      if (this.state !== 'playing') return;
      this.state = 'paused';
      this.input.enable(false);
      if (stopSdk) window.CrazyIntegration.stopGameplay();
      $('pause-overlay').classList.remove('hidden');
    }

    resume() {
      if (this.state !== 'paused') return;
      this.state = 'playing';
      this.input.enable(true);
      $('pause-overlay').classList.add('hidden');
      this.audio.unlock();
      window.CrazyIntegration.startGameplay();
    }

    async toggleFullscreen() {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else if ($('app').requestFullscreen) await $('app').requestFullscreen();
      } catch (error) {
        console.info('[Parcel Panic] Fullscreen is unavailable:', error);
      }
    }

    toggleSound() {
      this.profile.settings.volume = this.profile.settings.volume > 0 ? 0 : 0.7;
      this.audio.play('click');
      this.saveProfile();
      $('sound-button').classList.toggle('muted', this.profile.settings.volume === 0);
    }

    showToast(title, copy, tone = '') {
      const element = $('center-toast');
      element.className = 'center-toast';
      $('toast-title').textContent = title;
      $('toast-copy').textContent = copy;
      if (tone === 'gold') $('toast-title').style.color = 'var(--gold)';
      else if (tone === 'warn') $('toast-title').style.color = 'var(--coral)';
      else $('toast-title').style.color = 'var(--mint)';
      element.classList.remove('hidden');
      this.toastTime = 2.0;
    }

    openModal(html) {
      $('modal-content').innerHTML = html;
      $('modal-overlay').classList.remove('hidden');
    }

    closeModal() {
      $('modal-overlay').classList.add('hidden');
    }

    openHowTo() {
      this.openModal(
        '<div class="eyebrow"><span></span> THE DELIVERY PLAYBOOK</div><h2>HOW TO PLAY</h2>' +
        '<div class="how-grid">' +
        '<div class="how-item"><kbd>W A S D</kbd><b>Move</b></div><div class="how-item"><kbd>MOUSE</kbd><b>Look around</b></div>' +
        '<div class="how-item"><kbd>SPACE</kbd><b>Jump / double jump</b></div><div class="how-item"><kbd>SHIFT</kbd><b>Sprint</b></div>' +
        '<div class="how-item"><kbd>E</kbd><b>Pick up / steal</b></div><div class="how-item"><kbd>Q</kbd><b>Throw parcel</b></div>' +
        '<div class="how-item"><kbd>F</kbd><b>Push rivals</b></div><div class="how-item"><kbd>ESC</kbd><b>Pause</b></div></div>' +
        '<p>Carry one parcel at a time. Rarer parcels are worth more but slow you down. Enter a delivery ring to score. In Team Delivery, use your team&#39;s coloured drop. In Last Runner Standing, keep inside the shrinking safe zone.</p>'
      );
    }

    openSettings() {
      const s = this.profile.settings;
      this.openModal(
        '<div class="eyebrow"><span></span> PERSONALISE YOUR RUN</div><h2>SETTINGS</h2>' +
        '<div class="settings-row"><label for="quality">Graphics quality</label><select id="quality"><option value="low">Low · better performance</option><option value="medium">Medium</option><option value="high">High</option></select></div>' +
        '<div class="settings-row"><label for="volume">Master volume</label><input id="volume" type="range" min="0" max="1" step="0.05" value="' + s.volume + '"></div>' +
        '<div class="settings-row"><label for="sensitivity">Camera sensitivity</label><input id="sensitivity" type="range" min="0.4" max="2" step="0.05" value="' + s.sensitivity + '"></div>' +
        '<div class="settings-row"><label for="invert">Invert camera Y</label><input id="invert" type="checkbox" ' + (s.invertY ? 'checked' : '') + '></div>' +
        '<button class="primary-button full" id="save-settings"><span>✓</span><span><b>SAVE SETTINGS</b><small>APPLY TO THIS DEVICE / ACCOUNT</small></span></button>'
      );
      $('quality').value = s.quality;
      $('save-settings').addEventListener('click', () => {
        s.quality = $('quality').value;
        s.volume = Number($('volume').value);
        s.sensitivity = Number($('sensitivity').value);
        s.invertY = $('invert').checked;
        this.applySettings();
        this.saveProfile();
        $('sound-button').classList.toggle('muted', s.volume === 0);
        this.closeModal();
      });
    }

    toggleFullscreen() {
      if (document.fullscreenElement) return document.exitFullscreen();
      const promise = $('app').requestFullscreen && $('app').requestFullscreen();
      if (promise && promise.catch) promise.catch(() => {});
    }

    interact(runner) {
      if (this.mode === 'survival') return false;
      return this.parcels.interact(runner);
    }

    throwParcel(runner) {
      if (!runner.carrying) return;
      const direction = new THREE.Vector3(-Math.sin(runner === this.player ? this.yaw : runner.group.rotation.y), 0, -Math.cos(runner === this.player ? this.yaw : runner.group.rotation.y));
      this.parcels.drop(runner, direction, true);
      if (runner === this.player) {
        this.audio.play('steal');
        this.showToast('PACKAGE THROWN', 'Get moving before someone else grabs it.', 'warn');
      }
    }

    push(runner) {
      if (runner.pushCooldown > 0 || runner.stun > 0 || !runner.alive) return;
      runner.pushCooldown = 1.45;
      let hit = false;
      this.runners.forEach((other) => {
        if (other === runner || !other.alive || other.protection > 0) return;
        if (this.mode === 'team' && other.team === runner.team) return;
        const dx = other.position.x - runner.position.x;
        const dz = other.position.z - runner.position.z;
        const d = Math.hypot(dx, dz);
        if (d < 3.25 && d > 0.001) {
          other.velocity.x += dx / d * 10.5;
          other.velocity.z += dz / d * 10.5;
          other.velocity.y = Math.max(other.velocity.y, 3.4);
          other.stun = 0.24;
          if (other.carrying && Math.random() < 0.48) this.parcels.drop(other, new THREE.Vector3(dx / d, 0, dz / d), false);
          hit = true;
        }
      });
      if (runner === this.player) this.audio.play(hit ? 'push' : 'click');
    }

    nearestZone(runner) {
      if (this.mode === 'team') return this.arena.zones.find((zone) => zone.team === runner.team) || this.arena.zones[runner.team];
      let best = null;
      let bestDistance = Infinity;
      this.arena.zones.forEach((zone) => {
        const d = Math.hypot(zone.x - runner.position.x, zone.z - runner.position.z);
        if (d < bestDistance) { bestDistance = d; best = zone; }
      });
      return best;
    }

    onDelivery(runner, points, parcelData) {
      if (runner === this.player) {
        this.audio.play('deliver');
        this.showToast('DELIVERY COMPLETE', '+' + points + ' POINTS · ' + parcelData.label, 'good');
      } else if (this.mode === 'team' && runner.team === this.player.team) {
        this.showToast('TEAM DELIVERY', '+' + points + ' FOR YOUR CREW', 'good');
      }
    }

    updateEvents(delta) {
      if (this.mode === 'survival') return;
      if (this.event) {
        this.eventTime -= delta;
        if (this.eventTime <= 0) {
          this.event = null;
          $('event-banner').classList.add('hidden');
          this.eventNext = 18 + Math.random() * 10;
        }
        return;
      }
      this.eventNext -= delta;
      if (this.eventNext > 0 || this.remaining < 20) return;
      const choices = [
        { id: 'double', title: 'DOUBLE VALUE', copy: 'Every delivery is worth twice as much.', duration: 14 },
        { id: 'speed', title: 'SPEED BOOST', copy: 'Everyone gets a burst of speed.', duration: 12 },
        { id: 'rain', title: 'PACKAGE RAIN', copy: 'Extra parcels have dropped.', duration: 10 },
        { id: 'lowg', title: 'LOW GRAVITY', copy: 'Floaty jumps for a short time.', duration: 12 }
      ];
      this.event = choices[Math.floor(Math.random() * choices.length)];
      this.eventTime = this.event.duration;
      if (this.event.id === 'rain') {
        this.parcels.parcels.filter((p) => !p.active && !p.respawn).slice(0, 4).forEach((p) => this.parcels.spawn(p));
      }
      $('event-banner').classList.remove('hidden');
      $('event-title').textContent = this.event.title;
      $('event-copy').textContent = this.event.copy;
      this.audio.play('event');
      this.eventNext = 24 + Math.random() * 12;
    }

    moveRunner(runner, delta, inputX, inputZ, jump, sprint) {
      if (!runner.alive) return;
      runner.protection = Math.max(0, runner.protection - delta);
      runner.interactCooldown = Math.max(0, runner.interactCooldown - delta);
      runner.pushCooldown = Math.max(0, runner.pushCooldown - delta);
      runner.stun = Math.max(0, runner.stun - delta);
      runner.jumpPadCooldown = Math.max(0, runner.jumpPadCooldown - delta);
      if (runner.stun <= 0) {
        let speed = sprint ? 10.8 : 7.6;
        if (runner.carrying) speed *= GAME.parcels[runner.carrying.tier].speed;
        if (this.event && this.event.id === 'speed') speed *= 1.28;
        const response = runner.grounded ? 14 : 4.5;
        const factor = 1 - Math.exp(-response * delta);
        runner.velocity.x += (inputX * speed - runner.velocity.x) * factor;
        runner.velocity.z += (inputZ * speed - runner.velocity.z) * factor;
        if (inputX === 0 && inputZ === 0) {
          runner.velocity.x *= Math.max(0, 1 - (runner.grounded ? 9 : 1) * delta);
          runner.velocity.z *= Math.max(0, 1 - (runner.grounded ? 9 : 1) * delta);
        }
        if (jump && runner.grounded) {
          runner.velocity.y = 9.5;
          runner.grounded = false;
          runner.jumpCount = 1;
          if (runner === this.player) this.audio.play('jump');
        } else if (jump && !runner.grounded && runner.jumpCount < 2) {
          runner.velocity.y = 8.8;
          runner.jumpCount = 2;
          if (runner === this.player) this.audio.play('jump');
        }
        if (Math.hypot(inputX, inputZ) > 0.08) runner.group.rotation.y = Math.atan2(-inputX, -inputZ);
      } else {
        runner.velocity.x *= Math.max(0, 1 - 2.5 * delta);
        runner.velocity.z *= Math.max(0, 1 - 2.5 * delta);
      }

      const previousY = runner.position.y;
      runner.velocity.y -= (this.event && this.event.id === 'lowg' ? 12 : 24) * delta;
      runner.position.x += runner.velocity.x * delta;
      runner.position.z += runner.velocity.z * delta;
      this.arena.resolve(runner);
      runner.position.y += runner.velocity.y * delta;
      if (runner.velocity.y <= 0) {
        const support = this.arena.supportHeight(runner.position.x, runner.position.z, previousY);
        if (runner.position.y <= support) {
          runner.position.y = support;
          runner.velocity.y = 0;
          runner.grounded = true;
          runner.jumpCount = 0;
        } else runner.grounded = false;
      } else runner.grounded = false;

      if (runner.position.y < -10) {
        if (this.mode === 'survival') this.eliminate(runner, 'FELL');
        else runner.reset(runner.team === 0 ? -20 : 20, runner.team === 0 ? 22 : -22);
      }
      runner.animate(Math.hypot(runner.velocity.x, runner.velocity.z) > 0.2, delta);
      if (runner.carrying) {
        runner.carrying.mesh.rotation.y += delta * 0.8;
      }
    }

    updateBot(bot, delta) {
      if (!bot.alive) return;
      bot.think -= delta;
      let target = null;
      if (this.mode === 'survival') {
        const radius = Math.max(0, this.safeRadius - 2.5);
        const d = Math.hypot(bot.position.x, bot.position.z);
        if (d > radius * 0.76) {
          target = { x: 0, z: 0 };
        } else {
          const enemy = this.runners.find((r) => r !== bot && r.alive && distance(r, bot) < 5);
          if (enemy) {
            target = { x: bot.position.x + (bot.position.x - enemy.position.x) * 1.4, z: bot.position.z + (bot.position.z - enemy.position.z) * 1.4 };
          } else if (bot.think <= 0 || !bot.target || !bot.target.survivalWaypoint) {
            const angle = Math.random() * Math.PI * 2;
            const roam = Math.random() * radius * 0.62;
            bot.target = { x: Math.cos(angle) * roam, z: Math.sin(angle) * roam, survivalWaypoint: true };
            bot.think = 1.0 + Math.random() * 1.8;
          }
        }
      } else if (bot.carrying) {
        target = this.nearestZone(bot);
      } else if (bot.think <= 0 || !bot.target || !bot.target.active || bot.target.carriedBy) {
        bot.target = this.parcels.nearest(bot.position, 90);
        bot.think = 0.3 + Math.random() * 0.35;
      }
      if (!target && bot.target) target = bot.target;
      if (this.mode === 'team' && !bot.carrying && bot.think <= 0) {
        const enemyCarrier = this.runners.find((r) => r !== bot && r.alive && r.carrying && r.team !== bot.team && distance(r, bot) < 9);
        if (enemyCarrier && Math.random() < 0.3) target = enemyCarrier;
      }

      let ix = 0;
      let iz = 0;
      let jump = false;
      let sprint = false;
      if (target) {
        const tx = target.x - bot.position.x;
        const tz = target.z - bot.position.z;
        const length = Math.hypot(tx, tz) || 1;
        ix = tx / length;
        iz = tz / length;
        sprint = length > 5;

        // Cheap local steering makes bots route around obstacle corners instead of pushing into them forever.
        this.arena.colliders.forEach((box) => {
          const cx = clamp(bot.position.x, box.minX - 1.5, box.maxX + 1.5);
          const cz = clamp(bot.position.z, box.minZ - 1.5, box.maxZ + 1.5);
          const awayX = bot.position.x - cx;
          const awayZ = bot.position.z - cz;
          const d = Math.hypot(awayX, awayZ);
          if (d > 0.02 && d < 2.3) {
            ix += awayX / d * 0.75;
            iz += awayZ / d * 0.75;
          }
        });
        const normal = Math.hypot(ix, iz) || 1;
        ix /= normal;
        iz /= normal;
      }

      bot.stuckTime += delta;
      const moved = Math.hypot(bot.position.x - bot.lastPosition.x, bot.position.z - bot.lastPosition.z);
      if (moved > 0.15) bot.stuckTime = 0;
      bot.lastPosition.set(bot.position.x, 0, bot.position.z);
      if (bot.stuckTime > 1.2) {
        const side = Math.random() < 0.5 ? -1 : 1;
        ix = clamp(ix + side * 0.85, -1, 1);
        iz = clamp(iz - 0.6, -1, 1);
        jump = bot.grounded;
        sprint = true;
        bot.stuckTime = 0;
      }
      if (bot.grounded && Math.random() < delta * 0.24 && target && Math.hypot(target.x - bot.position.x, target.z - bot.position.z) > 3) jump = true;
      if (this.mode !== 'survival' && !bot.carrying && bot.target && bot.target.active && distance(bot, { x: bot.target.x, z: bot.target.z }) < 1.8) {
        this.parcels.pickup(bot, bot.target);
        bot.target = null;
      }
      if (bot.carrying && target && this.mode !== 'survival' && Math.hypot(target.x - bot.position.x, target.z - bot.position.z) < 1.6) ix = iz = 0;
      this.moveRunner(bot, delta, ix, iz, jump, sprint);

      if (this.mode !== 'survival' && !bot.carrying && bot.interactCooldown <= 0 && Math.random() < delta * 0.28) this.parcels.interact(bot);
      if (bot.pushCooldown <= 0 && Math.random() < delta * 0.2) this.push(bot);
    }

    eliminate(runner, reason) {
      if (!runner.alive) return;
      runner.alive = false;
      runner.group.visible = false;
      if (runner.carrying) this.parcels.drop(runner, new THREE.Vector3(0, 0, -1), false);
      if (runner === this.player) {
        this.input.enable(false);
        this.showToast('YOU ARE OUT', reason === 'SAFE ZONE' ? 'The storm caught you. Spectating now.' : 'You fell out of the arena.', 'warn');
        this.spectate = this.runners.find((candidate) => candidate.alive && candidate !== runner) || null;
      }
    }

    updateSurvival(delta) {
      const progress = 1 - this.remaining / GAME.duration.survival;
      const radius = Math.max(5.0, 34 - progress * 29);
      this.safeRadius = radius;
      this.arena.setSafeRadius(radius);
      const alive = this.runners.filter((runner) => runner.alive);
      alive.forEach((runner) => {
        runner.survivalTime += delta;
        const outside = Math.hypot(runner.position.x, runner.position.z) > radius;
        runner.outsideTime = outside ? runner.outsideTime + delta : Math.max(0, runner.outsideTime - delta * 1.8);
        if (runner.outsideTime > 3.3) this.eliminate(runner, 'SAFE ZONE');
        else if (runner === this.player && runner.outsideTime > 0.4 && runner.outsideTime < 0.46) this.showToast('GET BACK INSIDE', 'The safe zone is closing.', 'warn');
      });
      const survivors = this.runners.filter((runner) => runner.alive);
      if (survivors.length <= 1) this.endMatch();
    }

    resolveRunnerBumps() {
      for (let i = 0; i < this.runners.length; i++) {
        const a = this.runners[i];
        if (!a.alive) continue;
        for (let j = i + 1; j < this.runners.length; j++) {
          const b = this.runners[j];
          if (!b.alive) continue;
          const dx = b.position.x - a.position.x;
          const dz = b.position.z - a.position.z;
          const d2 = dx * dx + dz * dz;
          if (d2 < 0.0001 || d2 > 0.9 * 0.9) continue;
          const d = Math.sqrt(d2);
          const nx = dx / d;
          const nz = dz / d;
          const push = (0.9 - d) * 0.5;
          a.position.x -= nx * push;
          a.position.z -= nz * push;
          b.position.x += nx * push;
          b.position.z += nz * push;
        }
      }
    }

    updateMatch(delta) {
      this.elapsed += delta;
      this.remaining -= delta;
      this.updateEvents(delta);

      this.runners.forEach((runner) => {
        if (!runner.alive) return;
        if (runner === this.player) {
          if (this.player.alive) {
            const mouse = this.input.consumeMouse();
            if (this.input.pointerLocked || this.input.dragging || this.input.coarse) {
              this.yaw -= mouse.x * 0.0024 * this.profile.settings.sensitivity;
              const invert = this.profile.settings.invertY ? -1 : 1;
              this.pitch = clamp(this.pitch + mouse.y * 0.0018 * this.profile.settings.sensitivity * invert, 0.24, 0.84);
            }
            const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
            const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
            const move = new THREE.Vector3();
            if (this.input.down('KeyW') || this.input.down('ArrowUp')) move.add(forward);
            if (this.input.down('KeyS') || this.input.down('ArrowDown')) move.sub(forward);
            if (this.input.down('KeyD') || this.input.down('ArrowRight')) move.add(right);
            if (this.input.down('KeyA') || this.input.down('ArrowLeft')) move.sub(right);
            if (move.lengthSq() > 1) move.normalize();
            const jump = this.input.consume('Space');
            const sprint = this.input.down('ShiftLeft') || this.input.down('ShiftRight');
            this.moveRunner(runner, delta, move.x, move.z, jump, sprint);
          }
        } else this.updateBot(runner, delta);
      });

      this.resolveRunnerBumps();
      if (this.mode === 'survival') {
        this.updateSurvival(delta);
      } else {
        this.parcels.update(delta);
        this.runners.forEach((runner) => {
          if (!runner.alive || !runner.carrying) return;
          const zones = this.mode === 'team' ? this.arena.zones.filter((z) => z.team === runner.team) : this.arena.zones;
          const zone = zones.find((candidate) => Math.hypot(candidate.x - runner.position.x, candidate.z - runner.position.z) < candidate.r && runner.position.y < 2.5);
          if (zone) this.parcels.deliver(runner, zone);
        });
      }

      if (this.state !== 'playing') return;
      if (this.mode === 'survival' && !this.player.alive && (!this.spectate || !this.spectate.alive)) {
        this.spectate = this.runners.find((runner) => runner.alive && runner !== this.player) || null;
      }
      if (this.remaining <= 0) {
        this.remaining = 0;
        this.endMatch();
        return;
      }
      this.updateCamera(delta);
      this.updateHud(delta);
      this.profile.playTime += delta;
    }

    endMatch() {
      if (this.state !== 'playing') return;
      this.state = 'results';
      this.input.enable(false);
      window.CrazyIntegration.stopGameplay();
      const ranking = this.runners.slice().sort((a, b) => {
        if (this.mode === 'survival' && a.alive !== b.alive) return a.alive ? -1 : 1;
        if (this.mode === 'team') return this.teamScores[b.team] - this.teamScores[a.team] || b.score - a.score;
        return b.score - a.score || b.deliveries - a.deliveries;
      });
      const teamWin = this.mode === 'team' && this.teamScores[this.player.team] > this.teamScores[1 - this.player.team];
      const won = this.mode === 'team' ? teamWin : this.mode === 'survival' ? this.player.alive && ranking[0] === this.player : ranking[0] === this.player;
      const xp = Math.round(34 + this.player.score * 0.42 + (won ? 65 : 0) + this.player.deliveries * 7);
      const coins = Math.round(18 + this.player.score * 0.18 + (won ? 48 : 0));
      this.profile.xp += xp;
      this.profile.coins += coins;
      this.profile.matches++;
      this.profile.wins += won ? 1 : 0;
      this.profile.deliveries += this.player.deliveries;
      this.profile.stolen += this.player.stolen;
      this.profile.bestScore = Math.max(this.profile.bestScore, this.player.score);
      this.profile.streak = won ? this.profile.streak + 1 : 0;
      this.saveProfile();
      if (won) {
        this.audio.play('win');
        window.CrazyIntegration.happyTime();
      } else this.audio.play('deliver');
      $('game-hud').classList.add('hidden');
      $('results-overlay').classList.remove('hidden');
      $('results-heading').textContent = won ? (this.mode === 'survival' ? 'LAST RUNNER!' : 'YOU OWNED THE DEPOT.') : (ranking[0].name + ' WINS THE SHIFT.');
      $('results-copy').textContent = this.mode === 'survival'
        ? (this.player.alive ? 'You made it through the whole shift.' : 'You were eliminated. Watch the replay and take another run.')
        : this.mode === 'team'
          ? 'Your crew scored ' + this.teamScores[this.player.team] + ' points. The rival crew scored ' + this.teamScores[1 - this.player.team] + '.'
          : 'A fresh shift is waiting. Can you top the board next time?';
      $('result-score').textContent = this.player.score;
      $('result-deliveries').textContent = this.player.deliveries;
      $('result-stolen').textContent = this.player.stolen;
      $('reward-xp').textContent = '+' + xp + ' XP';
      $('reward-coins').textContent = '+' + coins + ' COINS';
      $('result-board').innerHTML = ranking.map((runner, index) =>
        '<div class="result-row ' + (runner === this.player ? 'you' : '') + '"><span>' + (index + 1) + '</span><b>' +
        (runner.bot ? runner.name + ' <i class="bot-tag">BOT</i>' : 'YOU') + '</b><small>' +
        (this.mode === 'survival' ? (runner.alive ? 'SURVIVED' : 'OUT') : runner.deliveries + ' DELIVERIES') +
        '</small><strong>' + (this.mode === 'team' ? this.teamScores[runner.team] + ' TEAM' : runner.score) + '</strong></div>'
      ).join('');
      $('reward-ad-button').classList.toggle('hidden', !window.CrazyIntegration.isReady());
      $('reward-ad-button').dataset.coins = String(coins);
    }

    async watchRewardedAd() {
      const button = $('reward-ad-button');
      if (button.disabled) return;
      button.disabled = true;
      button.textContent = 'LOADING REWARDED AD…';
      const accepted = window.CrazyIntegration.requestRewardedAd({
        onPause: () => { this.audio.setSdkMute(true); },
        onResume: () => { this.audio.setSdkMute(false); },
        onReward: () => {
          const coins = Number(button.dataset.coins) || 0;
          this.profile.coins += coins;
          this.saveProfile();
          button.textContent = 'BONUS +' + coins + ' COINS CLAIMED';
          this.audio.play('win');
          $('reward-coins').textContent = '+' + coins * 2 + ' COINS';
        },
        onError: () => {
          button.disabled = false;
          button.textContent = 'AD NOT AVAILABLE · TRY AGAIN';
        }
      });
      if (!accepted) {
        button.disabled = false;
        button.textContent = 'AD NOT AVAILABLE · TRY AGAIN';
      }
    }

    updateHud(delta) {
      this.hudTime -= delta;
      if (this.hudTime > 0) return;
      this.hudTime = 0.12;
      const minutes = Math.floor(this.remaining / 60);
      const seconds = Math.floor(this.remaining % 60);
      $('hud-timer').textContent = String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
      $('timer-progress').style.width = clamp(this.remaining / GAME.duration[this.mode] * 100, 0, 100) + '%';
      $('hud-score').textContent = String(this.mode === 'team' ? this.teamScores[this.player.team] : this.player.score).padStart(3, '0');
      if (this.mode === 'team') {
        $('score-label').textContent = 'YOUR CREW';
        $('hud-rank').textContent = 'BLUE ' + this.teamScores[0] + ' · RED ' + this.teamScores[1];
        $('leader-title').textContent = 'CREW SCOREBOARD';
      } else if (this.mode === 'survival') {
        const alive = this.runners.filter((r) => r.alive).length;
        $('score-label').textContent = 'SURVIVORS LEFT';
        $('hud-score').textContent = String(alive).padStart(2, '0');
        $('hud-rank').textContent = this.player.alive ? 'STAY INSIDE THE RING' : 'SPECTATING';
        $('leader-title').textContent = 'LAST RUNNER';
      } else {
        $('score-label').textContent = 'YOUR SCORE';
        const rank = this.runners.filter((r) => r.score > this.player.score).length + 1;
        $('hud-rank').textContent = rank === 1 ? 'TOP COURIER' : '#' + rank + ' ON THE BOARD';
        $('leader-title').textContent = 'DEPOT RANKINGS';
      }
      const sorted = this.runners.slice().sort((a, b) => b.score - a.score);
      $('leader-list').innerHTML = sorted.slice(0, 6).map((runner, index) =>
        '<div class="leader-row ' + (runner === this.player ? 'you' : '') + '"><span class="leader-number">' + (index + 1) +
        '</span><span class="leader-name">' + (runner.bot ? runner.name + ' <i>BOT</i>' : 'YOU') +
        '</span><b class="leader-score">' + (this.mode === 'team' ? this.teamScores[runner.team] : this.mode === 'survival' ? (runner.alive ? 'IN' : 'OUT') : runner.score) + '</b></div>'
      ).join('');
      if (this.mode === 'survival') {
        $('objective-kicker').textContent = 'SAFE ZONE';
        $('objective-text').textContent = this.player.alive ? 'STAY INSIDE · ' + Math.round(this.safeRadius) + 'M RADIUS' : 'ELIMINATED · SPECTATING';
        $('objective-extra').textContent = this.player.alive ? '◎' : 'OUT';
        $('zone-label').textContent = 'SAFE ZONE';
        $('zone-distance').textContent = Math.round(Math.hypot(this.player.position.x, this.player.position.z)) + 'M FROM CENTRE';
      } else if (this.player.carrying) {
        const data = GAME.parcels[this.player.carrying.tier];
        $('objective-kicker').textContent = 'YOUR LOAD';
        $('objective-text').textContent = data.label + ' PACKAGE · ' + data.points + ' POINTS';
        $('objective-extra').textContent = 'Q';
        const zone = this.nearestZone(this.player);
        $('zone-label').textContent = this.mode === 'team' ? 'YOUR TEAM DROP' : 'DELIVERY ZONE';
        $('zone-distance').textContent = zone ? Math.round(Math.max(0, Math.hypot(zone.x - this.player.position.x, zone.z - this.player.position.z) - zone.r)) + 'M AWAY' : 'MAKE THE DROP';
      } else {
        $('objective-kicker').textContent = 'YOUR LOAD';
        $('objective-text').textContent = 'EMPTY HANDS · FIND A PARCEL';
        $('objective-extra').textContent = 'E';
        $('zone-label').textContent = this.mode === 'team' ? 'TEAM DELIVERY' : 'DELIVERY ZONE';
        $('zone-distance').textContent = this.mode === 'gold' ? 'FIND THE GOLD DROP' : 'FIND THE NEON RING';
      }
    }

    updateCamera(delta, snap = false) {
      let target = this.player;
      if (this.mode === 'survival' && !this.player.alive) target = this.spectate || this.runners.find((r) => r.alive) || this.player;
      const distanceBack = this.mode === 'survival' && !this.player.alive ? 12.5 : 10.2;
      const horizontal = Math.cos(this.pitch) * distanceBack;
      const vertical = Math.sin(this.pitch) * distanceBack;
      this.cameraGoal.set(
        target.position.x + Math.sin(this.yaw) * horizontal,
        target.position.y + vertical + 1.5,
        target.position.z + Math.cos(this.yaw) * horizontal
      );
      this.camera.position.lerp(this.cameraGoal, snap ? 1 : Math.min(1, delta * 7.8));
      this.cameraLook.set(target.position.x, target.position.y + 1.25, target.position.z);
      this.camera.lookAt(this.cameraLook);
    }

    updateMenuScene(delta) {
      this.elapsed += delta;
      this.player.group.rotation.y = Math.sin(this.elapsed * 0.42) * 0.3;
      this.player.body.position.y = 1.08 + Math.sin(this.elapsed * 1.4) * 0.025;
      this.camera.position.lerp(new THREE.Vector3(18, 13, 26), Math.min(1, delta * 1.3));
      this.camera.lookAt(0, 1.2, 0);
    }

    frame() {
      const delta = Math.min(this.clock.getDelta(), 0.04);
      this.arena.update(delta);
      if (this.state === 'playing') {
        this.updateMatch(delta);
      } else if (this.state === 'menu') {
        this.updateMenuScene(delta);
      } else if (this.state === 'paused') {
        this.updateCamera(delta);
      } else if (this.state === 'results') {
        this.updateCamera(delta);
      }
      if (this.toastTime > 0 && this.state !== 'menu') {
        this.toastTime -= delta;
        if (this.toastTime <= 0) $('center-toast').classList.add('hidden');
      }
      this.renderer.render(this.scene, this.camera);
    }

    destroy() {
      this.renderer.setAnimationLoop(null);
      window.removeEventListener('resize', this.resize);
      document.removeEventListener('visibilitychange', this.onVisibility);
      this.input.enable(false);
      this.renderer.dispose();
    }
  }

  async function boot() {
    try {
      const game = new Game();
      window.parcelPanic = game;
      await game.init();
    } catch (error) {
      console.error('[Parcel Panic] Game failed to start:', error);
      $('loading-status').textContent = 'THE DEPOT COULD NOT LOAD';
      $('loading-progress').style.background = '#ff765e';
      const status = document.createElement('small');
      status.textContent = error.message || String(error);
      status.style.color = '#ff9b87';
      $('loading-screen').appendChild(status);
    }
  }

  boot();
})();