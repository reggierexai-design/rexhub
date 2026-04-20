document.addEventListener("DOMContentLoaded", () => {
    // Top Progress Bar
    const topProgress = document.getElementById("topProgress");
    if (topProgress) {
        window.addEventListener("scroll", () => {
            const total = document.documentElement.scrollHeight - window.innerHeight;
            const pct = total > 0 ? window.scrollY / total : 0;
            topProgress.style.transform = `scaleX(${Math.max(0, Math.min(1, pct))})`;
        });
    }

    // Scroll Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("vis");
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
    
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

    // Number Counters
    document.querySelectorAll("[data-counter]").forEach((el) => {
        let hasRun = false;
        const target = Number(el.getAttribute("data-counter") || "0");
        const suffix = el.getAttribute("data-suffix") || "";
        
        const countObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !hasRun) {
                hasRun = true;
                const duration = 1500;
                const start = performance.now();
                const step = (now) => {
                    const progress = Math.min((now - start) / duration, 1);
                    // ease out cubic
                    const value = Math.round(target * (1 - Math.pow(1 - progress, 3)));
                    el.textContent = value + suffix;
                    if (progress < 1) requestAnimationFrame(step);
                    else el.textContent = target + suffix;
                };
                requestAnimationFrame(step);
            }
        });
        countObserver.observe(el);
    });

    // Particle Canvas Background (Supercharged)
    const cv = document.getElementById('cv');
    if (cv) {
        const cx = cv.getContext('2d');
        let pts = [], ms = { x: null, y: null };
        const PC = 80, CD = 180;
        
        function rz() {
            cv.width = window.innerWidth;
            cv.height = window.innerHeight;
        }
        
        class P {
            constructor() {
                this.x = Math.random() * cv.width;
                this.y = Math.random() * cv.height;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.r = Math.random() * 1.8 + 0.6;
                this.o = Math.random() * 0.5 + 0.1;
                // Add a cyan variant occasionally for exponential premium feel
                this.color = Math.random() > 0.85 ? 'rgba(0,240,255,' : 'rgba(200,255,0,';
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > cv.width) this.vx *= -1;
                if (this.y < 0 || this.y > cv.height) this.vy *= -1;
                
                if (ms.x !== null) {
                    const dx = this.x - ms.x, dy = this.y - ms.y, d = Math.sqrt(dx*dx + dy*dy);
                    if (d < 250) {
                        const f = (250 - d) / 250 * 0.025;
                        this.vx += dx / d * f;
                        this.vy += dy / d * f;
                    }
                }
                // mild drag
                this.vx *= 0.999;
                this.vy *= 0.999;
            }
            draw() {
                cx.beginPath();
                cx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                cx.fillStyle = `${this.color}${this.o})`;
                cx.fill();
            }
        }
        
        function init() {
            rz();
            pts = [];
            for (let i = 0; i < PC; i++) pts.push(new P());
        }
        
        function draw() {
            cx.clearRect(0, 0, cv.width, cv.height);
            
            // Draw subtle gradient behind particles
            const gr = cx.createRadialGradient(cv.width/2, cv.height*0.4, 0, cv.width/2, cv.height*0.4, Math.max(cv.width, cv.height)*0.6);
            gr.addColorStop(0, 'rgba(200,255,0,0.03)');
            gr.addColorStop(0.5, 'rgba(0,240,255,0.01)');
            gr.addColorStop(1, 'transparent');
            cx.fillStyle = gr;
            cx.fillRect(0, 0, cv.width, cv.height);
            
            pts.forEach(p => { p.update(); p.draw(); });
            
            for (let i = 0; i < pts.length; i++) {
                for (let j = i + 1; j < pts.length; j++) {
                    const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = Math.sqrt(dx*dx + dy*dy);
                    if (d < CD) {
                        cx.beginPath();
                        cx.moveTo(pts[i].x, pts[i].y);
                        cx.lineTo(pts[j].x, pts[j].y);
                        const isCyan = pts[i].color.includes('240') || pts[j].color.includes('240');
                        cx.strokeStyle = isCyan ? `rgba(0,240,255,${(1 - d/CD)*0.15})` : `rgba(200,255,0,${(1 - d/CD)*0.15})`;
                        cx.lineWidth = 0.8;
                        cx.stroke();
                    }
                }
            }
            
            if (ms.x !== null) {
                for (let i = 0; i < pts.length; i++) {
                    const dx = pts[i].x - ms.x, dy = pts[i].y - ms.y, d = Math.sqrt(dx*dx + dy*dy);
                    if (d < 300) {
                        cx.beginPath();
                        cx.moveTo(pts[i].x, pts[i].y);
                        cx.lineTo(ms.x, ms.y);
                        cx.strokeStyle = `rgba(200,255,0,${(1 - d/300)*0.12})`;
                        cx.lineWidth = 0.5;
                        cx.stroke();
                    }
                }
            }
            requestAnimationFrame(draw);
        }
        
        cv.addEventListener('mousemove', e => {
            const r = cv.getBoundingClientRect();
            ms.x = e.clientX - r.left;
            ms.y = e.clientY - r.top;
        });
        cv.addEventListener('mouseleave', () => { ms.x = null; ms.y = null; });
        window.addEventListener('resize', rz);
        
        init();
        draw();
    }
    
    // Global Glow (Mouse follower mapped directly to body)
    const g = document.createElement('div');
    g.className = 'cg';
    document.body.appendChild(g);
    document.addEventListener('mousemove', e => {
        g.style.left = e.clientX + 'px';
        g.style.top = e.clientY + 'px';
    });
});
