import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import * as TWEEN from '@tweenjs/tween.js';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

console.log("📡 BEACON SYSTEM: CORE LOGIC INITIALIZED.");

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
        lore: "The Great Dark has arrived. Sector 7's primary power is gone. We need to jumpstart the status LEDs to signal the rescue fleet. Without light, we are invisible.",
        docs: "Use <code>digitalWrite(D1, HIGH)</code> and <code>delay(ms)</code>. Ensure your pins (D1, D2) match the wiring directive.<br><br><a href='https://github.com/SanketSalviNITK/IoT_Workshop/tree/main/missions/mission1_spark' target='_blank' class='source-link'>> VIEW MISSION SOURCE</a>",
        challenge: (team) => `Alternating Blink: Red (D1) and Green (D2). Set the delay to exactly ${150 + (team.id * 30)}ms.`, 
        validate: (code, team) => { const d = 150 + (team.id * 30); return code.includes("D1") && code.includes("D2") && code.includes(`delay(${d})`); } 
    },
    { 
        title: "Manual Ignition", 
        desc: "Build thermal pressure in the core using the physical ignition button.", 
        lore: "The fusion core is cold. Manual compression is required. You must hold the ignition sequence until the core stabilizes at critical mass.",
        docs: "Check <code>digitalRead(D0)</code>. Use a <code>while</code> loop or <code>millis()</code> to track the duration. Output 'IGNITION_COMPLETE' to Serial.<br><br><a href='https://github.com/SanketSalviNITK/IoT_Workshop/tree/main/missions/mission2_ignition' target='_blank' class='source-link'>> VIEW MISSION SOURCE</a>",
        challenge: (team) => `Hold the Physical Button (D0) for exactly ${2 + team.id} seconds. Watch for 'IGNITION_COMPLETE'.`, 
        validate: (code, team) => { const wait = (2 + team.id) * 1000; return code.includes("D0") && code.includes("IGNITION_COMPLETE") && code.includes(`${wait}`); } 
    },
    { 
        title: "Sonic Shield", 
        desc: "Calibrate the proximity sensors to detect approaching debris.", 
        lore: "Asteroid fragments are closing in. Our sonar array is misaligned. Calibrate your proximity sensors to create a sonic perimeter.",
        docs: "Use the Ultrasonic sensor (Trig/Echo). Distance = <code>(duration/2) / 29.1</code>. Target distance must be precise.<br><br><a href='https://github.com/SanketSalviNITK/IoT_Workshop/tree/main/missions/mission3_shield' target='_blank' class='source-link'>> VIEW MISSION SOURCE</a>",
        challenge: (team) => `Distance Lock: Set your Ultrasonic sensor to trigger at exactly ${10 + (team.id * 2)}cm.`, 
        validate: (code, team) => { const dist = 10 + (team.id * 2); return code.includes("trig") && code.includes("echo") && code.includes(`${dist}`); } 
    },
    { 
        title: "Climate Control", 
        desc: "Stabilize the atmosphere by monitoring temperature fluctuations.", 
        lore: "Life support is failing. The oxygen scrubbers are overheating. Monitor the thermal fluctuations and engage the cooling fans.",
        docs: "Use the DHT11 or Analog Temp sensor. Read values using <code>analogRead()</code> or the DHT library. Log data to the Serial Plotter.<br><br><a href='https://github.com/SanketSalviNITK/IoT_Workshop/tree/main/missions/mission4_climate' target='_blank' class='source-link'>> VIEW MISSION SOURCE</a>",
        challenge: (team) => `Thermal Sync: Log temperature data. Trigger a warning if the value exceeds ${28 + team.id}°C.`, 
        validate: (code, team) => { const temp = 28 + team.id; return code.includes("Serial.print") && code.includes(`${temp}`); } 
    },
    { 
        title: "The Trace", 
        desc: "Find the hidden frequency in the electromagnetic spectrum.", 
        lore: "A faint signal is bouncing off the ionosphere. We need to trace its source using the light-sensitive array.",
        docs: "Use an LDR (Light Dependent Resistor). Map the light intensity using <code>map(val, 0, 1023, 0, 100)</code>.<br><br><a href='https://github.com/SanketSalviNITK/IoT_Workshop/tree/main/missions/mission5_trace' target='_blank' class='source-link'>> VIEW MISSION SOURCE</a>",
        challenge: (team) => `Signal Trace: Map your LDR intensity to a scale of 0-100. Trigger a pulse when intensity hits ${70 + team.id}.`, 
        validate: (code, team) => { const ldr = 70 + team.id; return code.includes("map") && code.includes(`${ldr}`); } 
    },
    { 
        title: "Uplink", 
        desc: "Establish a secure connection to the command center.", 
        lore: "The local systems are online, but we are still isolated. We need to bridge the gap between this island and the orbital command.",
        docs: "Use the <code>BlynkSimpleEsp8266</code> library. Ensure your Auth Token and WiFi credentials are correct.<br><br><a href='https://github.com/SanketSalviNITK/IoT_Workshop/tree/main/missions/mission6_uplink' target='_blank' class='source-link'>> VIEW MISSION SOURCE</a>",
        challenge: (team) => `Global Link: Successfully connect to the Blynk Cloud. Set your Virtual Pin (V1) to ${100 + team.id}.`, 
        validate: (code, team) => { const v = 100 + team.id; return code.includes("Blynk.begin") && code.includes(`V1`) && code.includes(`${v}`); } 
    },
    { 
        title: "The Beacon", 
        desc: "Full system synchronization and rescue transmission.", 
        lore: "This is it. The final sequence. All systems are green. Synchronize the pulse of the beacon with the heart of the team.",
        docs: "Combine all previous logic. Final transmission must include the 'BEACON_ACTIVE' flag and the team's unique signature.<br><br><a href='https://github.com/SanketSalviNITK/IoT_Workshop/tree/main/missions/mission7_beacon' target='_blank' class='source-link'>> VIEW MISSION SOURCE</a>",
        challenge: (team) => `Final Pulse: Synchronize a fading LED pulse with your Blynk dashboard. Flag: 'BEACON_ACTIVE_${team.id}'.`, 
        validate: (code, team) => { return code.includes("Blynk.run") && code.includes(`BEACON_ACTIVE_${team.id}`); } 
    }
];

// --- State ---
let teams = [], scene, camera, renderer, labelRenderer, composer, controls;
let tower, island, sea, beacon, particles, finalBeam, currentTeam = null;
let sessionCode = null, isHost = false, myTeamId = null, myTeamToken = null, studentName = null;
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

document.getElementById('generate-session-btn').onclick = async () => {
    const newId = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Save to Supabase
    const { error } = await supabase.from('sessions').insert([{ host_id: newId, status: 'active' }]);
    
    if (!error) {
        sessionCode = newId;
        document.getElementById('new-host-id').innerText = newId;
        document.getElementById('generate-session-btn').classList.add('hidden');
        document.getElementById('session-active-zone').classList.remove('hidden');
        speak(`Host ID ${newId} generated. Commanders are authorized.`);
    } else {
        console.error("Session creation error:", error);
        alert("Uplink failed. Check database connection.");
    }
};

document.getElementById('start-host-btn').onclick = async () => {
    const count = parseInt(document.getElementById('team-count').value);
    isHost = true;
    
    const shuffled = [...TEAM_NAMES_POOL].sort(() => 0.5 - Math.random());
    teams = shuffled.slice(0, count).map((name, i) => ({ id: i, name, progress: 0, claimed: false }));

    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('dash-session-code').innerText = sessionCode;
    
    initDashboard(teams);
    initSupabaseSync(sessionCode, teams);
    speak(`Initiating Global Sync for ${count} beacon nodes.`);
};

document.getElementById('join-mode-btn').onclick = () => {
    document.getElementById('setup-main').classList.add('hidden');
    document.getElementById('join-config').classList.remove('hidden');
};

document.getElementById('check-code-btn').onclick = async () => {
    const btn = document.getElementById('check-code-btn');
    const code = document.getElementById('session-code').value;
    const originalText = btn.innerText;

    if (code.length === 4) {
        btn.innerText = "AUTHENTICATING...";
        btn.disabled = true;

        const { data, error } = await supabase.from('sessions').select('*').eq('host_id', code).eq('status', 'active');

        if (error || !data || data.length === 0) {
            speak("Access Denied. Invalid Host Key.");
            alert("WRONG KEY: Secure link could not be established. Verify Host ID.");
            btn.innerText = originalText;
            btn.disabled = false;
            return;
        }

        sessionCode = code;
        isHost = false;
        initSupabaseSync(code, []);
        btn.innerText = "SIGNAL ESTABLISHED";
        speak("Link verified. Fetching squadron assignments.");
    } else {
        alert("Enter a valid 4-digit Host Access Key.");
    }
};

// --- Session Persistence Recovery ---
const savedSession = sessionStorage.getItem('beacon_session');
if (savedSession) {
    sessionCode = savedSession;
    const sessionCodeEl = document.getElementById('dash-session-code');
    if (sessionCodeEl) sessionCodeEl.innerText = sessionCode;
}

// --- Normalized Team Sync Logic ---


document.getElementById('start-join-btn').onclick = () => {
    const sel = document.getElementById('team-selector');
    const nameInput = document.getElementById('student-name-input').value;
    
    if (sel.value !== "" && nameInput.trim() !== "") {
        myTeamId = parseInt(sel.value);
        studentName = nameInput.trim();
        myTeamToken = Math.random().toString(36).substring(7);
        
        localStorage.setItem(`beacon_token_${sessionCode}`, myTeamToken);
        localStorage.setItem(`beacon_team_${sessionCode}`, myTeamId);
        localStorage.setItem(`beacon_name_${sessionCode}`, studentName);
        
        channel.send({
            type: 'broadcast',
            event: 'claim_team',
            payload: { teamId: myTeamId, token: myTeamToken, studentName: studentName }
        });
        
        initDashboard(teams);
        speak(`Welcome to the Signal Corps, Commander ${studentName}. The fleet is counting on you.`);
    } else {
        alert("Please provide your name and select a node.");
    }
};

const CERT_QUESTIONS = [
    { q: "Which function is used to read an LDR sensor connected to Analog pin A0?", a: ["digitalRead()", "analogRead()", "Serial.print()"], c: 1 },
    { q: "In Blynk.begin(auth, ssid, pass), what does 'ssid' represent?", a: ["Your Auth Token", "Your WiFi Network Name", "Your Team ID"], c: 1 },
    { q: "To make an LED blink every 0.5 seconds, delay() should be?", a: ["50", "500", "5000"], c: 1 },
    { q: "Which protocol did we use for real-time dashboard updates?", a: ["HTTP Request", "Supabase Broadcast", "USB Serial"], c: 1 },
    { q: "What is the standard baud rate for ESP8266 Serial communication?", a: ["9600", "115200", "1200"], c: 1 }
];

let currentQuestion = 0, examScore = 0;

function startExam() {
    currentQuestion = 0; examScore = 0;
    document.getElementById('exam-modal').classList.remove('hidden');
    loadQuestion();
}

function loadQuestion() {
    const q = CERT_QUESTIONS[currentQuestion];
    document.getElementById('question-text').innerText = q.q;
    document.getElementById('exam-progress').innerText = `Question ${currentQuestion + 1} of ${CERT_QUESTIONS.length}`;
    const grid = document.getElementById('options-grid');
    grid.innerHTML = '';
    q.a.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(i);
        grid.appendChild(btn);
    });
}

function checkAnswer(idx) {
    if (idx === CERT_QUESTIONS[currentQuestion].c) examScore++;
    currentQuestion++;
    if (currentQuestion < CERT_QUESTIONS.length) {
        loadQuestion();
    } else {
        finishExam();
    }
}

function finishExam() {
    document.getElementById('exam-modal').classList.add('hidden');
    if (examScore >= 4) {
        speak("Certification Exam Passed. Initiating final beacon signal.");
        triggerVictorySequence();
    } else {
        speak("Certification Failed. Integrity score insufficient. Retry mission.");
        alert(`Score: ${examScore}/${CERT_QUESTIONS.length}. You need 4/5 to pass.`);
    }
}

function showCertificate() {
    document.getElementById('final-cert-name').innerText = studentName || (myTeamId !== null ? teams[myTeamId].name : "Unknown Engineer");
    window.print();
}

function initSupabaseSync(code, initialTeams) {
    if (channel) {
        supabase.removeChannel(channel);
        console.log("📡 RECYCLING PREVIOUS SIGNAL CHANNEL...");
    }

    sessionCode = code;
    if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') audioContext.resume();
    
    channel = supabase.channel(`session_${sessionCode}`, {
        config: { broadcast: { self: true } }
    });

    const normalize = (s) => s.toUpperCase().replace(/[\s_]/g, '');

    channel
        .on('broadcast', { event: 'progress_update' }, ({ payload }) => {
            const { teamId, progress } = payload;
            if (teams[teamId]) updateLocalProgress(teams[teamId], progress);
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'teams', filter: `session_id=eq.${sessionCode}` }, (payload) => {
            const { team_key, progress } = payload.new;
            const team = teams.find(t => normalize(t.name).includes(normalize(team_key)));
            if (team) {
                updateLocalProgress(team, progress);
                speak(`${team.name} synchronized via Cloud Relay.`);
            }
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sync_logs', filter: `session_id=eq.${sessionCode}` }, (payload) => {
            const { team_key, mission_id, created_at, data_payload } = payload.new;
            const logContainer = document.getElementById('intel-log');
            if (!logContainer) return;

            const entry = document.createElement('div');
            const time = new Date(created_at).toLocaleTimeString();
            
            let content = `MISSION ${mission_id} LOGGED.`;
            if (data_payload) {
                const keys = Object.keys(data_payload);
                const metrics = keys.map(k => `${k}: ${data_payload[k]}`).join(' | ');
                content = `TELEMETRY: <span class="alert">${metrics}</span>`;
            }

            entry.className = 'log-entry hardware';
            entry.innerHTML = `<span class="system">[${time}]</span> 📡 <strong>${team_key}</strong>: ${content}`;
            logContainer.prepend(entry);
            
            // Stats & Buffer Limit (100)
            document.getElementById('intel-last-sync').innerText = time;
            if (logContainer.children.length > 100) logContainer.removeChild(logContainer.lastChild);
        })
        .on('broadcast', { event: 'init_game' }, ({ payload }) => {
            if (teams.length === 0) {
                teams = payload.teams;
                updateTeamSelector(payload.teams);
                document.getElementById('team-select-zone').classList.remove('hidden');
            }
        })
        .on('broadcast', { event: 'request_state' }, () => {
            if (isHost) {
                channel.send({ type: 'broadcast', event: 'init_game', payload: { teams: teams } });
            }
        })
        .on('broadcast', { event: 'claim_team' }, ({ payload }) => {
            if (teams[payload.teamId]) {
                teams[payload.teamId].claimed = true;
                if (!teams[payload.teamId].participants) teams[payload.teamId].participants = [];
                if (!teams[payload.teamId].participants.includes(payload.studentName)) {
                    teams[payload.teamId].participants.push(payload.studentName);
                }
                if (isHost) {
                    updateTeamSelector(teams);
                    renderTeamList(); // Refresh host view to show names
                }
            }
        })
        .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                if (initialTeams && initialTeams.length > 0) {
                    initDashboard(initialTeams);
                    channel.send({ type: 'broadcast', event: 'init_game', payload: { teams: initialTeams } });
                } else {
                    channel.send({ type: 'broadcast', event: 'request_state', payload: {} });
                }
            }
        });

    document.getElementById('dash-session-code').innerText = sessionCode;

    // Move Web Serial here so it always uses the LATEST sessionCode
    document.getElementById('web-serial-btn').onclick = async () => {
        if (!("serial" in navigator)) {
            alert("Web Serial API is not supported in this browser.");
            return;
        }
        try {
            const port = await navigator.serial.requestPort();
            await port.open({ baudRate: 115200 });
            speak("Direct Serial link established.");
            
            const decoder = new TextDecoderStream();
            port.readable.pipeTo(decoder.writable);
            const reader = decoder.readable.getReader();

            let buffer = "";
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                buffer += value;
                let startIdx;
                while ((startIdx = buffer.indexOf("[BEACON:SYNC:")) !== -1) {
                    let endIdx = buffer.indexOf("]", startIdx);
                    if (endIdx === -1) break;
                    const token = buffer.substring(startIdx + 1, endIdx);
                    buffer = buffer.substring(endIdx + 1);
                    const parts = token.split(":");
                    if (parts.length >= 6) {
                        const host = parts[2], teamKey = parts[3], missionNum = parseInt(parts[4]);
                        if (host === sessionCode || isHost) {
                            const team = teams.find(t => normalize(t.name).includes(normalize(teamKey)));
                            if (team) updateProgress(team, missionNum);
                        }
                    }
                }
            }
        } catch (err) { console.error(err); }
    };
}


function initDashboard(teamData) {
    document.getElementById('setup-screen').style.opacity = '0';
    document.getElementById('dash-session-code').innerText = sessionCode;
    
    setTimeout(() => { 
        document.getElementById('setup-screen').classList.add('hidden');
        const dash = document.getElementById('dashboard');
        dash.classList.remove('hidden');
        setTimeout(() => dash.style.opacity = '1', 50); // Trigger fade-in
        teams = teamData.map(t => ({ ...t, node: (teams[t.id] ? teams[t.id].node : null), diamond: (teams[t.id] ? teams[t.id].diamond : null) }));
        
        if (!scene) {
            setupThreeJS();
            setupInteractions();
            renderTeamList();
            startAriaLog();
            
            if (!isHost) playCinematic();
            else cinematicIntro();
        }
    }, 1000);
}

function playCinematic() {
    document.getElementById('intro-overlay').classList.remove('hidden');
    // Dramatic Camera Orbit
    camera.position.set(200, 100, 200);
    new TWEEN.Tween(camera.position).to({ x: 50, y: 40, z: 50 }, 20000).easing(TWEEN.Easing.Cubic.Out).start();
    speak("Incoming transmission from Sector 7. Establish secure link to begin mission.");
    
    document.getElementById('skip-intro').onclick = () => {
        document.getElementById('intro-overlay').style.opacity = '0';
        setTimeout(() => document.getElementById('intro-overlay').classList.add('hidden'), 1000);
        speak("Link established. Beacon network active.");
    };
}

function setupInteractions() {
    window.addEventListener('mousemove', (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('click', () => {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(teams.map(t => t.diamond).filter(d => d));
        if (intersects.length > 0) {
            const team = teams.find(t => t.diamond === intersects[0].object);
            if (team.progress < 7) openBriefing(team);
        }
    });

    document.getElementById('close-modal').onclick = () => document.getElementById('briefing-modal').classList.add('hidden');
    document.getElementById('verify-btn').onclick = () => {
        const code = document.getElementById('code-input').value;
        const msg = document.getElementById('validation-msg');
        if (MISSIONS[currentTeam.progress].validate(code, currentTeam)) {
            msg.className = 'success-msg';
            msg.innerText = "INTEGRITY VERIFIED. SYNCING...";
            updateProgress(currentTeam, currentTeam.progress + 1);
            setTimeout(() => document.getElementById('briefing-modal').classList.add('hidden'), 1500);
        } else {
            msg.className = 'error-msg';
            msg.innerText = "VALIDATION FAILED: LOGIC MISMATCH.";
        }
    };

    // Tab Logic
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
            btn.classList.add('active');
            const target = btn.getAttribute('data-tab');
            if (target) document.getElementById(target).classList.remove('hidden');
        };
    });

    // Roadmap Logic
    document.getElementById('roadmap-btn').onclick = () => {
        const overlay = document.getElementById('roadmap-overlay');
        overlay.classList.toggle('hidden');
        if (!overlay.classList.contains('hidden')) renderRoadmap();
    };
    document.getElementById('close-roadmap').onclick = () => document.getElementById('roadmap-overlay').classList.add('hidden');

    // Panel Toggle Logic
    document.getElementById('toggle-mission-panel').onclick = () => {
        document.getElementById('mission-panel').classList.toggle('collapsed');
    };

    document.getElementById('close-exam').onclick = () => document.getElementById('exam-modal').classList.add('hidden');
    document.getElementById('download-cert-btn').onclick = () => {
        window.print();
    };

    // --- Live Intel & Maintenance Logic ---
    const intelPanel = document.getElementById('live-intel-panel');
    document.getElementById('global-status').onclick = () => {
        intelPanel.classList.toggle('collapsed');
        if (!intelPanel.classList.contains('collapsed')) {
            speak("Live Intel Feed Synchronized.");
        }
    };
    document.getElementById('close-intel').onclick = () => intelPanel.classList.add('collapsed');

    // Data Actions
    document.getElementById('export-data-btn').onclick = async () => {
        const { data, error } = await supabase.from('sync_logs').select('*').eq('session_id', sessionCode);
        if (data) {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `beacon_session_${sessionCode}_data.json`;
            a.click();
            speak("Telemetry data exported successfully.");
        }
    };

    document.getElementById('purge-data-btn').onclick = async () => {
        if (confirm("☢️ WARNING: This will permanently delete all logs and team progress for this session. Proceed?")) {
            const { error: logErr } = await supabase.from('sync_logs').delete().eq('session_id', sessionCode);
            const { error: teamErr } = await supabase.from('teams').delete().eq('session_id', sessionCode);
            
            if (!logErr && !teamErr) {
                document.getElementById('intel-log').innerHTML = '<div class="log-entry system">> DATA PURGE COMPLETE. SECTOR RESET.</div>';
                speak("Sector 7 logs and teams cleared.");
                teams.forEach(t => { t.progress = 0; t.status = 'OFFLINE'; });
                renderRoadmap();
            }
        }
    };
}

function renderRoadmap() {
    const items = document.querySelectorAll('.roadmap-item');
    const teamProgress = (myTeamId !== null) ? teams[myTeamId].progress : 0;
    
    items.forEach((item, i) => {
        item.classList.remove('active', 'completed');
        if (i < teamProgress) item.classList.add('completed');
        else if (i === teamProgress) item.classList.add('active');
    });
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
        const a = (i / teams.length) * Math.PI * 2, r = 45;
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


function openBriefing(t) {
    if (!isHost && myTeamId !== null && myTeamId !== t.id && !isAdmin) {
        speak("Access Denied. Unauthorized secure link attempt.");
        const log = document.getElementById('log-content');
        const entry = document.createElement('div');
        entry.className = 'log-entry error-msg';
        entry.innerText = `> CRITICAL: Unauthorized access attempt on ${t.name} node.`;
        log.prepend(entry);
        return;
    }

    currentTeam = t;
    const m = MISSIONS[t.progress];
    document.getElementById('modal-team-name').innerText = t.name;
    document.getElementById('modal-mission-num').innerText = t.progress + 1;
    document.getElementById('mission-challenge').innerText = m.challenge(t);
    document.getElementById('mission-lore').innerText = m.lore;
    document.getElementById('mission-tech').innerHTML = m.docs;
    
    document.getElementById('validation-msg').innerText = "";
    document.getElementById('code-input').value = "";
    
    // Reset tabs
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    document.querySelector('[data-tab="tab-mission"]').classList.add('active');
    document.getElementById('tab-mission').classList.remove('hidden');
    
    document.getElementById('briefing-modal').classList.remove('hidden');
    
    // Add Authorization Button for Mission 7 (If Host or Admin)
    const btnContainer = document.getElementById('tab-mission');
    const existingAuthBtn = document.getElementById('remote-auth-btn');
    if (existingAuthBtn) existingAuthBtn.remove();

    if ((isHost || isAdmin) && t.progress === 6) {
        const authBtn = document.createElement('button');
        authBtn.id = 'remote-auth-btn';
        authBtn.className = 'big-btn success-msg';
        authBtn.style.marginTop = '20px';
        authBtn.innerText = '⚡ AUTHORIZE FINAL BEACON';
        authBtn.onclick = async () => {
            const { error } = await supabase.from('teams').update({ progress: 77 }).eq('team_key', t.name).eq('session_id', sessionCode);
            if (!error) {
                speak("Transmission Authorized. Awaiting hardware pulse.");
                authBtn.innerText = "WAITING FOR PULSE...";
                authBtn.disabled = true;
            }
        };
        btnContainer.appendChild(authBtn);
    }

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
    if (t.progress >= p) return;
    t.progress = p;
    const c = PROGRESS_COLORS[p];
    if (t.diamond) {
        t.diamond.material.color.set(c); 
        t.diamond.material.emissive.set(c);
    }
    renderTeamList();
    updateGlobalStatus();
    speak(`${t.name} synchronized for phase ${p}.`);
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
            <div class="team-info" style="cursor: pointer;" onclick="window.openTeamBriefing(${t.id})">
                <div class="team-meta">
                    <span class="team-name">${t.name}</span>
                    <span class="team-participants">${t.participants ? t.participants.join(', ') : ''}</span>
                </div>
                <span>${t.progress}/7</span>
            </div>
            <div class="team-progress" data-team-id="${t.id}">
                ${Array(7).fill(0).map((_, i) => `<div class="segment ${i < t.progress ? 'active' : ''}" data-idx="${i}"></div>`).join('')}
            </div>`;
        l.appendChild(row);
    });
    
    // Bind to window for the onclick string to work
    window.openTeamBriefing = (id) => {
        if (teams[id] && teams[id].progress < 7) {
            openBriefing(teams[id]);
        }
    };


    // Certification Button for Local Team (Fixed Action Bar)
    const actionsEl = document.getElementById('mission-actions');
    if (actionsEl) {
        actionsEl.innerHTML = '';
        if (myTeamId !== null && teams[myTeamId] && teams[myTeamId].progress === 7) {
            actionsEl.classList.remove('hidden');
            const certBtn = document.createElement('button');
            certBtn.id = 'start-exam-btn';
            certBtn.className = 'big-btn pulse-glowing';
            certBtn.innerText = '🎓 START CERTIFICATION EXAM';
            certBtn.onclick = startExam;
            actionsEl.appendChild(certBtn);
        } else {
            actionsEl.classList.add('hidden');
        }
    }

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

function updateTeamSelector(teamData) {
    const sel = document.getElementById('team-selector');
    if (!sel) return;
    sel.innerHTML = '<option value="" disabled selected>-- SECURE CHANNEL --</option>';
    teamData.forEach(t => {
        if (!t.claimed) {
            const opt = document.createElement('option');
            opt.value = t.id;
            opt.innerText = t.name;
            sel.appendChild(opt);
        }
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
    
    // Bind certificate function to window for the button in index.html
    window.downloadCertificate = showCertificate;

    setTimeout(() => { 
        // Hide all active dashboard panels to prevent any layout overlap
        const panelIds = ['mission-panel', 'aria-log', 'global-status', 'roadmap-btn', 'live-intel-panel'];
        panelIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('hidden');
        });
        document.getElementById('victory-overlay').classList.remove('hidden'); 
    }, 6000);
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
