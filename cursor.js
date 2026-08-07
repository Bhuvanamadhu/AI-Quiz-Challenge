(function () {
  // Mobile / Tablet Detection
  const isMobile = window.matchMedia("(max-width: 1024px)").matches ||
                   ('ontouchstart' in window) ||
                   (navigator.maxTouchPoints > 0);

  if (isMobile) {
    console.log("📱 Custom cursor disabled on mobile/tablet device.");
    return;
  }

  // Create DOM Elements
  const arrow = document.createElement('div');
  arrow.className = 'custom-cursor-arrow';
  arrow.innerHTML = `
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block; width: 100%; height: 100%;">
      <path d="M2.5 2V21.5L8.5 15.5L14 26L18 24L12.5 13.5L20 13.5L2.5 2Z" fill="url(#cursorGradient)" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>
      <defs>
        <linearGradient id="cursorGradient" x1="0" y1="0" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#00f2fe" />
          <stop offset="50%" stop-color="#4facfe" />
          <stop offset="100%" stop-color="#a855f7" />
        </linearGradient>
      </defs>
    </svg>
  `;
  document.body.appendChild(arrow);

  const canvas = document.createElement('canvas');
  canvas.className = 'cursor-trail-canvas';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');

  // Resize canvas to full screen
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Mouse Coordinates
  let mouse = { x: -100, y: -100 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  // Track clicking state & Spawn explosive sparkles
  window.addEventListener('mousedown', (e) => {
    arrow.classList.add('clicking');
    
    // Spawn sparkle particles on click
    if (mouse.x > 0 && mouse.y > 0) {
      for (let i = 0; i < 12; i++) {
        particles.push(new SparkleParticle(mouse.x, mouse.y));
      }
    }
  });
  
  window.addEventListener('mouseup', () => {
    arrow.classList.remove('clicking');
  });

  // Broadened interactive target selectors
  const interactiveSelector = 'button, .action-btn, .quiz-option, .card, .icon-btn, .nav-btn, .cosmetic-card, .bookmark-item-card, select, input, textarea, a, img, .brand-logo, .chip-btn, .badge-item, .avatar-select-option, [style*="cursor: pointer"]';

  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest(interactiveSelector);
    if (target) {
      arrow.classList.add('hovered');
      
      // Initialize magnetic/tilt effect if not already done (skip for card elements to disable card animations)
      const isCard = target.matches('.card, [class*="-card"]');
      if (!isCard && !target.dataset.hasMagnetic) {
        initMagneticElement(target);
      }
    }
  });

  document.addEventListener('mouseout', (e) => {
    const target = e.target.closest(interactiveSelector);
    if (target) {
      arrow.classList.remove('hovered');
    }
  });

  // Magnetic & 3D Tilt Effect Initialization
  function initMagneticElement(el) {
    el.dataset.hasMagnetic = 'true';

    // Store original transition style to restore later
    const originalTransition = el.style.transition;
    const isButton = el.matches('button, .action-btn, .quiz-option, .icon-btn, .nav-btn, .chip-btn, .star-btn, [role="button"]');

    el.addEventListener('mousemove', (e) => {
      // Dynamic glowing border shadow matching the AI Theme (Cyan/Purple neon)
      el.style.boxShadow = '0 10px 25px rgba(6, 182, 212, 0.25), 0 0 15px rgba(99, 102, 241, 0.3)';

      if (!isButton) {
        const rect = el.getBoundingClientRect();
        // Center coordinates
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        
        // Distance from center
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;

        // Magnetic Pull: Translate slightly toward cursor (max 10px)
        const pullStrength = 0.15;
        const pullX = Math.max(-10, Math.min(10, dx * pullStrength));
        const pullY = Math.max(-10, Math.min(10, dy * pullStrength));

        // 3D Tilt: Rotate depending on cursor position
        const tiltStrengthX = (dy / (rect.height / 2)) * -6; // Pitch (rotates on X)
        const tiltStrengthY = (dx / (rect.width / 2)) * 6;   // Yaw (rotates on Y)

        // Apply transformations instantly during mousemove
        el.style.transition = 'none';
        el.style.transform = `perspective(1000px) translate3d(${pullX}px, ${pullY}px, 0) scale(1.04) rotateX(${tiltStrengthX}deg) rotateY(${tiltStrengthY}deg)`;
      }
    });

    el.addEventListener('mouseleave', () => {
      // Smooth return transition
      el.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.4s ease';
      if (!isButton) {
        el.style.transform = '';
      }
      el.style.boxShadow = '';
      
      // Restore original transition after return animation finishes
      setTimeout(() => {
        if (!isButton && el.style.transform === '') {
          el.style.transition = originalTransition;
        }
      }, 400);
    });
  }

  // Particle Trail System
  let particles = [];

  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      
      // Initial velocity (random drift)
      this.vx = (Math.random() - 0.5) * 0.8;
      this.vy = (Math.random() - 0.5) * 0.8;
      
      // Size and fade properties
      this.size = Math.random() * 5 + 3;
      this.alpha = 1.0;
      this.decay = Math.random() * 0.03 + 0.02; // Fades out in ~30-50 frames
      
      // Color blend from Cyan to Purple
      this.hue = Math.random() > 0.5 ? 188 : 262; // 188 = Cyan, 262 = Purple
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;
      this.size *= 0.95; // Shrink
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      
      // Glowing shadow around particle
      ctx.shadowBlur = this.size * 2;
      ctx.shadowColor = `hsla(${this.hue}, 90%, 60%, ${this.alpha})`;
      
      ctx.fillStyle = `hsla(${this.hue}, 90%, 65%, ${this.alpha})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Premium Click Sparkle Particle
  class SparkleParticle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      
      // Fast explosive velocity outwards in 360 degrees
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 2; 
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      
      this.size = Math.random() * 4 + 2.5;
      this.alpha = 1.0;
      this.decay = Math.random() * 0.04 + 0.035; // Fades quickly
      
      // Multi-colored sparkling blend
      const rand = Math.random();
      this.color = rand > 0.6 ? '#ffffff' : (rand > 0.3 ? '#00f2fe' : '#a855f7');
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      
      // Apply drag to decelerate sparkles naturally
      this.vx *= 0.92;
      this.vy *= 0.92;
      
      this.alpha -= this.decay;
      this.size *= 0.9;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      
      // Soft diamond/glow shadow blur
      ctx.shadowBlur = this.size * 3;
      ctx.shadowColor = this.color;
      ctx.fillStyle = this.color;
      
      ctx.beginPath();
      // Draw standard round sparkle or small star/diamond
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Main 60 FPS Animation loop
  let lastMouseX = -1;
  let lastMouseY = -1;

  function animate() {
    // Clear trail canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update custom cursor arrow position instantly
    if (mouse.x > -50 && mouse.y > -50) {
      arrow.style.left = `${mouse.x}px`;
      arrow.style.top = `${mouse.y}px`;
    }

    // Generate trail particles on mouse movement (bubbles follow cursor arrow tip)
    const dx = Math.abs(mouse.x - lastMouseX);
    const dy = Math.abs(mouse.y - lastMouseY);
    if ((dx > 1 || dy > 1) && mouse.x > 0 && mouse.y > 0) {
      // Spawn 1-2 trail particles per frame when moving
      particles.push(new Particle(mouse.x, mouse.y));
      if (Math.random() > 0.5) {
        particles.push(new Particle(mouse.x, mouse.y));
      }
      lastMouseX = mouse.x;
      lastMouseY = mouse.y;
    }

    // Update and draw particles
    particles.forEach((p, idx) => {
      p.update();
      p.draw();
      if (p.alpha <= 0 || p.size <= 0.5) {
        particles.splice(idx, 1);
      }
    });

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
})();
