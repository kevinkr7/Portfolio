// --- INITIALIZATION ---
console.clear();
const APP_STATE = {
    activeIndex: 0,
    isAnimating: false,
    totalModules: 5,
    mouse: { x: 0, y: 0 },
    lastScrollTime: 0
};

// --- DOM ELEMENTS ---
const cursorDot = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');
const modules = document.querySelectorAll('.module');
const progressRing = document.querySelector('.progress-ring');
const moduleCounter = document.getElementById('module-counter');
const glitchText = document.querySelector('.glitch-text');

// --- THREE.JS BACKGROUND ---
class NeuralNetwork {
    constructor() {
        this.container = document.getElementById('webgl-container');
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x050608, 0.002);
        
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 50;
        
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        this.particles = null;
        this.lines = null;
        this.mouseTarget = new THREE.Vector2(0, 0);
        
        this.init();
        this.animate();
        window.addEventListener('resize', this.onResize.bind(this));
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
    }

    init() {
        // Create Particles
        const particleCount = 200;
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const velocities = [];

        for (let i = 0; i < particleCount; i++) {
            positions.push((Math.random() - 0.5) * 100);
            positions.push((Math.random() - 0.5) * 100);
            positions.push((Math.random() - 0.5) * 60);
            velocities.push((Math.random() - 0.5) * 0.05); // X
            velocities.push((Math.random() - 0.5) * 0.05); // Y
            velocities.push((Math.random() - 0.5) * 0.05); // Z
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        this.particleData = { positions, velocities }; // Store for CPU update

        const material = new THREE.PointsMaterial({
            color: 0xff4d4d,
            size: 0.5,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);

        // Create Lines (pre-allocated buffer for dynamic update)
        const lineGeo = new THREE.BufferGeometry();
        // Max possible lines logic handled simplified:
        // We will just draw lines between close particles in render loop
        // But to save CPU, we use a fixed buffer and update it
        const maxLines = 300; 
        const linePos = new Float32Array(maxLines * 6); // 2 points * 3 coords
        lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
        
        const lineMat = new THREE.LineBasicMaterial({
            color: 0x00f0ff,
            transparent: true,
            opacity: 0.15,
            blending: THREE.AdditiveBlending
        });

        this.lines = new THREE.LineSegments(lineGeo, lineMat);
        this.scene.add(this.lines);
    }

    onMouseMove(e) {
        // Normalize mouse for parallax
        this.mouseTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouseTarget.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        // 1. Particle Movement
        const positions = this.particles.geometry.attributes.position.array;
        const velocities = this.particleData.velocities;
        
        for (let i = 0; i < 200; i++) {
            positions[i*3] += velocities[i*3];
            positions[i*3+1] += velocities[i*3+1];
            positions[i*3+2] += velocities[i*3+2];

            // Boundary bounce
            if(Math.abs(positions[i*3]) > 50) velocities[i*3] *= -1;
            if(Math.abs(positions[i*3+1]) > 50) velocities[i*3+1] *= -1;
            if(Math.abs(positions[i*3+2]) > 30) velocities[i*3+2] *= -1;
        }
        this.particles.geometry.attributes.position.needsUpdate = true;

        // 2. Dynamic Lines (Nearest Neighbor - Simplified)
        let lineIndex = 0;
        const linePositions = this.lines.geometry.attributes.position.array;
        
        // Loop a subset to save CPU
        for (let i = 0; i < 200; i++) {
            for (let j = i + 1; j < 200; j++) {
                const dx = positions[i*3] - positions[j*3];
                const dy = positions[i*3+1] - positions[j*3+1];
                const dz = positions[i*3+2] - positions[j*3+2];
                const distSq = dx*dx + dy*dy + dz*dz;

                if (distSq < 100) { // Threshold
                    linePositions[lineIndex++] = positions[i*3];
                    linePositions[lineIndex++] = positions[i*3+1];
                    linePositions[lineIndex++] = positions[i*3+2];
                    
                    linePositions[lineIndex++] = positions[j*3];
                    linePositions[lineIndex++] = positions[j*3+1];
                    linePositions[lineIndex++] = positions[j*3+2];

                    if (lineIndex >= 300 * 6) break;
                }
            }
        }
        // Zero out remaining lines
        for(let k=lineIndex; k<300*6; k++) linePositions[k] = 0;
        
        this.lines.geometry.attributes.position.needsUpdate = true;

        // 3. Parallax & Drift
        this.scene.rotation.y += 0.001;
        this.scene.rotation.x += 0.0005;
        
        // Mouse influence
        const targetRotX = this.mouseTarget.y * 0.2;
        const targetRotY = this.mouseTarget.x * 0.2;
        
        this.scene.rotation.x += (targetRotX - this.scene.rotation.x) * 0.05;
        this.scene.rotation.y += (targetRotY - this.scene.rotation.y) * 0.05;

        // Module transition effect (warp)
        if(APP_STATE.isAnimating) {
            this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, 30, 0.1);
        } else {
            this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, 50, 0.05);
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// --- UI & ANIMATION LOGIC ---

// 1. Intro Sequence
const runIntro = () => {
    const tl = gsap.timeline();
    
    // Log text typing
    const logs = document.querySelectorAll('.system-logs p');
    logs.forEach((log, i) => {
        tl.to(log, { opacity: 1, duration: 0.1, delay: i * 0.3 });
    });

    // Glitch Title
    tl.to('.glitch-text', { opacity: 1, duration: 0.1, onStart: scrambleTitle });
    
    // Load bar
    tl.to('.loader-bar .fill', { width: '100%', duration: 1.5, ease: 'power2.inOut' });

    // Fade out
    tl.to('#intro-screen', { 
        opacity: 0, 
        duration: 0.8, 
        delay: 0.5, 
        pointerEvents: 'none',
        onComplete: () => {
            new NeuralNetwork(); // Start WebGL only after intro
            animateModuleIn(0);
        }
    });
};

function scrambleTitle() {
    let iteration = 0;
    const originalText = glitchText.dataset.text;
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    
    const interval = setInterval(() => {
        glitchText.innerText = originalText
            .split("")
            .map((letter, index) => {
                if(index < iteration) return originalText[index];
                return letters[Math.floor(Math.random() * 26)];
            })
            .join("");
        
        if(iteration >= originalText.length) clearInterval(interval);
        iteration += 1 / 2;
    }, 30);
}

// 2. Navigation System
const updateProgress = () => {
    const progress = APP_STATE.activeIndex / (APP_STATE.totalModules - 1);
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - progress * circumference;
    progressRing.style.strokeDashoffset = offset;
    moduleCounter.innerText = `0${APP_STATE.activeIndex}`;
};

const changeModule = (direction) => {
    if (APP_STATE.isAnimating) return;
    
    const nextIndex = APP_STATE.activeIndex + direction;
    if (nextIndex < 0 || nextIndex >= APP_STATE.totalModules) return;

    APP_STATE.isAnimating = true;
    
    const currentModule = modules[APP_STATE.activeIndex];
    const nextModule = modules[nextIndex];

    // Out Animation
    gsap.to(currentModule, {
        opacity: 0,
        z: -100,
        scale: 0.9,
        duration: 0.6,
        ease: "power2.inOut",
        className: "module"
    });

    // In Animation
    APP_STATE.activeIndex = nextIndex;
    updateProgress();
    
    setTimeout(() => {
        gsap.fromTo(nextModule, 
            { opacity: 0, z: 100, scale: 1.1 },
            { 
                opacity: 1, 
                z: 0, 
                scale: 1, 
                duration: 0.6, 
                ease: "power2.out",
                className: "module active",
                onComplete: () => {
                    APP_STATE.isAnimating = false;
                    // Trigger animated counters if profile
                    if(nextIndex === 1) runCounters();
                }
            }
        );
    }, 200);
};

const animateModuleIn = (index) => {
    updateProgress();
    gsap.to(modules[index], { opacity: 1, scale: 1, z: 0, duration: 1 });
};

// 3. Input Handling
window.addEventListener('wheel', (e) => {
    const now = Date.now();
    if (now - APP_STATE.lastScrollTime > 1000) { // Debounce
        if (e.deltaY > 0) changeModule(1);
        else changeModule(-1);
        APP_STATE.lastScrollTime = now;
    }
});

// 4. Micro-Interactions
// Custom Cursor
window.addEventListener('mousemove', (e) => {
    gsap.to(cursorDot, { x: e.clientX, y: e.clientY, duration: 0.1 });
    gsap.to(cursorRing, { x: e.clientX, y: e.clientY, duration: 0.2 });
});

// Hover Scramble Effect
const scrambleElements = document.querySelectorAll('.scramble-hover');
scrambleElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursorRing.classList.add('hover-active');
        // Simple random glitch
        const original = el.innerText;
        let count = 0;
        const interval = setInterval(() => {
            el.innerText = original.split("").map((char, i) => {
                if (Math.random() > 0.5) return String.fromCharCode(65 + Math.random()*20);
                return char;
            }).join("");
            count++;
            if(count > 5) {
                clearInterval(interval);
                el.innerText = original;
            }
        }, 50);
    });
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('hover-active'));
});

// Animated Counter
const runCounters = () => {
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        gsap.to(counter, {
            innerText: target,
            duration: 2,
            snap: { innerText: 0.01 },
            ease: "power2.out"
        });
    });
};

// Start
window.onload = runIntro;