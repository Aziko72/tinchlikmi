(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const OY = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
  const PLAY = '<span class="play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span>';
  let DATA = { videos: [], channel: { url: "https://www.youtube.com/@tinchlikm" } };

  const esc = (s) => String(s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  function fmtDate(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return "";
    return `${d.getDate()}-${OY[d.getMonth()]}, ${d.getFullYear()}`;
  }
  function ago(iso) {
    const s = (Date.now() - new Date(iso)) / 1000;
    if (s < 3600) return Math.max(1, Math.round(s / 60)) + " daqiqa oldin";
    if (s < 86400) return Math.round(s / 3600) + " soat oldin";
    if (s < 86400 * 7) return Math.round(s / 86400) + " kun oldin";
    return fmtDate(iso);
  }
  function thumb(id, hi) {
    return `https://i.ytimg.com/vi/${id}/${hi ? "maxresdefault" : "hqdefault"}.jpg`;
  }
  function imgTag(v, hi) {
    // maxres yo'q bo'lsa hq ga tushadi
    return `<img src="${thumb(v.id, hi)}" alt="" loading="${hi ? "eager" : "lazy"}" onerror="this.onerror=null;this.src='${thumb(v.id, false)}'">`;
  }
  function plainDesc(t) {
    return String(t || "").replace(/\*\*/g, "").replace(/#\S+/g, "").replace(/\n{3,}/g, "\n\n").trim();
  }
  function richDesc(t) {
    let h = esc(t);
    h = h.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    h = h.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    return h;
  }

  function card(v) {
    return `<a class="card" href="#/v/${encodeURIComponent(v.id)}">
      <div class="card-media">${imgTag(v, false)}${PLAY}</div>
      <div class="card-body"><span class="date">${esc(ago(v.published))}</span><h3>${esc(v.title)}</h3></div>
    </a>`;
  }

  function renderHome() {
    const vids = DATA.videos;
    const hero = $("hero");
    if (!vids.length) {
      hero.innerHTML = `<div class="hero"><div class="hero-body"><h3>Birinchi videolar tez orada</h3><p>Yangi video YouTube kanalda chiqishi bilan shu yerda avtomatik paydo bo‘ladi.</p></div></div>`;
      $("grid").innerHTML = "";
      $("count").textContent = "";
      return;
    }
    const v = vids[0];
    hero.innerHTML = `<a class="hero" href="#/v/${encodeURIComponent(v.id)}">
      <div class="hero-media">${imgTag(v, true)}${PLAY}</div>
      <div class="hero-body">
        <div class="tag-row"><span class="tag red">ENG SO‘NGGI</span><span class="date">${esc(fmtDate(v.published))}</span></div>
        <h1>${esc(v.title)}</h1>
        <p>${esc(plainDesc(v.description))}</p>
        <span class="watch">▶ Tomosha qilish</span>
      </div></a>`;
    const rest = vids.slice(1);
    $("grid").innerHTML = rest.map(card).join("");
    $("empty").hidden = rest.length > 0;
    $("count").textContent = `${vids.length} ta video`;
  }

  function renderVideo(id) {
    const v = DATA.videos.find((x) => x.id === id) || { id, title: "Video", description: "", published: "" };
    // Avval muqova + ▶; bosilganda pleyer yuklanadi (tez ochiladi, avtoplay ham ishlaydi)
    $("player").innerHTML = `<button class="facade" type="button" aria-label="Videoni ijro etish: ${esc(v.title)}">
        ${imgTag(v, true)}${PLAY}</button>`;
    $("player").querySelector(".facade").addEventListener("click", () => {
      $("player").innerHTML = `<iframe src="https://www.youtube.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0&playsinline=1"
        title="${esc(v.title)}" referrerpolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
    });
    $("v-title").textContent = v.title;
    $("v-date").textContent = v.published ? fmtDate(v.published) : "";
    $("v-yt").href = `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`;
    $("v-desc").innerHTML = richDesc(v.description);
    $("v-desc").hidden = !v.description;
    const more = DATA.videos.filter((x) => x.id !== id);
    $("grid-more").innerHTML = more.length ? more.map(card).join("") : `<p class="empty">Boshqa videolar tez orada.</p>`;
    document.title = `${v.title} — Tinchlikmi?`;
  }

  function show(view) {
    ["home", "video", "about"].forEach((n) => ($("view-" + n).hidden = n !== view));
    if (view !== "video") $("player").innerHTML = ""; // videoni to'xtatish
  }

  function route() {
    const h = location.hash || "#/";
    const m = h.match(/^#\/v\/([\w-]{6,20})/);
    if (m) { show("video"); renderVideo(m[1]); }
    else if (h.startsWith("#/haqida")) { show("about"); document.title = "Biz haqimizda — Tinchlikmi?"; }
    else { show("home"); renderHome(); document.title = "Tinchlikmi? — nima yangilik?"; }
    window.scrollTo(0, 0);
  }

  function ticker() {
    const items = DATA.videos.slice(0, 8).map((v) => `<span>${esc(v.title)}</span>`).join("") ||
      "<span>Tinchlikmi? — nima yangilik?</span><span>Dunyo va O‘zbekistondagi eng muhim yangiliklar</span>";
    $("ticker").innerHTML = items + items; // uzluksiz aylanish uchun ikki marta
  }

  $("v-share").addEventListener("click", async () => {
    const btn = $("v-share");
    try { await navigator.clipboard.writeText(location.href); btn.textContent = "Nusxalandi ✓"; }
    catch (e) { btn.textContent = "Nusxalab bo‘lmadi"; }
    setTimeout(() => (btn.textContent = "Havolani nusxalash"), 2000);
  });

  $("year").textContent = new Date().getFullYear();
  $("today").textContent = "· " + fmtDate(new Date().toISOString()).toUpperCase();
  $("hero").innerHTML = '<div class="hero"><div class="hero-media skel"></div><div class="hero-body"><div class="skel" style="height:28px;border-radius:6px"></div><div class="skel" style="height:80px;border-radius:6px"></div></div></div>';

  fetch("data/videos.json?t=" + Math.floor(Date.now() / 300000), { cache: "no-store" })
    .then((r) => r.json())
    .then((d) => { DATA = d; })
    .catch(() => {})
    .finally(() => { ticker(); route(); });

  window.addEventListener("hashchange", route);
})();
