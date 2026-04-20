document.addEventListener("DOMContentLoaded", () => {
  const topProgress = document.getElementById("topProgress");
  if (topProgress) {
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const total = document.documentElement.scrollHeight - window.innerHeight;
          const pct = total > 0 ? window.scrollY / total : 0;
          topProgress.style.transform = `scaleX(${Math.max(0, Math.min(1, pct))})`;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("vis");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

  document.querySelectorAll('.grid-2, .grid-3, .grid-4, .story-grid').forEach(grid => {
    const cards = grid.querySelectorAll('.reveal, .glass-card, .story-card, .module-card');
    cards.forEach((card, i) => { card.style.transitionDelay = `${i * 60}ms`; });
  });

  document.querySelectorAll("[data-counter]").forEach((el) => {
    let hasRun = false;
    const target = Number(el.getAttribute("data-counter") || "0");
    const suffix = el.getAttribute("data-suffix") || "";
    const countObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !hasRun) {
        hasRun = true;
        countObserver.unobserve(el);
        const duration = 1800;
        const start = performance.now();
        const step = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const value = Math.round(target * eased);
          el.textContent = value + (progress >= 1 ? suffix : '');
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = target + suffix;
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.3 });
    countObserver.observe(el);
  });

  const cv = document.getElementById('cv');
  if (cv) {
    const cx = cv.getContext('2d');
    let pts = [], ms = { x: null, y: null };
    const PC = 90, CD = 160;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function rz() {
      cv.width = window.innerWidth * dpr;
      cv.height = window.innerHeight * dpr;
      cv.style.width = window.innerWidth + 'px';
      cv.style.height = window.innerHeight + 'px';
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    class P {
      constructor() {
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;
        this.vx = (Math.random() - 0.5) * 0.35;
        this.vy = (Math.random() - 0.5) * 0.35;
        this.r = Math.random() * 1.8 + 0.5;
        this.baseO = Math.random() * 0.45 + 0.15;
        this.o = this.baseO;
        const rnd = Math.random();
        if (rnd > 0.88) { this.cr = 0; this.cg = 240; this.cb = 255; }
        else if (rnd > 0.78) { this.cr = 255; this.cg = 61; this.cb = 139; }
        else { this.cr = 200; this.cg = 255; this.cb = 0; }
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > window.innerWidth) this.vx *= -1;
        if (this.y < 0 || this.y > window.innerHeight) this.vy *= -1;
        if (ms.x !== null) {
          const dx = this.x - ms.x, dy = this.y - ms.y, d = Math.sqrt(dx*dx+dy*dy);
          if (d < 280) { const f = (280-d)/280*0.02; this.vx += dx/d*f; this.vy += dy/d*f; this.o = this.baseO + (1-d/280)*0.35; }
          else { this.o += (this.baseO - this.o) * 0.05; }
        } else { this.o += (this.baseO - this.o) * 0.05; }
        this.vx *= 0.998; this.vy *= 0.998;
      }
      draw() {
        cx.beginPath(); cx.arc(this.x, this.y, this.r, 0, Math.PI*2);
        cx.fillStyle = `rgba(${this.cr},${this.cg},${this.cb},${this.o})`; cx.fill();
        if (this.o > 0.35) {
          cx.beginPath(); cx.arc(this.x, this.y, this.r*3.5, 0, Math.PI*2);
          cx.fillStyle = `rgba(${this.cr},${this.cg},${this.cb},${this.o*0.12})`; cx.fill();
        }
      }
    }

    function init() { rz(); pts = []; for (let i = 0; i < PC; i++) pts.push(new P()); }
    function draw() {
      cx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const gr = cx.createRadialGradient(window.innerWidth*0.3, window.innerHeight*0.3, 0, window.innerWidth*0.3, window.innerHeight*0.3, Math.max(window.innerWidth, window.innerHeight)*0.5);
      gr.addColorStop(0, 'rgba(200,255,0,0.025)'); gr.addColorStop(0.5, 'rgba(0,240,255,0.01)'); gr.addColorStop(1, 'transparent');
      cx.fillStyle = gr; cx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      pts.forEach(p => { p.update(); p.draw(); });
      for (let i = 0; i < pts.length; i++) {
        for (let j = i+1; j < pts.length; j++) {
          const dx = pts[i].x-pts[j].x, dy = pts[i].y-pts[j].y, d = Math.sqrt(dx*dx+dy*dy);
          if (d < CD) {
            const alpha = (1-d/CD)*0.12;
            cx.beginPath(); cx.moveTo(pts[i].x, pts[i].y); cx.lineTo(pts[j].x, pts[j].y);
            const p = pts[i].o > pts[j].o ? pts[i] : pts[j];
            cx.strokeStyle = `rgba(${p.cr},${p.cg},${p.cb},${alpha})`; cx.lineWidth = 0.6; cx.stroke();
          }
        }
      }
      if (ms.x !== null) {
        for (let i = 0; i < pts.length; i++) {
          const dx = pts[i].x-ms.x, dy = pts[i].y-ms.y, d = Math.sqrt(dx*dx+dy*dy);
          if (d < 300) { cx.beginPath(); cx.moveTo(pts[i].x, pts[i].y); cx.lineTo(ms.x, ms.y); cx.strokeStyle = `rgba(200,255,0,${(1-d/300)*0.1})`; cx.lineWidth = 0.4; cx.stroke(); }
        }
      }
      requestAnimationFrame(draw);
    }
    cv.addEventListener('mousemove', e => { const r = cv.getBoundingClientRect(); ms.x = e.clientX-r.left; ms.y = e.clientY-r.top; });
    cv.addEventListener('mouseleave', () => { ms.x = null; ms.y = null; });
    document.addEventListener('mousemove', e => { ms.x = e.clientX; ms.y = e.clientY; });
    document.addEventListener('mouseleave', () => { ms.x = null; ms.y = null; });
    window.addEventListener('resize', () => { rz(); });
    init(); draw();
  }

  const g = document.createElement('div');
  g.className = 'cg';
  document.body.appendChild(g);
  let glowX = 0, glowY = 0, currentX = 0, currentY = 0;
  document.addEventListener('mousemove', e => { glowX = e.clientX; glowY = e.clientY; });
  function animateGlow() { currentX += (glowX-currentX)*0.08; currentY += (glowY-currentY)*0.08; g.style.left = currentX+'px'; g.style.top = currentY+'px'; requestAnimationFrame(animateGlow); }
  animateGlow();

  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.5s ease';
  requestAnimationFrame(() => { requestAnimationFrame(() => { document.body.style.opacity = '1'; }); });
});
