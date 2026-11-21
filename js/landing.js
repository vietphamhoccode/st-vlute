(function () {
  "use strict";

  var reduceMotion = false;
  try {
    reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) {
    reduceMotion = false;
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    var nodes = document.querySelectorAll(".reveal");
    if (!nodes.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      for (var i = 0; i < nodes.length; i++) nodes[i].classList.add("is-visible");
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        for (var j = 0; j < entries.length; j++) {
          var entry = entries[j];
          if (!entry.isIntersecting) continue;
          var el = entry.target;
          var delay = parseInt(el.getAttribute("data-delay") || "0", 10);
          if (delay) {
            window.setTimeout(function (node) {
              return function () {
                node.classList.add("is-visible");
              };
            }(el), delay);
          } else {
            el.classList.add("is-visible");
          }
          io.unobserve(el);
        }
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );

    for (var k = 0; k < nodes.length; k++) io.observe(nodes[k]);
  }

  /* ---------- Particle field ---------- */
  function initParticles() {
    var canvas = document.getElementById("particle-canvas");
    if (!canvas || reduceMotion) return;

    var ctx = canvas.getContext && canvas.getContext("2d");
    if (!ctx) return;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var particles = [];
    var w = 0;
    var h = 0;
    var raf = 0;
    var running = true;

    function resize() {
      w = window.innerWidth || document.documentElement.clientWidth || 1;
      h = window.innerHeight || document.documentElement.clientHeight || 1;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var count = Math.max(18, Math.min(48, Math.floor((w * h) / 38000)));
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 1 + Math.random() * 2.2,
          vx: (Math.random() - 0.5) * 0.25,
          vy: -0.15 - Math.random() * 0.35,
          a: 0.15 + Math.random() * 0.35
        });
      }
    }

    function tick() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(31, 138, 76," + p.a + ")";
        ctx.fill();
      }
      raf = window.requestAnimationFrame(tick);
    }

    resize();
    tick();

    var resizeTimer = 0;
    window.addEventListener(
      "resize",
      function () {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(resize, 120);
      },
      { passive: true }
    );

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        running = false;
        if (raf) window.cancelAnimationFrame(raf);
      } else {
        running = true;
        tick();
      }
    });
  }

  /* ---------- 3D logo tilt ---------- */
  function initLogo3D() {
    var scene = document.getElementById("logo-scene");
    var rig = document.getElementById("logo-rig");
    if (!scene || !rig) return;

    if (reduceMotion) {
      rig.style.webkitAnimation = "none";
      rig.style.animation = "none";
      return;
    }

    var targetX = 0;
    var targetY = 0;
    var curX = 0;
    var curY = 0;
    var idle = 0;
    var dragging = false;
    var maxTilt = 18;
    var raf = 0;

    function setTargetsFromPoint(clientX, clientY) {
      var rect = scene.getBoundingClientRect();
      var px = (clientX - rect.left) / Math.max(rect.width, 1);
      var py = (clientY - rect.top) / Math.max(rect.height, 1);
      targetY = (px - 0.5) * 2 * maxTilt;
      targetX = (0.5 - py) * 2 * maxTilt;
    }

    function onPointerMove(e) {
      if (e.touches && e.touches.length) {
        setTargetsFromPoint(e.touches[0].clientX, e.touches[0].clientY);
        dragging = true;
      } else {
        setTargetsFromPoint(e.clientX, e.clientY);
        dragging = true;
      }
    }

    function onPointerLeave() {
      dragging = false;
      targetX = 0;
      targetY = 0;
    }

    scene.addEventListener("mousemove", onPointerMove, { passive: true });
    scene.addEventListener("mouseleave", onPointerLeave, { passive: true });
    scene.addEventListener(
      "touchstart",
      function (e) {
        if (!e.touches || !e.touches.length) return;
        onPointerMove(e);
      },
      { passive: true }
    );
    scene.addEventListener(
      "touchmove",
      function (e) {
        onPointerMove(e);
      },
      { passive: true }
    );
    scene.addEventListener("touchend", onPointerLeave, { passive: true });
    scene.addEventListener("touchcancel", onPointerLeave, { passive: true });

    function frame(ts) {
      idle = ts * 0.001;
      var idleX = Math.sin(idle * 0.9) * 4;
      var idleY = Math.cos(idle * 0.7) * 5;
      var floatY = Math.sin(idle * 1.15) * 10;

      var blend = dragging ? 0.16 : 0.08;
      curX += (targetX + idleX - curX) * blend;
      curY += (targetY + idleY - curY) * blend;

      var transform =
        "translate3d(0," +
        floatY.toFixed(2) +
        "px,0) rotateX(" +
        curX.toFixed(2) +
        "deg) rotateY(" +
        curY.toFixed(2) +
        "deg)";

      rig.style.webkitAnimation = "none";
      rig.style.animation = "none";
      rig.style.webkitTransform = transform;
      rig.style.transform = transform;

      raf = window.requestAnimationFrame(frame);
    }

    raf = window.requestAnimationFrame(frame);

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        if (raf) window.cancelAnimationFrame(raf);
      } else {
        raf = window.requestAnimationFrame(frame);
      }
    });
  }

  /* ---------- Boot ---------- */
  function boot() {
    initReveal();
    initParticles();
    initLogo3D();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
