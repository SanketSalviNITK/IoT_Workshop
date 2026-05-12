import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import * as TWEEN from '@tweenjs/tween.js';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// --- Configuration & Constants ---
// [ FACILITATOR ACTION REQUIRED ]: Paste your Supabase details here!
const SUPABASE_URL = "https://ppreqzqzftogctijyzqx.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_a9GAAtqed7CJ5WxFLAFVPg_0JgXBVqh";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let channel = null;
const COLORS = { cyan: 0x00ffcc, blue: 0x0066ff, obsidian: 0x0a192f, bg: 0x050505 };
const TEAM_NAMES_POOL = ["Vajra Vanguard", "Agni Archers", "Marut Warriors", "Gaja Guardians", "Trishul Titans", "Rudra Raiders", "Surya Sentinels", "Chandra Charioteers", "Naga Knights", "Garuda Gliders", "Indra Interceptors", "Vayu Voyagers", "Yama Yanntras", "Varuna Vikings", "Soma Strykers", "Kalki Kalas", "Bhairav Battalion", "Shakti Squad", "Brahma Bots", "Vishnu Victors", "Shiva Shrapnels", "Dhruva Drifters", "Nakshatra Navigators", "Akasha Aviators", "Prithvi Pioneers", "Jala Jets", "Tejas Troopers", "Vyom Veterans", "Agastya Alchemists", "Markandeya Mavericks"];
const ARIA_MESSAGES = ["Thermal Core Stable", "Sector 7 Intruder Detected", "Pressure Valve Optimized", "Manual Override Engaged", "Atmosphere Stabilization at 85%", "Radar Calibration Pending", "Beacon Pulse Detected", "Power Grid Synchronized", "Security Breach in Sector 4", "Oxygen Recirculation Active", "Magnetic Field Verified", "Quantum Link established"];
const PROGRESS_COLORS = [0xff3300, 0xff6600, 0xff9900, 0xffcc00, 0x33ff00, 0x00ffcc, 0x00ccff, 0xffffff];

// --- Mission Logic ---
const MISSIONS = [
    { 
        title: "The Spark", 
        desc: "Initialize the emergency beacon's status lights.", 
        challenge: (team) => `Alternating Blink: Red (D1) and Green (D2). Set the delay to exactly ${150 + (team.id * 30)}ms.`, 
        validate: (code, team) => { const d = 150 + (team.id * 30); return code.includes("D1") && code.includes("D2") && code.includes(`delay(${d})`); } 
    },
    { 
        title: "Manual Ignition", 
        desc: "Build thermal pressure in the core using the physical ignition button.", 
        challenge: (team) => `Hold the Physical Button (D0) for exactly ${2 + team.id} seconds. Watch for 'IGNITION_COMPLETE'.`, 
        validate: (code, team) => { const wait = (2 + team.id) * 1000; return code.includes("D0") && code.includes("IGNITION_COMPLETE") && code.includes(`${wait}`); } 
    },
    { 
        title: "Sonic Shield", 
        desc: "Deploy the sonar perimeter using the Ultrasonic sensor.", 
        challenge: (team) => `Trigger the Buzzer (D5) when the Ultrasonic Sensor detects an object within ${10 + team.id}cm.`, 
        validate: (code, team) => { const dist = 10 + team.id; return code.includes("D6") && code.includes("D7") && code.includes("D5") && code.includes(`< ${dist}`); } 
    },
    { 
        title: "Climate Pulse", 
        desc: "Sync DHT22 life support data with the terminal engine.", 
        challenge: (team) => `Read DHT22 (D3). Print 'BEACON_CORE_${team.id}: ' followed by the value.`, 
        validate: (code, team) => code.includes("DHT") && code.includes("D3") && code.includes(`BEACON_CORE_${team.id}`) 
    },
    { 
        title: "Sentry Acknowledge", 
        desc: "Physically acknowledge the IR intrusion alert at the station.", 
        challenge: (team) => `When IR Sensor (D8) triggers, the Buzzer must stay ON until the Physical Button (D0) is pressed. Print 'SEC_ACK_${team.id}'.`, 
        validate: (code, team) => code.includes("D8") && code.includes("D0") && code.includes(`SEC_ACK_${team.id}`) 
    },
    { 
        title: "Void Uplink", 
        desc: "Establish a secure Blynk cloud telemetry uplink.", 
        challenge: (team) => `Send Humidity to Blynk Virtual Pin V${team.id + 1} every 2 seconds.`, 
        validate: (code, team) => code.includes("Blynk.virtualWrite") && code.includes(`V${team.id + 1}`) 
    },
    { 
        title: "The Last Beacon", 
        desc: "Double-key handshake required for final rescue launch.", 
        challenge: (team) => `Print '[${team.name}]: BEACON_LAUNCH' only if BOTH the Physical Button (D0) AND the Blynk Button (V10) are pressed.`, 
        validate: (code, team) => code.includes("digitalRead(D0)") && code.includes("BLYNK_WRITE(V10)") && code.includes("BEACON_LAUNCH") 
    }
];

// --- State ---
let teams = [], scene, camera, renderer, labelRenderer, composer, controls;
let tower, island, sea, beacon, particles, finalBeam, currentTeam = null;
let sessionCode = null;
const raycaster = new THREE.Raycaster(), mouse = new THREE.Vector2();
let audioContext;

// --- Helpers ---
const playSound = (f, t, d, v = 0.1) => { if (!audioContext) return; const o = audioContext.createOscillator(), g = audioContext.createGain(); o.type = t; o.frequency.setValueAtTime(f, audioContext.currentTime); g.gain.setValueAtTime(v, audioContext.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + d); o.connect(g); g.connect(audioContext.destination); o.start(); o.stop(audioContext.currentTime + d); };
const speak = (t) => { const u = new SpeechSynthesisUtterance(t); u.rate = 0.9; u.pitch = 0.5; window.speechSynthesis.speak(u); };

// --- Initialization & Sync ---
document.getElementById('host-mode-btn').onclick = () => {
    document.getElementById('setup-main').classList.add('hidden');
    document.getElementById('host-config').classList.remove('hidden');
};

document.getElementById('join-mode-btn').onclick = () => {
    document.getElementById('setup-main').classList.add('hidden');
    document.getElementById('join-config').classList.remove('hidden');
};

document.getElementById('start-host-btn').onclick = () => {
    sessionCode = Math.floor(1000 + Math.random() * 9000).toString();
    const count = parseInt(document.getElementById('team-count').value);
    const shuffled = [...TEAM_NAMES_POOL].sort(() => 0.5 - Math.random());
    const teamData = shuffled.slice(0, count).map((name, i) => ({ id: i, name, progress: 0 }));
    initSupabaseSync(sessionCode, teamData);
};

document.getElementById('start-join-btn').onclick = () => {
    const code = document.getElementById('session-code').value;
    if (code.length === 4) initSupabaseSync(code, []);
};

function initSupabaseSync(code, initialTeams) {
    sessionCode = code;
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    channel = supabase.channel(`session_${sessionCode}`, {
        config: { broadcast: { self: true } }
    });

    channel
        .on('broadcast', { event: 'progress_update' }, ({ payload }) => {
            const { teamId, progress } = payload;
            if (teams[teamId]) updateLocalProgress(teams[teamId], progress);
        })
        .on('broadcast', { event: 'init_game' }, ({ payload }) => {
            if (teams.length === 0) initDashboard(payload.teams);
        })
        .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                if (initialTeams.length > 0) {
                    channel.send({ type: 'broadcast', event: 'init_game', payload: { teams: initialTeams } });
                    initDashboard(initialTeams);
                } else {
                    document.getElementById('current-code').innerText = "SYNCING...";
                }
            }
        });

    document.getElementById('setup-screen').style.opacity = '0';
    document.getElementById('current-code').innerText = code;
    document.getElementById('session-display').classList.remove('hidden');
    setTimeout(() => { document.getElementById('setup-screen').classList.add('hidden'); }, 1000);
}

function initDashboard(teamData) {
    if (teams.length > 0) return;
    document.getElementById('dashboard').classList.remove('hidden');
    teams = teamData.map(t => ({ ...t, node: null, diamond: null }));
    
    setupThreeJS();
    setupInteractions();
    renderTeamList();
    startAriaLog();
    cinematicIntro();
}

function setupThreeJS() {
    const canvas = document.getElementById('canvas3d');
    scene = new THREE.Scene();
    scene.background = new THREE.Color(COLORS.bg);
    scene.fog = new THREE.FogExp2(COLORS.bg, 0.005);
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
    camera.position.set(400, 300, 400);
    
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';
    document.body.appendChild(labelRenderer.domElement);

    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85));
    
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- Textures ---
    const texLoader = new THREE.TextureLoader();
    const rockTex = texLoader.load('dark_tectonic_rock_texture_1778559759322.png');
    const metalTex = texLoader.load('brushed_scifi_metal_texture_1778559773847.png');

    // Environment
    const starGeo = new THREE.BufferGeometry();
    const starPos = [], starCols = [];
    const pool = [new THREE.Color(0x00ffcc), new THREE.Color(0x0066ff), new THREE.Color(0xff00ff)];
    for(let i=0; i<4000; i++) {
        starPos.push((Math.random()-0.5)*2000, (Math.random()-0.5)*2000, (Math.random()-0.5)*2000);
        const c = pool[Math.floor(Math.random()*3)];
        starCols.push(c.r, c.g, c.b);
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.Float32BufferAttribute(starCols, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 0.8, vertexColors: true })));
    
    const pLight = new THREE.PointLight(0xff00ff, 500, 200); pLight.position.set(-100, 50, -100); scene.add(pLight);

    // Island & Tower
    const islandMat = new THREE.MeshStandardMaterial({ 
        map: rockTex,
        roughness: 0.9, 
        metalness: 0.1, 
        flatShading: false, 
        emissive: 0x00ffcc, 
        emissiveIntensity: 0.2 
    });
    island = new THREE.Mesh(new THREE.CylinderGeometry(60, 65, 2, 32), islandMat); island.position.y = -1; scene.add(island);

    tower = new THREE.Group();
    const towerMat = new THREE.MeshStandardMaterial({ 
        map: metalTex,
        roughness: 0.5, 
        metalness: 0.9, 
        emissive: 0x0066ff, 
        emissiveIntensity: 0.2 
    });
    const b = new THREE.Mesh(new THREE.CylinderGeometry(8, 10, 10, 6), towerMat); b.position.y = 5; tower.add(b);
    const s = new THREE.Mesh(new THREE.CylinderGeometry(4, 6, 30, 6), towerMat); s.position.y = 25; tower.add(s);
    const d = new THREE.Mesh(new THREE.CylinderGeometry(8, 4, 2, 6), towerMat); d.position.y = 41; tower.add(d);
    scene.add(tower);

    // Beacon
    beacon = new THREE.Group();
    beacon.add(new THREE.Mesh(new THREE.CylinderGeometry(1, 1.5, 6, 6), new THREE.MeshPhongMaterial({ color: COLORS.cyan, emissive: COLORS.cyan, emissiveIntensity: 2 })));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(3, 0.2, 16, 100), new THREE.MeshPhongMaterial({ color: COLORS.blue, emissive: COLORS.blue, emissiveIntensity: 5 }));
    ring.rotation.x = Math.PI/2; beacon.add(ring); beacon.ring = ring;
    beacon.position.y = 46; scene.add(beacon);

    // Ocean
    sea = new THREE.Mesh(new THREE.CircleGeometry(2000, 32), new THREE.MeshStandardMaterial({ color: 0x000b1a, roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.8 }));
    sea.rotation.x = -Math.PI/2; sea.position.y = -2; scene.add(sea);
    // Grid removed as per request

    // Victory Beam
    finalBeam = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 2, 1, 32), new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 20, transparent: true, opacity: 0.9 }));
    finalBeam.position.y = 52; finalBeam.scale.y = 0.01; finalBeam.visible = false; scene.add(finalBeam);

    // Particles
    const pGeo = new THREE.BufferGeometry(), pP = new Float32Array(500 * 3);
    for(let i=0; i<500; i++) { pP[i*3+1] = -100; }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pP, 3));
    particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: COLORS.cyan, size: 0.4, transparent: true, opacity: 0.8 }));
    scene.add(particles);

    // Relay Nodes
    teams.forEach((t, i) => {
        const a = (i / teams.length) * Math.PI * 2, r = 70;
        const group = new THREE.Group();
        group.add(new THREE.Mesh(new THREE.BoxGeometry(4, 1, 4), new THREE.MeshPhongMaterial({ color: 0x111111 })));
        const diam = new THREE.Mesh(new THREE.OctahedronGeometry(1.5), new THREE.MeshPhongMaterial({ color: PROGRESS_COLORS[0], emissive: PROGRESS_COLORS[0], emissiveIntensity: 2 }));
        diam.position.y = 3; group.add(diam);
        
        group.position.set(Math.cos(a)*r, 0, Math.sin(a)*r);
        scene.add(group);
        t.node = group; t.diamond = diam;

        const div = document.createElement('div'); div.className = 'team-label'; div.textContent = t.name;
        const lab = new CSS2DObject(div); lab.position.set(0, 5, 0); group.add(lab);
    });

    animate();
}

function setupInteractions() {
    window.addEventListener('click', (e) => {
        mouse.x = (e.clientX/window.innerWidth)*2-1; mouse.y = -(e.clientY/window.innerHeight)*2+1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(teams.map(t => t.diamond));
        if (intersects.length > 0) {
            currentTeam = teams.find(t => t.diamond === intersects[0].object);
            if (currentTeam.progress < 7) openBriefing(currentTeam);
        }
    });
    document.getElementById('close-modal').onclick = () => document.getElementById('briefing-modal').classList.add('hidden');
    document.getElementById('submit-code').onclick = () => {
        const code = document.getElementById('code-input').value;
        const m = MISSIONS[currentTeam.progress];
        const res = document.getElementById('validation-msg');
        if (m.validate(code, currentTeam)) {
            res.className = "success-msg"; res.innerText = "VERIFIED. SYNCING..."; playSound(880, 'sine', 0.2);
            setTimeout(() => { 
                document.getElementById('briefing-modal').classList.add('hidden');
                updateProgress(currentTeam, currentTeam.progress + 1);
            }, 1000);
        } else {
            res.className = "error-msg"; res.innerText = "LOGIC ERROR. CHECK CHALLENGE."; playSound(150, 'sawtooth', 0.4);
        }
    };
}

function openBriefing(t) {
    const m = MISSIONS[t.progress];
    document.getElementById('modal-team-name').innerText = t.name;
    document.getElementById('modal-mission-num').innerText = t.progress + 1;
    document.getElementById('mission-desc').innerText = m.desc;
    document.getElementById('mission-challenge').innerText = m.challenge(t);
    document.getElementById('validation-msg').innerText = "";
    document.getElementById('code-input').value = "";
    document.getElementById('briefing-modal').classList.remove('hidden');
    playSound(600, 'square', 0.1, 0.05);
}

function updateProgress(t, p) {
    if (channel) {
        channel.send({
            type: 'broadcast',
            event: 'progress_update',
            payload: { teamId: t.id, progress: p }
        });
    }
    updateLocalProgress(t, p);
}

function updateLocalProgress(t, p) {
    t.progress = p;
    const c = PROGRESS_COLORS[p];
    if (t.diamond) {
        t.diamond.material.color.set(c); 
        t.diamond.material.emissive.set(c);
    }
    renderTeamList();
    updateGlobalStatus();
    speak(`${t.name} synchronized for phase ${p}.`);
    if (teams.every(team => team.progress === 7)) triggerVictorySequence();
}

function updateGlobalStatus() {
    const p = Math.floor((teams.reduce((acc, t) => acc + t.progress, 0) / (teams.length * 7)) * 100);
    document.getElementById('global-percent').innerText = `${p}%`;
    document.getElementById('global-bar-fill').style.width = `${p}%`;
}

function renderTeamList() {
    const l = document.getElementById('team-list'); l.innerHTML = '';
    teams.forEach(t => {
        const row = document.createElement('div'); row.className = 'team-row';
        row.innerHTML = `
            <div class="team-info"><span>${t.name}</span><span>${t.progress}/7</span></div>
            <div class="team-progress" data-team-id="${t.id}">
                ${Array(7).fill(0).map((_, i) => `<div class="segment ${i < t.progress ? 'active' : ''}" data-idx="${i}"></div>`).join('')}
            </div>`;
        l.appendChild(row);
    });

    // Admin Override: Clicking segments manually updates progress
    document.querySelectorAll('.segment').forEach(seg => {
        seg.addEventListener('click', (e) => {
            if (!isAdmin) return; // Block if not in admin mode
            const teamId = parseInt(e.target.parentElement.dataset.teamId);
            const idx = parseInt(e.target.dataset.idx);
            const team = teams.find(t => t.id === teamId);
            updateProgress(team, idx + 1);
            playSound(440, 'sine', 0.1, 0.05);
        });
    });
}

// --- Admin Toggle Logic ---
let isAdmin = false;
let keyBuffer = "";
window.addEventListener('keydown', (e) => {
    // Only record single-character keys (ignore ArrowUp, Shift, etc.)
    if (e.key.length === 1) {
        keyBuffer += e.key.toUpperCase();
        if (keyBuffer.length > 10) keyBuffer = keyBuffer.substring(1);
        
        if (keyBuffer.includes("ADM")) {
            isAdmin = true;
            speak("Admin Access Granted.");
            console.log("ADMIN MODE: ON");
            keyBuffer = "";
        } else if (keyBuffer.includes("PAR")) {
            isAdmin = false;
            speak("Admin Access Revoked.");
            console.log("ADMIN MODE: OFF");
            keyBuffer = "";
        }
    }
});

function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.001;
    TWEEN.update();
    teams.forEach((t, i) => { 
        t.diamond.rotation.y += 0.05; t.diamond.position.y = 3 + Math.sin(time*3+i)*0.5;
    });
    beacon.rotation.y -= 0.01; beacon.ring.rotation.z += 0.05; beacon.ring.position.y = Math.sin(time*3)*1;
    
    // Improved Particle Flow Logic
    const pP = particles.geometry.attributes.position.array;
    for(let i=0; i<500; i++) {
        if(pP[i*3+1] < -50) {
            const t = teams[Math.floor(Math.random()*teams.length)];
            // Spawning probability and speed based on progress
            if(t.progress > 0 && Math.random() < (t.progress / 7)) { 
                pP[i*3] = t.node.position.x; 
                pP[i*3+1] = 3; 
                pP[i*3+2] = t.node.position.z; 
                // Store speed in a custom hidden way or just use a shared logic
            }
        } else {
            // Move towards tower top (0, 46, 0)
            const speed = 0.02 + (Math.random() * 0.02);
            pP[i*3] += (0 - pP[i*3]) * speed; 
            pP[i*3+1] += (46 - pP[i*3+1]) * speed; 
            pP[i*3+2] += (0 - pP[i*3+2]) * speed;
            
            // Reset if reached tower
            if(Math.abs(pP[i*3]) < 2 && Math.abs(pP[i*3+1]-46) < 2) pP[i*3+1] = -100;
        }
    }
    particles.geometry.attributes.position.needsUpdate = true;
    composer.render(); labelRenderer.render(scene, camera);
}

function cinematicIntro() {
    new TWEEN.Tween(camera.position).to({ x: 50, y: 40, z: 50 }, 4000).easing(TWEEN.Easing.Cubic.Out).start();
    speak("Relay Nodes deployed. All stations in line-of-sight. Proceed with initialization.");
}

function triggerVictorySequence() {
    speak("Global synchronization complete. Final beacon signal initiated. Rescue incoming.");
    playSound(220, 'square', 3.0, 0.4);
    finalBeam.visible = true;
    new TWEEN.Tween(finalBeam.scale).to({ y: 500 }, 5000).easing(TWEEN.Easing.Exponential.In).start();
    new TWEEN.Tween(finalBeam.position).to({ y: 250 }, 5000).easing(TWEEN.Easing.Exponential.In).start();
    setTimeout(() => { document.getElementById('victory-overlay').classList.remove('hidden'); }, 6000);
}

function startAriaLog() {
    const l = document.getElementById('log-content');
    setInterval(() => {
        const e = document.createElement('div'); e.className = 'log-entry';
        e.innerText = `> ${ARIA_MESSAGES[Math.floor(Math.random()*ARIA_MESSAGES.length)]}...`;
        l.prepend(e); if (l.children.length > 5) l.removeChild(l.lastChild);
        playSound(800, 'triangle', 0.05, 0.03);
    }, 5000);
}

window.onresize = () => {
    camera.aspect = window.innerWidth/window.innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight); composer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
};
