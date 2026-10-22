/* Stranice usluga: lagan skript (meni, header, pojavljivanje sekcija) */
(() => {
  const $ = (s) => document.querySelector(s);
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const yr = $("#yr"); if (yr) yr.textContent = new Date().getFullYear();

  const hdr = $("#hdr");
  const onScroll = () => hdr.classList.toggle("scrolled", window.scrollY > 30);
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  const burger = $("#burger"), menu = $("#mmenu");
  const close = () => { document.body.classList.remove("menu-open"); burger.setAttribute("aria-expanded", "false"); menu.setAttribute("aria-hidden", "true"); };
  burger.addEventListener("click", () => {
    if (document.body.classList.contains("menu-open")) return close();
    document.body.classList.add("menu-open"); burger.setAttribute("aria-expanded", "true"); menu.setAttribute("aria-hidden", "false");
  });
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));

  const els = document.querySelectorAll(".rv");
  if (reduce || !("IntersectionObserver" in window)) { els.forEach((e) => (e.style.opacity = 1)); return; }
  const io = new IntersectionObserver((ents) => ents.forEach((en) => {
    if (!en.isIntersecting) return;
    en.target.classList.add("in"); io.unobserve(en.target);
  }), { rootMargin: "0px 0px -8% 0px" });
  els.forEach((e) => io.observe(e));
})();
