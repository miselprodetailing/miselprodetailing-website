/* Mišel Pro Detailing: animacije i forma */
(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desktop = window.matchMedia("(min-width: 1000px)");
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  $("#yr").textContent = new Date().getFullYear();

  /* videos: load only the one this screen shows, and play only while visible */
  const isDesk = window.matchMedia("(min-width: 1000px)").matches;
  const vids = $$("video.lazyv").filter((v) => !v.dataset.only || (v.dataset.only === "desktop") === isDesk);
  const vio = "IntersectionObserver" in window ? new IntersectionObserver((ents) => ents.forEach((en) => {
    const v = en.target;
    if (en.isIntersecting) { if (!v.src) { v.src = v.dataset.src; v.preload = "auto"; } const p = v.play(); if (p && p.catch) p.catch(() => {}); }
    else if (v.src) v.pause();
  }), { rootMargin: "200px 0px" }) : null;
  vids.forEach((v) => { if (vio) vio.observe(v); else { v.src = v.dataset.src; v.play(); } });

  /* ---------- gallery: built from the photo list */
  const PK = Array.from({ length: 19 }, (_, i) => ["pk", `poliranje-keramika-${String(i + 1).padStart(2, "0")}`, "Poliranje i keramika"]);
  const DP = Array.from({ length: 27 }, (_, i) => ["dp", `dubinsko-pranje-${String(i + 1).padStart(2, "0")}`, "Dubinsko pranje"]);
  const ALL = [];
  for (let i = 0; i < Math.max(PK.length, DP.length); i++) { if (PK[i]) ALL.push(PK[i]); if (DP[i]) ALL.push(DP[i]); }
  const track = $("#galTrack");
  if (!track.children.length) track.innerHTML = ALL.map(([c, f, l], i) =>
    `<figure data-c="${c}" data-i="${i}"><img src="assets/img/${f}.webp" alt="${l}: rad studija Mišel Pro Detailing" loading="lazy" decoding="async"/><figcaption>${l}</figcaption></figure>`).join("");

  /* ---------- smooth scroll */
  let lenis = null;
  if (!reduce && typeof window.Lenis !== "undefined") {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true, wheelMultiplier: 1 });
    if (hasGsap) { lenis.on("scroll", ScrollTrigger.update); gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
    else { const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
  }
  const goTo = (target) => {
    const el = typeof target === "string" ? $(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -70, duration: 1.4 });
    else el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  };
  $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (id.length < 2) return;
    e.preventDefault(); closeMenu();
    const pick = a.dataset.pick;
    if (pick) { const s = $("#f-usluga"); [...s.options].forEach((o) => { if (o.text === pick) s.value = o.text; }); }
    goTo(id === "#top" ? document.body : id);
  }));

  /* ---------- header + mobile menu + mobile bar */
  const hdr = $("#hdr"), mbar = $("#mbar");
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    hdr.classList.toggle("scrolled", y > 30);
    hdr.classList.toggle("hide", y > lastY && y > 500 && !document.body.classList.contains("menu-open"));
    const bk = document.getElementById("zakazi").getBoundingClientRect();
    mbar.classList.toggle("on", y > window.innerHeight * 0.8 && bk.top > window.innerHeight * 0.9);
    lastY = y;
  };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  const burger = $("#burger");
  function closeMenu() { document.body.classList.remove("menu-open"); burger.setAttribute("aria-expanded", "false"); $("#mmenu").setAttribute("aria-hidden", "true"); lenis && lenis.start(); }
  burger.addEventListener("click", () => {
    const open = !document.body.classList.contains("menu-open");
    if (!open) return closeMenu();
    document.body.classList.add("menu-open"); burger.setAttribute("aria-expanded", "true"); $("#mmenu").setAttribute("aria-hidden", "false"); lenis && lenis.stop();
  });

  /* ---------- open / closed indicator (Pon–Sub 9–17) */
  (() => {
    const d = new Date(), day = d.getDay(), h = d.getHours() + d.getMinutes() / 60;
    const open = day >= 1 && day <= 6 && h >= 9 && h < 17;
    const n = $("#now"); n.classList.toggle("open", open);
    n.querySelector("span").textContent = open ? "Sada radimo" : "Trenutno zatvoreno";
  })();

  /* ---------- gallery filter + lightbox */
  const figs = $$("#galTrack figure");
  $$(".tabs button").forEach((b) => b.addEventListener("click", () => {
    $$(".tabs button").forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-selected", x === b); });
    const f = b.dataset.f;
    figs.forEach((fg) => fg.classList.toggle("hidden", f !== "all" && fg.dataset.c !== f));
    track.scrollLeft = 0;
    if (hasGsap) ScrollTrigger.refresh();
  }));
  /* gallery row: arrows + drag with the mouse */
  const step = () => (track.querySelector("figure:not(.hidden)") || { offsetWidth: 380 }).offsetWidth + 14;
  $("#gPrev").addEventListener("click", () => track.scrollBy({ left: -step() * 2, behavior: "smooth" }));
  $("#gNext").addEventListener("click", () => track.scrollBy({ left: step() * 2, behavior: "smooth" }));
  let dragX = null, dragS = 0, moved = false;
  track.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") return; dragX = e.clientX; dragS = track.scrollLeft; moved = false; });
  window.addEventListener("pointermove", (e) => { if (dragX === null) return; const d = e.clientX - dragX; if (Math.abs(d) > 5) { moved = true; track.classList.add("drag"); } track.scrollLeft = dragS - d; });
  window.addEventListener("pointerup", () => { dragX = null; setTimeout(() => track.classList.remove("drag"), 0); });
  track.addEventListener("click", (e) => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
  const lb = $("#lb"), lbImg = $("#lb img");
  let cur = 0;
  const visible = () => figs.filter((f) => !f.classList.contains("hidden"));
  const show = (i) => { const v = visible(); cur = (i + v.length) % v.length; const im = v[cur].querySelector("img"); lbImg.src = im.src; lbImg.alt = im.alt; };
  figs.forEach((f) => f.addEventListener("click", () => { show(visible().indexOf(f)); lb.classList.add("on"); lenis && lenis.stop(); }));
  const closeLb = () => { lb.classList.remove("on"); lenis && lenis.start(); };
  $(".x", lb).addEventListener("click", closeLb);
  $(".pv", lb).addEventListener("click", () => show(cur - 1));
  $(".nx", lb).addEventListener("click", () => show(cur + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("on")) return;
    if (e.key === "Escape") closeLb(); if (e.key === "ArrowLeft") show(cur - 1); if (e.key === "ArrowRight") show(cur + 1);
  });

  /* ---------- YouTube: thumbnail first, player only on click */
  $$(".yt").forEach((y) => {
    const go = () => { y.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${y.dataset.yt}?autoplay=1&rel=0&modestbranding=1" title="YouTube video" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`; };
    y.addEventListener("click", go); y.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
  });

  /* ---------- booking form: WhatsApp or email */
  const form = $("#bk"), msg = $("#fmsg");
  const val = (id) => $(id).value.trim();
  const check = () => {
    let ok = true;
    ["#f-ime", "#f-tel", "#f-auto", "#f-usluga"].forEach((id) => {
      const bad = !val(id) || (id === "#f-tel" && val(id).replace(/\D/g, "").length < 8);
      $(id).closest(".fld").classList.toggle("err", bad); if (bad) ok = false;
    });
    if (!ok) { msg.className = "fmsg bad"; msg.textContent = "Popuni polja označena zvezdicom (*)."; }
    return ok;
  };
  /* preselect service from /?usluga=... (links from service pages) */
  try { const u = new URLSearchParams(location.search).get("usluga"); if (u) [...$("#f-usluga").options].forEach((o) => { if (o.text === u) $("#f-usluga").value = o.text; }); } catch (e) {}
  const dateTxt = () => { const d = val("#f-dan"); if (!d) return ""; const [y, m, dd] = d.split("-"); return `${dd}.${m}.${y}.`; };
  $("#sendWa").addEventListener("click", () => {
    if (!check()) return;
    const lines = ["Zdravo Mišele, želim da zakažem termin.", "", `Ime: ${val("#f-ime")}`, `Telefon: ${val("#f-tel")}`, `Auto: ${val("#f-auto")}`, `Usluga: ${val("#f-usluga")}`];
    if (dateTxt()) lines.push(`Željeni datum: ${dateTxt()}`);
    if (val("#f-nap")) lines.push(`Napomena: ${val("#f-nap")}`);
    window.open("https://wa.me/381637447795?text=" + encodeURIComponent(lines.join("\n")), "_blank", "noopener");
    msg.className = "fmsg ok"; msg.textContent = "Otvoren je WhatsApp sa tvojom porukom. Samo pritisni pošalji.";
    if (window.gtag) gtag("event", "zakazivanje", { kanal: "whatsapp", usluga: val("#f-usluga") });
  });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!check()) return;
    if (form.botcheck.checked) return;
    const key = (window.SITE_CONFIG || {}).web3formsKey;
    const btn = $("#sendMail"); btn.disabled = true; msg.className = "fmsg"; msg.textContent = "Šaljem…";
    const data = { access_key: key, subject: `Novi zahtev za termin: ${val("#f-usluga")} (${val("#f-auto")})`, from_name: "miselprodetailing.com",
      Ime: val("#f-ime"), Telefon: val("#f-tel"), Auto: val("#f-auto"), Usluga: val("#f-usluga"), "Željeni datum": dateTxt() || "nije naveden",
      Email: val("#f-email") || "nije naveden", Napomena: val("#f-nap") || "-" };
    if (val("#f-email")) data.replyto = val("#f-email");
    try {
      const r = await fetch("https://api.web3forms.com/submit", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) });
      const j = await r.json();
      if (j.success) { msg.className = "fmsg ok"; msg.textContent = "Zahtev je poslat! Javljamo se u roku od 24 sata."; form.reset(); if (window.gtag) gtag("event", "zakazivanje", { kanal: "email" }); }
      else throw new Error();
    } catch (_) { msg.className = "fmsg bad"; msg.textContent = "Slanje nije uspelo. Probaj preko WhatsApp dugmeta ili nas pozovi."; }
    btn.disabled = false;
  });
  $$("#bk input, #bk select").forEach((i) => i.addEventListener("input", () => i.closest(".fld").classList.remove("err")));

  /* ---------- slot-machine counters */
  function slot(el, value, tl, at, dur = 1.2) {
    const suffix = [...el.childNodes].filter((n) => n.nodeType === 1);
    el.textContent = "";
    String(value).split("").forEach((d, k) => {
      const col = document.createElement("span"); col.className = "dg";
      const strip = document.createElement("span"); strip.className = "strip";
      for (let x = 0; x <= 9; x++) { const s = document.createElement("span"); s.textContent = x; strip.appendChild(s); }
      col.appendChild(strip); el.appendChild(col);
      if (tl) tl.fromTo(strip, { yPercent: 0 }, { yPercent: -10 * +d, duration: dur + k * 0.2, ease: "power3.out" }, at);
      else strip.style.transform = `translateY(${-10 * +d}%)`;
    });
    suffix.forEach((s) => el.appendChild(s));
  }

  /* academy graph rows */
  const CATS = [["START", 3], ["POLIRANJE", 3], ["PRANJE", 2], ["BIZNIS", 2]];
  $("#rows").innerHTML = CATS.map(([l, n]) => `<div class="gr"><span>${l}</span><div class="track"><div class="fill" style="width:${(n / 3) * 100}%"></div></div><div class="n" data-n="${n}"></div></div>`).join("");

  /* ---------- preloader */
  const pre = $("#pre");
  const finishIntro = () => { try { sessionStorage.setItem("mpd-intro", "1"); } catch (e) {} };

  if (!hasGsap || reduce) {
    pre && pre.remove();
    $$(".rv").forEach((e) => (e.style.opacity = 1));
    $$(".stat .n[data-count]").forEach((el) => slot(el, el.dataset.count, null));
    slot($("#cntMain"), 10, null); $$("#rows .n").forEach((el) => slot(el, el.dataset.n, null));
    $$(".gr .fill").forEach((f) => (f.style.transform = "none"));
    $$(".step").forEach((s) => s.classList.add("on"));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const heroIn = () => {
    const tl = gsap.timeline();
    tl.from(".hero .kicker", { y: 20, opacity: 0, duration: 0.6, ease: "power3.out" })
      .from(".hero h1 .ln > span", { yPercent: 110, scale: 1.6, rotation: (i) => (i % 2 ? 4 : -4), duration: 0.7, ease: "power4.out", stagger: 0.12 }, 0.05)
      .from(".hero .sub, .hero .ctas, .trust", { y: 30, opacity: 0, duration: 0.7, ease: "power3.out", stagger: 0.1 }, 0.45)
      .from("#reel", { y: 120, rotationY: -25, rotationX: 10, opacity: 0, duration: 1.1, ease: "expo.out" }, 0.3);
    return tl;
  };

  const skipPre = document.documentElement.classList.contains("no-pre");
  if (pre && !skipPre) {
    lenis && lenis.stop();
    const ring = pre.querySelector(".e-ring"), n = { v: 0 }, pn = $("#pctN");
    const tl = gsap.timeline({ onComplete: () => { pre.remove(); lenis && lenis.start(); finishIntro(); } });
    tl.fromTo(pre.querySelector(".e-core"), { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: "expo.out" }, 0)
      .fromTo(ring, { strokeDasharray: 1420, strokeDashoffset: 1420 }, { strokeDashoffset: 0, duration: 1.0, ease: "power2.inOut" }, 0.05)
      .fromTo(pre.querySelector(".e-comet"), { opacity: 0, rotation: -60 }, { opacity: 1, rotation: 540, duration: 1.3, ease: "power2.out" }, 0.15)
      .fromTo(pre.querySelectorAll(".e-ticks, .e-major"), { opacity: 0, scale: 0.9, rotation: 40 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.9, ease: "expo.out" }, 0.1)
      .fromTo(pre.querySelector(".emb-wrap > img"), { scale: 2.2, opacity: 0, rotation: -12 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.5, ease: "expo.out" }, 0.2)
      .to(n, { v: 100, duration: 1.2, ease: "power2.inOut", onUpdate: () => (pn.textContent = Math.round(n.v)) }, 0.05)
      .to(pre, { clipPath: "inset(0 0 100% 0)", duration: 0.8, ease: "expo.inOut" }, 1.45)
      .add(heroIn(), 1.75);
  } else { pre && pre.remove(); heroIn(); }

  /* hero: video slowly pushes in and the whole hero sinks back as the next section rises */
  gsap.to(".hero .wrap", { yPercent: 18, opacity: 0.2, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".hero-media", { scale: 1.12, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

  /* 3D tilt of the reel card on desktop */
  const reel = $("#reel");
  if (reel && desktop.matches) {
    const rx = gsap.quickTo(reel, "rotationX", { duration: 0.6, ease: "power3" }), ry = gsap.quickTo(reel, "rotationY", { duration: 0.6, ease: "power3" });
    $(".hero").addEventListener("mousemove", (e) => { const r = reel.getBoundingClientRect(); ry(((e.clientX - (r.left + r.width / 2)) / window.innerWidth) * 24); rx((-(e.clientY - (r.top + r.height / 2)) / window.innerHeight) * 18); });
    $(".hero").addEventListener("mouseleave", () => { rx(0); ry(0); });
    gsap.set(reel, { transformPerspective: 1200 });
  }

  /* section → section: each section opens up like a card from rounded edges */
  ScrollTrigger.matchMedia({
    "(min-width: 1000px)": () => $$(".card-in").forEach((s) => {
      gsap.fromTo(s, { clipPath: "inset(6% 5% 0% 5% round 48px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none",
        scrollTrigger: { trigger: s, start: "top bottom", end: "top 25%", scrub: 0.6 } });
    }),
    /* phone: each section slides up over the previous one like a card, from a smaller rounded panel */
    "(max-width: 999px)": () => $$(".card-in").forEach((s) => {
      gsap.fromTo(s, { y: 80, scale: 0.94, opacity: 0.4, force3D: true },
        { y: 0, scale: 1, opacity: 1, ease: "power1.out", force3D: true,
          scrollTrigger: { trigger: s, start: "top bottom", end: "top 40%", scrub: true } });
    }),
  });

  /* headings: words slam in from below, like the reels */
  $$(".split").forEach((h) => {
    const parts = [];
    h.childNodes.forEach((nd) => {
      if (nd.nodeType === 3) nd.textContent.split(/(\s+)/).forEach((t) => parts.push(t.trim() ? `<span class="w"><span>${t}</span></span>` : t));
      else parts.push(`<span class="w"><span>${nd.outerHTML}</span></span>`);
    });
    h.innerHTML = parts.join("");
    $$(".w", h).forEach((w) => { w.style.display = "inline-block"; w.style.overflow = "hidden"; w.style.verticalAlign = "top"; w.style.paddingTop = "0.06em"; });
    gsap.from($$(".w > span", h), { yPercent: 115, rotation: 6, duration: 0.8, ease: "power4.out", stagger: 0.07,
      scrollTrigger: { trigger: h, start: "top 85%" } });
    $$(".w > span", h).forEach((s) => (s.style.display = "inline-block"));
  });

  /* generic reveals */
  const rvs = gsap.utils.toArray(".rv");
  const showRv = (el, i = 0) => { if (el._shown) return; el._shown = true; gsap.fromTo(el, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: (i % 4) * 0.08 }); };
  rvs.forEach((el, i) => ScrollTrigger.create({ trigger: el, start: "top 92%", once: true, onEnter: () => showRv(el, i) }));
  /* safety net: anything already on or above the screen (reload mid-page, jump links) gets shown */
  const sweep = () => rvs.forEach((el, i) => { if (!el._shown && el.getBoundingClientRect().top < innerHeight * 0.95) showRv(el, i); });
  window.addEventListener("scroll", () => requestAnimationFrame(sweep), { passive: true });
  setTimeout(sweep, 400);

  /* stats counters */
  const st = gsap.timeline({ scrollTrigger: { trigger: ".stats", start: "top 80%" } });
  $$(".stat .n[data-count]").forEach((el, i) => slot(el, el.dataset.count, st, 0.2 + i * 0.1));
  st.fromTo($$(".stat"), { "--p": 0 }, { "--p": 1, duration: 1.2, ease: "power2.out", stagger: 0.1 }, 0.2);

  /* services: cards come in with a slight skew */
  gsap.utils.toArray(".svc .ph img, .svc .ph video").forEach((m) =>
    gsap.fromTo(m, { scale: 1.25 }, { scale: 1, ease: "none", scrollTrigger: { trigger: m, start: "top bottom", end: "bottom top", scrub: true } }));

  /* packages: fan in from the sides on desktop */
  ScrollTrigger.matchMedia({
    "(min-width: 980px)": () => {
      const st = { trigger: ".pk-grid", start: "top 85%", end: "top 35%", scrub: 0.8 };
      gsap.fromTo(".pk.grey", { xPercent: 10, rotationY: 14, opacity: 0.3 }, { xPercent: 0, rotationY: 0, opacity: 1, ease: "none", scrollTrigger: st });
      gsap.fromTo(".pk.plus", { xPercent: -10, rotationY: -14, opacity: 0.3 }, { xPercent: 0, rotationY: 0, opacity: 1, ease: "none", scrollTrigger: { ...st } });
      gsap.fromTo(".pk.black", { yPercent: 12, scale: 0.92, opacity: 0.3 }, { yPercent: 0, scale: 1, opacity: 1, ease: "none", scrollTrigger: { ...st } });
    },
    "(max-width: 979px)": () => {
      gsap.utils.toArray(".pk").forEach((c) => gsap.fromTo(c, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: c, start: "top 92%", once: true } }));
    },
  });

  /* academy graph */
  const gt = gsap.timeline({ scrollTrigger: { trigger: "#graph", start: "top 75%" } });
  slot($("#cntMain"), 10, gt, 0.1, 1.2);
  $$("#rows .gr").forEach((r, i) => { gt.to(r.querySelector(".fill"), { scaleX: 1, duration: 1.0, ease: "power3.out" }, 0.3 + i * 0.15); slot(r.querySelector(".n"), r.querySelector(".n").dataset.n, gt, 0.3 + i * 0.15, 0.9); });
  gt.from(".free", { scale: 0.6, opacity: 0, duration: 0.6, ease: "back.out(2)" }, 1.0);

  /* about photo parallax */
  gsap.fromTo(".about .photo img", { yPercent: -8, scale: 1.15 }, { yPercent: 8, scale: 1.15, ease: "none", scrollTrigger: { trigger: ".about .photo", start: "top bottom", end: "bottom top", scrub: true } });

  /* process: red rail fills, steps light up */
  gsap.to("#steps .rail i", { scaleY: 1, ease: "none", scrollTrigger: { trigger: "#steps", start: "top 70%", end: "bottom 60%", scrub: 0.5 } });
  $$("#steps .step").forEach((s) => ScrollTrigger.create({ trigger: s, start: "top 62%", onEnter: () => s.classList.add("on"), onLeaveBack: () => s.classList.remove("on") }));

  /* final headline grows as it comes in */
  gsap.fromTo(".final .h2", { scale: 0.8 }, { scale: 1, ease: "none", scrollTrigger: { trigger: ".final", start: "top bottom", end: "center center", scrub: true } });


  /* magnetic buttons on desktop */
  if (desktop.matches) $$(".mag").forEach((b) => {
    const x = gsap.quickTo(b, "x", { duration: 0.4, ease: "power3" }), y = gsap.quickTo(b, "y", { duration: 0.4, ease: "power3" });
    b.addEventListener("mousemove", (e) => { const r = b.getBoundingClientRect(); x((e.clientX - r.left - r.width / 2) * 0.25); y((e.clientY - r.top - r.height / 2) * 0.35); });
    b.addEventListener("mouseleave", () => { x(0); y(0); });
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
