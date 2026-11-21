(function () {
  "use strict";

  var reduceMotion = false;
  var isCoarse = false;
  var isNarrow = false;
  try {
    reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    isCoarse = !!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
    isNarrow = !!(window.matchMedia && window.matchMedia("(max-width: 900px)").matches);
  } catch (e) {}

  var lowPower = reduceMotion || isCoarse || isNarrow;

  function onVisible(el, fn) {
    if (!("IntersectionObserver" in window)) {
      fn(true);
      return function () {};
    }
    var io = new IntersectionObserver(
      function (entries) {
        fn(!!entries[0] && entries[0].isIntersecting);
      },
      { threshold: 0.05 }
    );
    io.observe(el);
    return function () {
      io.disconnect();
    };
  }

  /* ---------- Scroll reveal (once) ---------- */
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
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    for (var k = 0; k < nodes.length; k++) io.observe(nodes[k]);
  }

  /* ---------- Lightweight particles (no O(n^2) links) ---------- */
  function initParticles() {
    var canvas = document.getElementById("particle-canvas");
    if (!canvas || reduceMotion) {
      if (canvas) canvas.style.display = "none";
      return;
    }

    // Mobile/tablet: skip canvas entirely — biggest lag source
    if (lowPower) {
      canvas.style.display = "none";
      return;
    }

    var ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var particles = [];
    var w = 0;
    var h = 0;
    var raf = 0;
    var running = false;
    var last = 0;
    var frameMs = 1000 / 24; // ~24fps

    function resize() {
      w = window.innerWidth || 1;
      h = window.innerHeight || 1;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var count = Math.max(12, Math.min(28, Math.floor((w * h) / 55000)));
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 1 + Math.random() * 1.8,
          vx: (Math.random() - 0.5) * 0.22,
          vy: -0.1 - Math.random() * 0.25,
          a: 0.12 + Math.random() * 0.22
        });
      }
    }

    function tick(ts) {
      if (!running) return;
      raf = window.requestAnimationFrame(tick);
      if (ts - last < frameMs) return;
      last = ts;

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
        ctx.fillStyle = "rgba(7,53,40," + p.a + ")";
        ctx.fill();
      }
    }

    function start() {
      if (running || document.hidden) return;
      running = true;
      last = 0;
      raf = window.requestAnimationFrame(tick);
    }

    function stop() {
      running = false;
      if (raf) window.cancelAnimationFrame(raf);
      raf = 0;
    }

    resize();
    start();

    var resizeTimer = 0;
    window.addEventListener(
      "resize",
      function () {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(resize, 200);
      },
      { passive: true }
    );

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else start();
    });
  }

  /* ---------- 3D logo: CSS idle + rAF only while interacting ---------- */
  function initLogo3D() {
    var scene = document.getElementById("logo-scene");
    var rig = document.getElementById("logo-rig");
    if (!scene || !rig || reduceMotion) return;

    var targetX = 0;
    var targetY = 0;
    var curX = 0;
    var curY = 0;
    var maxTilt = lowPower ? 10 : 16;
    var raf = 0;
    var active = false;
    var inView = true;

    function apply(x, y, floatY) {
      var t =
        "translate3d(0," +
        floatY.toFixed(2) +
        "px,0) rotateX(" +
        x.toFixed(2) +
        "deg) rotateY(" +
        y.toFixed(2) +
        "deg)";
      rig.style.transform = t;
      rig.style.webkitTransform = t;
    }

    function setTargets(clientX, clientY) {
      var rect = scene.getBoundingClientRect();
      var px = (clientX - rect.left) / Math.max(rect.width, 1);
      var py = (clientY - rect.top) / Math.max(rect.height, 1);
      targetY = (px - 0.5) * 2 * maxTilt;
      targetX = (0.5 - py) * 2 * maxTilt;
    }

    function stopRaf() {
      active = false;
      if (raf) window.cancelAnimationFrame(raf);
      raf = 0;
      // hand back to CSS float
      rig.style.transform = "";
      rig.style.webkitTransform = "";
      rig.classList.remove("is-tilting");
    }

    function frame() {
      if (!active || !inView || document.hidden) {
        stopRaf();
        return;
      }
      curX += (targetX - curX) * 0.14;
      curY += (targetY - curY) * 0.14;
      apply(curX, curY, 0);
      if (Math.abs(curX - targetX) < 0.05 && Math.abs(curY - targetY) < 0.05 && targetX === 0 && targetY === 0) {
        stopRaf();
        return;
      }
      raf = window.requestAnimationFrame(frame);
    }

    function startTilt() {
      if (!inView || document.hidden) return;
      active = true;
      rig.classList.add("is-tilting");
      if (!raf) raf = window.requestAnimationFrame(frame);
    }

    scene.addEventListener(
      "pointermove",
      function (e) {
        setTargets(e.clientX, e.clientY);
        startTilt();
      },
      { passive: true }
    );

    scene.addEventListener(
      "pointerleave",
      function () {
        targetX = 0;
        targetY = 0;
        startTilt();
      },
      { passive: true }
    );

    onVisible(scene, function (visible) {
      inView = visible;
      if (!visible) stopRaf();
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stopRaf();
    });
  }

  /* ---------- Scroll progress (rAF throttled) ---------- */
  function initScrollProgress() {
    var bar = document.querySelector(".scroll-progress span");
    if (!bar) return;

    var locked = false;
    function update() {
      locked = false;
      var doc = document.documentElement;
      var scrollTop = window.pageYOffset || doc.scrollTop || 0;
      var height = doc.scrollHeight - doc.clientHeight || 1;
      bar.style.width = Math.max(0, Math.min(100, (scrollTop / height) * 100)).toFixed(1) + "%";
    }

    function onScroll() {
      if (locked) return;
      locked = true;
      window.requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Students <-> ST morph ---------- */
  function initStMorph() {
    var morph = document.getElementById("st-morph");
    var meaning = document.querySelector(".meaning-full");
    if (!morph) return;
    if (meaning) meaning.classList.add("is-on");
    if (reduceMotion) {
      morph.classList.add("is-compact");
      return;
    }

    var expanded = true;
    morph.classList.add("is-expanding");
    var timer = 0;

    function cycle() {
      if (document.hidden) {
        timer = window.setTimeout(cycle, 2000);
        return;
      }
      if (expanded) {
        morph.classList.remove("is-expanding");
        morph.classList.add("is-compact");
        expanded = false;
      } else {
        morph.classList.remove("is-compact");
        morph.classList.add("is-expanding");
        expanded = true;
      }
      timer = window.setTimeout(cycle, expanded ? 3200 : 2400);
    }

    timer = window.setTimeout(cycle, 1400);

    document.addEventListener("visibilitychange", function () {
      if (!document.hidden && !timer) timer = window.setTimeout(cycle, 800);
    });
  }

  /* ---------- Pause heavy CSS when tab hidden ---------- */
  function initAmbientGuard() {
    var root = document.documentElement;
    function sync() {
      if (document.hidden) root.classList.add("anim-paused");
      else root.classList.remove("anim-paused");
    }
    if (lowPower) root.classList.add("low-power");
    sync();
    document.addEventListener("visibilitychange", sync);
  }

  function initDataRain() {
    var host = document.getElementById("data-rain");
    if (!host || reduceMotion) return;
    if (lowPower) {
      host.style.display = "none";
      return;
    }
    var bits = ["01", "10", "API", "GPA", "{}", "<>", "IT", "CNTT", "VLUTE", "0x1F", "sync", "cache"];
    var count = Math.min(14, Math.max(8, Math.floor(window.innerWidth / 120)));
    var html = "";
    for (var i = 0; i < count; i++) {
      var left = (i * (100 / count) + Math.random() * 4).toFixed(2);
      var dur = (9 + Math.random() * 10).toFixed(1);
      var delay = (-Math.random() * 10).toFixed(1);
      html +=
        '<span style="left:' +
        left +
        "%;animation-duration:" +
        dur +
        "s;animation-delay:" +
        delay +
        's">' +
        bits[i % bits.length] +
        "</span>";
    }
    host.innerHTML = html;
  }

  /* ---------- Character short-film director ---------- */
  function initCharacterTheater() {
    if (reduceMotion) return;
    var stage = document.querySelector(".tech-stage");
    if (!stage) return;

    var actors = {};
    var nodes = stage.querySelectorAll("[data-actor]");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      actors[el.getAttribute("data-actor")] = {
        el: el,
        sayEl: el.querySelector('[data-bubble="say"]'),
        thinkEl: el.querySelector('[data-bubble="think"]')
      };
    }
    if (!actors.student || !actors.engineer || !actors.bot) return;

    function clearAll() {
      Object.keys(actors).forEach(function (key) {
        var a = actors[key];
        a.el.classList.remove("is-walking");
        if (a.sayEl) {
          a.sayEl.hidden = true;
          a.sayEl.classList.remove("is-on");
          a.sayEl.textContent = "";
        }
        if (a.thinkEl) {
          a.thinkEl.hidden = true;
          a.thinkEl.classList.remove("is-on");
          a.thinkEl.textContent = "";
        }
      });
    }

    function move(name, x, y, faceLeft) {
      var a = actors[name];
      if (!a) return;
      a.el.classList.add("is-walking");
      a.el.style.left = x + "%";
      a.el.style.top = y + "%";
      if (faceLeft === true) a.el.classList.add("face-left");
      else if (faceLeft === false) a.el.classList.remove("face-left");
    }

    function speak(name, type, text) {
      var a = actors[name];
      if (!a) return;
      var bubble = type === "think" ? a.thinkEl : a.sayEl;
      var other = type === "think" ? a.sayEl : a.thinkEl;
      if (other) {
        other.hidden = true;
        other.classList.remove("is-on");
      }
      if (!bubble) return;
      bubble.hidden = false;
      bubble.textContent = text;
      // force reflow for transition
      void bubble.offsetWidth;
      bubble.classList.add("is-on");
    }

    function wait(ms) {
      return new Promise(function (resolve) {
        window.setTimeout(resolve, ms);
      });
    }

    var scenes = [
      async function () {
        clearAll();
        move("student", 12, 68, false);
        move("engineer", 86, 60, true);
        move("bot", 50, 42, false);
        await wait(700);
        speak("student", "think", "Hôm nay lịch học thế nào nhỉ…");
        await wait(2200);
      },
      async function () {
        clearAll();
        move("bot", 22, 58, true);
        move("student", 18, 66, false);
        await wait(1600);
        speak("bot", "say", "Mình quét API VLUTE giúp bạn nhé!");
        await wait(1200);
        speak("student", "say", "Ok! Mở giúp thời khóa biểu.");
        await wait(2200);
      },
      async function () {
        clearAll();
        move("engineer", 34, 58, true);
        move("student", 22, 66, false);
        move("bot", 42, 50, true);
        await wait(1800);
        speak("engineer", "say", "API ổn định. Cache local đã bật.");
        await wait(1600);
        speak("student", "think", "Wow… người và công nghệ thật sự kết nối.");
        await wait(2200);
      },
      async function () {
        clearAll();
        move("bot", 48, 52, false);
        move("student", 40, 64, false);
        move("engineer", 58, 62, true);
        await wait(1500);
        speak("bot", "think", "Mình ý thức được nhiệm vụ: hỗ trợ sinh viên.");
        await wait(1800);
        speak("engineer", "say", "ST VLUTE = Students × VLUTE.");
        await wait(1600);
        speak("student", "say", "Cảm ơn anh & AI Helper!");
        await wait(2200);
      },
      async function () {
        clearAll();
        move("student", 70, 66, false);
        move("bot", 78, 52, false);
        move("engineer", 16, 58, false);
        await wait(1800);
        speak("student", "think", "Điểm thành phần… mình xem trên app vậy.");
        await wait(1600);
        speak("bot", "say", "Đã đồng bộ GPA + Cache.");
        await wait(2000);
      },
      async function () {
        clearAll();
        move("engineer", 48, 58, true);
        move("bot", 56, 48, true);
        move("student", 38, 66, false);
        await wait(1400);
        speak("engineer", "think", "Công nghệ phục vụ con người — đó là CNTT.");
        await wait(1800);
        speak("bot", "say", "Team VLUTE online!");
        await wait(1600);
        speak("student", "say", "Mình sẵn sàng học kỳ mới!");
        await wait(2400);
      }
    ];

    var running = true;
    var idx = 0;

    async function loop() {
      while (running) {
        if (document.hidden) {
          await wait(1000);
          continue;
        }
        try {
          await scenes[idx % scenes.length]();
        } catch (e) {}
        idx += 1;
        clearAll();
        Object.keys(actors).forEach(function (key) {
          actors[key].el.classList.remove("is-walking");
        });
        await wait(600);
      }
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) clearAll();
    });

    // Slightly faster transitions on low-power
    if (lowPower) {
      Object.keys(actors).forEach(function (key) {
        actors[key].el.style.transitionDuration = "1.5s";
      });
    }

    loop();
  }

  function boot() {
    initAmbientGuard();
    initReveal();
    initDataRain();
    initParticles();
    initLogo3D();
    initScrollProgress();
    initStMorph();
    initCharacterTheater();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
