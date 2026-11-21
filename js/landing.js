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

  /* ---------- Free-roam character theater (walk / climb / chat / think) ---------- */
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
        x: 50,
        y: 60,
        sayEl: el.querySelector('[data-bubble="say"]'),
        thinkEl: el.querySelector('[data-bubble="think"]')
      };
    }
    if (!actors.student || !actors.engineer || !actors.bot) return;

    var groundY = lowPower ? [58, 72] : [52, 78];
    var climbY = lowPower ? [28, 42] : [18, 40];
    var moveMs = lowPower ? 1600 : 2200;

    function wait(ms) {
      return new Promise(function (resolve) {
        window.setTimeout(resolve, ms);
      });
    }

    function clamp(v, a, b) {
      return Math.max(a, Math.min(b, v));
    }

    function rand(a, b) {
      return a + Math.random() * (b - a);
    }

    function clearBubbles(name) {
      var list = name ? [name] : Object.keys(actors);
      for (var i = 0; i < list.length; i++) {
        var a = actors[list[i]];
        if (!a) continue;
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
        a.el.classList.remove("is-acting");
      }
    }

    function move(name, x, y, opts) {
      opts = opts || {};
      var a = actors[name];
      if (!a) return Promise.resolve();
      var faceLeft = opts.faceLeft;
      if (faceLeft === undefined) faceLeft = x < a.x;
      a.x = clamp(x, 6, 94);
      a.y = clamp(y, 14, 82);
      a.el.classList.toggle("face-left", !!faceLeft);
      a.el.classList.toggle("is-climbing", !!opts.climb);
      a.el.classList.add("is-walking");
      a.el.style.left = a.x + "%";
      a.el.style.top = a.y + "%";
      return wait(opts.duration || moveMs).then(function () {
        a.el.classList.remove("is-walking");
        if (!opts.keepClimb) a.el.classList.remove("is-climbing");
      });
    }

    function speak(name, type, text, hold) {
      var a = actors[name];
      if (!a) return Promise.resolve();
      clearBubbles(name);
      var bubble = type === "think" ? a.thinkEl : a.sayEl;
      if (!bubble) return Promise.resolve();
      a.el.classList.add("is-acting");
      bubble.hidden = false;
      bubble.textContent = text;
      void bubble.offsetWidth;
      bubble.classList.add("is-on");
      return wait(hold || 2000).then(function () {
        bubble.classList.remove("is-on");
        bubble.hidden = true;
        a.el.classList.remove("is-acting");
      });
    }

    function roam(name) {
      var x = rand(8, 92);
      var y = rand(groundY[0], groundY[1]);
      return move(name, x, y, { duration: moveMs });
    }

    function climb(name) {
      var x = rand(30, 70);
      var y = rand(climbY[0], climbY[1]);
      return move(name, x, y, { climb: true, keepClimb: true, duration: moveMs + 400 });
    }

    var lines = {
      student: {
        think: [
          "Lịch học hôm nay ra sao nhỉ…",
          "Mình nên xem điểm thành phần.",
          "ST VLUTE tiện thật…",
          "Nếu trễ tiết thì sao ta?"
        ],
        say: [
          "Cho mình xin thời khóa biểu!",
          "Cảm ơn AI Helper!",
          "App mượt quá anh ơi.",
          "Mình sẵn sàng học kỳ mới!"
        ]
      },
      engineer: {
        think: [
          "API nhà trường ổn không?",
          "Công nghệ phải phục vụ con người.",
          "Tối ưu cache tiếp nào…",
          "CNTT = kết nối & sáng tạo."
        ],
        say: [
          "API VLUTE đang green.",
          "Cache local đã bật.",
          "ST VLUTE = Students × VLUTE.",
          "Leo lên node trên kiểm tra wire!"
        ]
      },
      bot: {
        think: [
          "Mình ý thức nhiệm vụ hỗ trợ sinh viên.",
          "Đang quét dữ liệu GPA…",
          "Con người + AI = team.",
          "Ping… pong… sync ok."
        ],
        say: [
          "Mình đồng bộ giúp bạn!",
          "Timeline đã sẵn sàng.",
          "Team VLUTE online!",
          "Leo chip trung tâm nào!"
        ]
      }
    };

    function pick(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }

    async function meetAndTalk(a, b) {
      var mx = rand(35, 65);
      var my = rand(groundY[0], Math.min(groundY[1], 70));
      await Promise.all([
        move(a, mx - 7, my, { faceLeft: false }),
        move(b, mx + 7, my, { faceLeft: true })
      ]);
      await speak(a, "say", pick(lines[a].say), 1700);
      await speak(b, "say", pick(lines[b].say), 1700);
      if (Math.random() > 0.45) {
        await speak(a, "think", pick(lines[a].think), 1600);
      }
    }

    async function climbTogether() {
      await Promise.all([climb("bot"), climb("engineer"), climb("student")]);
      await speak("bot", "say", "Leo lên chip VLUTE·IT!", 1600);
      await speak("engineer", "think", "Từ trên cao nhìn toàn hệ thống…", 1700);
      await speak("student", "say", "Wow, nhìn toàn board!", 1500);
      await Promise.all([
        move("bot", rand(20, 80), rand(groundY[0], groundY[1]), {}),
        move("engineer", rand(20, 80), rand(groundY[0], groundY[1]), {}),
        move("student", rand(20, 80), rand(groundY[0], groundY[1]), {})
      ]);
    }

    async function soloThought(name) {
      if (Math.random() > 0.55) await climb(name);
      else await roam(name);
      await speak(name, "think", pick(lines[name].think), 1800);
      if (actors[name].el.classList.contains("is-climbing")) {
        await move(name, rand(12, 88), rand(groundY[0], groundY[1]), {});
      }
    }

    async function freeWander() {
      await Promise.all([roam("student"), roam("engineer"), roam("bot")]);
      if (Math.random() > 0.5) await climb("bot");
      var who = pick(["student", "engineer", "bot"]);
      await speak(who, "think", pick(lines[who].think), 1500);
    }

    var beats = [
      function () { return soloThought("student"); },
      function () { return meetAndTalk("student", "bot"); },
      function () { return meetAndTalk("student", "engineer"); },
      function () { return climbTogether(); },
      function () { return meetAndTalk("engineer", "bot"); },
      function () { return soloThought("engineer"); },
      function () { return soloThought("bot"); },
      function () { return freeWander(); },
      async function () {
        await Promise.all([roam("student"), roam("engineer"), roam("bot")]);
        await speak("bot", "say", pick(lines.bot.say), 1500);
        await speak("student", "say", pick(lines.student.say), 1500);
        await speak("engineer", "say", pick(lines.engineer.say), 1500);
      }
    ];

    Object.keys(actors).forEach(function (key) {
      actors[key].el.style.transitionDuration = moveMs + "ms";
    });

    var running = true;
    async function loop() {
      var order = beats.slice();
      while (running) {
        if (document.hidden) {
          clearBubbles();
          await wait(900);
          continue;
        }
        // shuffle lightly
        for (var i = order.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var tmp = order[i];
          order[i] = order[j];
          order[j] = tmp;
        }
        for (var k = 0; k < order.length; k++) {
          if (document.hidden) break;
          try {
            await order[k]();
          } catch (e) {}
          clearBubbles();
          await wait(500);
        }
      }
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) clearBubbles();
    });

    // start scattered
    move("student", 14, 70, { duration: 10 });
    move("engineer", 82, 62, { duration: 10, faceLeft: true });
    move("bot", 50, 36, { duration: 10, climb: true, keepClimb: true });
    loop();
  }

  function boot() {
    initAmbientGuard();
    initReveal();
    initDataRain();
    initParticles();
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
