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

  /* ---------- Independent living characters (walk / climb / chat / think) ---------- */
  function initCharacterTheater() {
    if (reduceMotion) return;
    var stage = document.querySelector(".tech-stage");
    if (!stage) return;

    var names = [];
    var actors = {};
    var nodes = stage.querySelectorAll("[data-actor]");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var name = el.getAttribute("data-actor");
      names.push(name);
      actors[name] = {
        name: name,
        el: el,
        x: parseFloat(el.style.left) || 50,
        y: parseFloat(el.style.top) || 60,
        busy: false,
        chatting: false,
        sayEl: el.querySelector('[data-bubble="say"]'),
        thinkEl: el.querySelector('[data-bubble="think"]')
      };
    }
    if (!actors.student || !actors.engineer || !actors.bot) return;

    var groundY = lowPower ? [58, 74] : [50, 80];
    var climbSpots = [
      { x: 35, y: 48 },
      { x: 63, y: 45 },
      { x: 47, y: 46 },
      { x: 53, y: 52 },
      { x: 50, y: 40 },
      { x: 22, y: 36 },
      { x: 78, y: 34 }
    ];
    var chatLock = null;

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

    function pick(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }

    function dist(a, b) {
      var dx = a.x - b.x;
      var dy = a.y - b.y;
      return Math.sqrt(dx * dx + dy * dy);
    }

    function clearBubble(a) {
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

    function travelTime(a, x, y) {
      var d = Math.sqrt(Math.pow(x - a.x, 2) + Math.pow(y - a.y, 2));
      var speed = a.name === "bot" ? (lowPower ? 28 : 34) : lowPower ? 22 : 26;
      return clamp(Math.round((d / speed) * 1000), lowPower ? 900 : 1200, lowPower ? 2400 : 3200);
    }

    function moveTo(a, x, y, opts) {
      opts = opts || {};
      x = clamp(x, 5, 95);
      y = clamp(y, 16, 84);
      var faceLeft = opts.faceLeft;
      if (faceLeft === undefined) faceLeft = x < a.x - 0.8;
      var duration = opts.duration != null ? opts.duration : travelTime(a, x, y);
      a.x = x;
      a.y = y;
      a.el.classList.toggle("face-left", !!faceLeft);
      a.el.classList.toggle("is-climbing", !!opts.climb);
      a.el.classList.add("is-walking");
      a.el.style.transitionDuration = duration + "ms";
      a.el.style.left = x + "%";
      a.el.style.top = y + "%";
      return wait(duration).then(function () {
        a.el.classList.remove("is-walking");
        if (!opts.keepClimb) a.el.classList.remove("is-climbing");
      });
    }

    function speak(a, type, text, hold) {
      clearBubble(a);
      var bubble = type === "think" ? a.thinkEl : a.sayEl;
      if (!bubble) return Promise.resolve();
      a.el.classList.add("is-acting");
      bubble.hidden = false;
      bubble.textContent = text;
      void bubble.offsetWidth;
      bubble.classList.add("is-on");
      return wait(hold || (type === "think" ? 2000 : 1700)).then(function () {
        bubble.classList.remove("is-on");
        bubble.hidden = true;
        a.el.classList.remove("is-acting");
      });
    }

    var lines = {
      student: {
        think: [
          "Lịch học hôm nay ra sao nhỉ…",
          "Mình nên xem điểm thành phần.",
          "ST VLUTE tiện thật…",
          "Nếu trễ tiết thì sao ta?",
          "Đi ngang node này rồi…",
          "Học kỳ mới mình sẵn sàng!"
        ],
        say: [
          "Cho mình xin thời khóa biểu!",
          "Cảm ơn AI Helper!",
          "App mượt quá anh ơi.",
          "Mình sẵn sàng học kỳ mới!",
          "Ê, đi cùng mình một đoạn!",
          "API còn sống chứ?"
        ]
      },
      engineer: {
        think: [
          "API nhà trường ổn không?",
          "Công nghệ phải phục vụ con người.",
          "Tối ưu cache tiếp nào…",
          "CNTT = kết nối & sáng tạo.",
          "Wire này latency hơi cao.",
          "Kiểm tra node phía trên…"
        ],
        say: [
          "API VLUTE đang green.",
          "Cache local đã bật.",
          "ST VLUTE = Students × VLUTE.",
          "Leo lên node kiểm tra wire!",
          "Đồng bộ xong rồi đó.",
          "Theo mình, đi hướng này!"
        ]
      },
      bot: {
        think: [
          "Mình ý thức nhiệm vụ hỗ trợ sinh viên.",
          "Đang quét dữ liệu GPA…",
          "Con người + AI = team.",
          "Ping… pong… sync ok.",
          "Quét toàn board… 3 node online.",
          "Mình có thể bay ngang wire."
        ],
        say: [
          "Mình đồng bộ giúp bạn!",
          "Timeline đã sẵn sàng.",
          "Team VLUTE online!",
          "Leo lên node trung tâm nào!",
          "Hello humans!",
          "Mình đi tuần hệ thống đây."
        ]
      }
    };

    function wander(a) {
      var x = rand(6, 94);
      // prefer crossing the screen left↔right
      if (Math.random() > 0.35) {
        x = a.x < 50 ? rand(62, 94) : rand(6, 38);
      }
      var y = rand(groundY[0], groundY[1]);
      if (a.name === "bot" && Math.random() > 0.55) {
        y = rand(28, 58);
      }
      return moveTo(a, x, y, {});
    }

    function climb(a) {
      var spot = pick(climbSpots);
      return moveTo(a, spot.x + rand(-4, 4), spot.y + rand(-3, 3), {
        climb: true,
        keepClimb: true
      }).then(function () {
        return wait(rand(700, 1400));
      }).then(function () {
        if (Math.random() > 0.5) {
          return speak(a, "think", pick(lines[a.name].think), 1600);
        }
      }).then(function () {
        return moveTo(a, rand(10, 90), rand(groundY[0], groundY[1]), {});
      });
    }

    function thinkAlone(a) {
      return speak(a, "think", pick(lines[a.name].think), rand(1600, 2400));
    }

    function findNearby(a, maxD) {
      var best = null;
      var bestD = maxD || 22;
      for (var i = 0; i < names.length; i++) {
        var other = actors[names[i]];
        if (!other || other.name === a.name) continue;
        if (other.busy || other.chatting) continue;
        var d = dist(a, other);
        if (d < bestD) {
          bestD = d;
          best = other;
        }
      }
      return best;
    }

    async function chatWith(a, b) {
      if (chatLock || a.chatting || b.chatting || b.busy) return false;
      chatLock = a.name + "+" + b.name;
      a.chatting = true;
      b.chatting = true;
      b.busy = true;
      try {
        var midX = (a.x + b.x) / 2;
        var midY = clamp((a.y + b.y) / 2, groundY[0], Math.min(groundY[1], 72));
        await Promise.all([
          moveTo(a, midX - 6, midY, { faceLeft: false }),
          moveTo(b, midX + 6, midY, { faceLeft: true })
        ]);
        await speak(a, "say", pick(lines[a.name].say), 1500);
        await speak(b, "say", pick(lines[b.name].say), 1500);
        if (Math.random() > 0.4) {
          await speak(a, "think", pick(lines[a.name].think), 1400);
        }
      } finally {
        a.chatting = false;
        b.chatting = false;
        b.busy = false;
        chatLock = null;
      }
      return true;
    }

    async function lifeLoop(a) {
      // stagger start so they feel independent
      await wait(a.name === "student" ? 200 : a.name === "engineer" ? 700 : 1100);
      while (true) {
        if (document.hidden) {
          clearBubble(a);
          await wait(800);
          continue;
        }
        if (a.busy || a.chatting) {
          await wait(300);
          continue;
        }
        a.busy = true;
        try {
          var roll = Math.random();
          var nearby = findNearby(a, 26);
          if (nearby && roll < 0.34) {
            await chatWith(a, nearby);
          } else if (roll < 0.55) {
            await wander(a);
          } else if (roll < 0.78) {
            await climb(a);
          } else if (roll < 0.9) {
            await wander(a);
            await thinkAlone(a);
          } else {
            await thinkAlone(a);
            await wander(a);
          }
          // small pause so motion breathes
          await wait(rand(280, 900));
        } catch (e) {
        } finally {
          a.busy = false;
        }
      }
    }

    // place them apart, then each lives independently
    moveTo(actors.student, 12, 70, { duration: 20 });
    moveTo(actors.engineer, 86, 64, { duration: 20, faceLeft: true });
    moveTo(actors.bot, 48, 42, { duration: 20, climb: true, keepClimb: true });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        names.forEach(function (n) {
          clearBubble(actors[n]);
        });
      }
    });

    lifeLoop(actors.student);
    lifeLoop(actors.engineer);
    lifeLoop(actors.bot);
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
