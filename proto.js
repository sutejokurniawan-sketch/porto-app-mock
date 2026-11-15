/* Porto App clickable prototype. Fictional sample data only. */
(function () {
  "use strict";

  const ROUTES = {
    home: "index.html",
    portfolio: "02-portfolio.html",
    antam: "03-instrument-antam.html",
    innova: "04-asset-car.html",
    add: "05-add-asset.html",
    sell: "06-dispose-sell.html",
    hibah: "07-dispose-hibah.html",
    liabilities: "08-liabilities.html",
    tax: "09-tax-l1.html",
    vault: "10-vault.html",
    prices: "11-prices.html",
    settings: "12-settings.html",
    more: "more.html",
    brand: "00-brand-system.html",
    d1: "d1-dashboard.html",
    d2: "d2-tax-l1.html",
    d3: "d3-prices.html",
  };

  const FILE_ALIASES = {
    "": "index.html",
    "01-dashboard.html": "index.html",
  };

  const TOAST_MSG = "Not in the prototype yet";

  function currentFile() {
    let p = location.pathname.split("/").pop() || "index.html";
    if (FILE_ALIASES[p]) p = FILE_ALIASES[p];
    return p;
  }

  function screenId() {
    const f = location.pathname.split("/").pop() || "index.html";
    if (f === "" || f === "index.html" || f === "01-dashboard.html") return "01-dashboard";
    return f.replace(/\.html$/, "");
  }

  function samePage(href) {
    const file = (href || "").split("?")[0].split("#")[0].split("/").pop() || "index.html";
    const resolved = FILE_ALIASES[file] || file;
    return resolved === currentFile();
  }

  function go(href) {
    if (!href || samePage(href)) return;
    location.href = href;
  }

  function goBack(fallback) {
    try {
      if (document.referrer) {
        const r = new URL(document.referrer);
        if (r.origin === location.origin) {
          history.back();
          return;
        }
      }
    } catch (e) { /* ignore */ }
    go(fallback || ROUTES.home);
  }

  function mark(el, kind) {
    if (!el) return el;
    el.setAttribute("data-proto", kind || "bound");
    return el;
  }

  function bindNav(el, href) {
    if (!el) return;
    mark(el, "nav");
    el.setAttribute("data-href", href);
    el.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      press(el);
      if (samePage(href)) return;
      go(href);
    });
  }

  function bindBack(el, fallback) {
    if (!el) return;
    mark(el, "back");
    el.setAttribute("data-href", fallback || ROUTES.home);
    el.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      press(el);
      goBack(fallback || ROUTES.home);
    });
  }

  function bindToast(el, msg) {
    if (!el) return;
    mark(el, "toast");
    el.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      press(el);
      toast(msg || TOAST_MSG);
    });
  }

  function bindAction(el, fn) {
    if (!el) return;
    mark(el, "action");
    el.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      press(el);
      fn(e, el);
    });
  }

  function press(el) {
    if (!el) return;
    el.classList.add("proto-press");
    setTimeout(function () { el.classList.remove("proto-press"); }, 140);
  }

  let toastTimer = 0;
  function toast(msg) {
    let el = document.querySelector(".proto-toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "proto-toast";
      el.setAttribute("role", "status");
      mountToast(el);
    }
    el.textContent = msg || TOAST_MSG;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, 1800);
  }

  function mountToast(el) {
    const host = document.querySelector(".phone") || document.querySelector(".desk") || document.body;
    host.appendChild(el);
  }

  function text(el) {
    return (el && el.textContent || "").replace(/\s+/g, " ").trim();
  }

  function contains(el, needle) {
    return text(el).indexOf(needle) !== -1;
  }

  function findByText(root, selector, needle, exact) {
    const nodes = (root || document).querySelectorAll(selector);
    for (let i = 0; i < nodes.length; i++) {
      const t = text(nodes[i]);
      if (exact ? t === needle : t.indexOf(needle) !== -1) return nodes[i];
    }
    return null;
  }

  function closestCard(el) {
    return el && el.closest ? el.closest(".card") : null;
  }

  /* ---------- layout chrome ---------- */

  function setupLayout() {
    const phone = document.querySelector(".phone");
    const desk = document.querySelector(".desk");
    const sid = screenId();

    if (phone) {
      document.body.classList.add("mobile-screen");
      const extras = Array.from(phone.children).filter(function (ch) {
        return !ch.classList.contains("status") &&
          !ch.classList.contains("hdr") &&
          !ch.classList.contains("content") &&
          !ch.classList.contains("tabbar") &&
          !ch.classList.contains("proto-toast") &&
          !ch.classList.contains("proto-sheet") &&
          !ch.classList.contains("proto-watermark");
      });
      const hasTab = !!phone.querySelector(".tabbar");
      const hasSheet = !!phone.querySelector(".sheet");
      const hasFooter = extras.some(function (ch) {
        return ch.querySelector && ch.querySelector(".btn") && getComputedStyle(ch).position === "absolute";
      });
      if (hasTab) phone.classList.add("has-tabbar");
      if (hasFooter && !hasSheet) phone.classList.add("has-footer");
      if (hasFooter && hasTab) phone.classList.add("has-overtab");

      const wm = document.createElement("div");
      wm.className = "proto-watermark";
      wm.textContent = "Fictional sample data";
      phone.appendChild(wm);
    } else if (desk) {
      document.body.classList.add("desk-screen");
      const wrap = document.createElement("div");
      wrap.className = "desk-wrap";
      desk.parentNode.insertBefore(wrap, desk);
      wrap.appendChild(desk);
    }

    addSwitch(sid, !!desk);
    addCaption(phone, desk);
    if (desk) injectDesktopExtras(desk);
    fit();
    window.addEventListener("resize", fit);
  }

  function addSwitch(sid, isDesk) {
    const bar = document.createElement("div");
    bar.className = "proto-switch";
    const mobile = document.createElement("a");
    mobile.href = ROUTES.home;
    mobile.textContent = "Mobile app";
    if (!isDesk) mobile.classList.add("on");
    const desktop = document.createElement("a");
    desktop.href = ROUTES.d1;
    desktop.textContent = "Desktop";
    if (isDesk) desktop.classList.add("on");
    bar.appendChild(mobile);
    bar.appendChild(desktop);
    document.body.appendChild(bar);
  }

  function addCaption(phone, desk) {
    const cap = document.createElement("div");
    cap.className = "proto-chrome proto-caption";
    cap.textContent = "Porto App prototype · fictional sample data";
    document.body.appendChild(cap);
  }

  function injectDesktopExtras(desk) {
    const side = desk.querySelector(".side");
    if (!side || side.querySelector(".proto-side-link")) return;
    const a = document.createElement("a");
    a.className = "proto-side-link";
    a.href = ROUTES.home;
    a.textContent = "Open mobile app";
    mark(a, "nav");
    const note = document.createElement("div");
    note.className = "proto-side-note";
    note.textContent = "Fictional sample data";
    side.appendChild(a);
    side.appendChild(note);
  }

  function fit() {
    const phone = document.querySelector(".phone");
    const desk = document.querySelector(".desk");
    const wrap = document.querySelector(".desk-wrap");
    const cap = document.querySelector(".proto-caption");
    const wide = window.innerWidth >= 800;

    if (phone && document.body.classList.contains("mobile-screen")) {
      if (!wide) {
        phone.style.transform = "";
        if (phone.parentElement && phone.parentElement.classList.contains("proto-phone-stage")) {
          const st = phone.parentElement;
          st.style.width = "";
          st.style.height = "";
        }
        document.body.classList.remove("desk-framed");
        return;
      }
      document.body.classList.add("desk-framed");
      let stage = phone.parentElement;
      if (!stage.classList.contains("proto-phone-stage")) {
        stage = document.createElement("div");
        stage.className = "proto-phone-stage";
        phone.parentNode.insertBefore(stage, phone);
        stage.appendChild(phone);
        if (cap) stage.appendChild(cap);
      }
      const bezel = 20;
      const availW = window.innerWidth - 48;
      const availH = window.innerHeight - 96;
      const s = Math.min(1, availW / (390 + bezel), availH / (844 + bezel + 28));
      phone.style.transform = s < 0.999 ? "scale(" + s + ")" : "";
      stage.style.width = Math.round(390 * s) + "px";
      stage.style.height = Math.round(844 * s) + "px";
    }

    if (desk && wrap) {
      const s = Math.min(1, (window.innerWidth - 32) / 1440, (window.innerHeight - 88) / 900);
      desk.style.transform = "scale(" + s + ")";
      wrap.style.width = Math.round(1440 * s) + "px";
      wrap.style.height = Math.round(900 * s) + "px";
    }
  }

  /* ---------- action sheet ---------- */

  function actionSheet(title, items) {
    closeSheet();
    const host = document.querySelector(".phone") || document.body;
    const root = document.createElement("div");
    root.className = "proto-sheet open";
    root.innerHTML = '<div class="proto-sheet-backdrop"></div><div class="proto-sheet-card"><div class="grab"></div></div>';
    const card = root.querySelector(".proto-sheet-card");
    if (title) {
      const h = document.createElement("div");
      h.className = "proto-sheet-title";
      h.textContent = title;
      card.appendChild(h);
    }
    items.forEach(function (item) {
      const row = document.createElement("div");
      row.className = "proto-sheet-item";
      if (item.sub) {
        row.innerHTML = "<div><div>" + escapeHtml(item.label) + "</div><span class=\"s\">" + escapeHtml(item.sub) + "</span></div>";
      } else {
        row.textContent = item.label;
      }
      row.addEventListener("click", function () {
        closeSheet();
        if (item.href) go(item.href);
        else if (item.toast) toast(item.toast === true ? TOAST_MSG : item.toast);
        else if (item.fn) item.fn();
      });
      card.appendChild(row);
    });
    const cancel = document.createElement("div");
    cancel.className = "proto-sheet-cancel";
    cancel.textContent = "Cancel";
    cancel.addEventListener("click", closeSheet);
    card.appendChild(cancel);
    root.querySelector(".proto-sheet-backdrop").addEventListener("click", closeSheet);
    host.appendChild(root);
  }

  function closeSheet() {
    document.querySelectorAll(".proto-sheet").forEach(function (el) { el.remove(); });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }

  /* ---------- interactions ---------- */

  function wireSegments() {
    document.querySelectorAll(".seg").forEach(function (seg) {
      const sid = screenId();
      seg.querySelectorAll(":scope > div").forEach(function (btn) {
        bindAction(btn, function () {
          const label = text(btn);
          if ((sid === "06-dispose-sell" || sid === "07-dispose-hibah")) {
            if (label === "Sell") { go(ROUTES.sell); return; }
            if (label.indexOf("hibah") !== -1 || label.indexOf("Gift") !== -1) { go(ROUTES.hibah); return; }
            toast(TOAST_MSG);
            return;
          }
          activateSibling(seg, btn, ":scope > div");
        });
      });
    });
  }

  function activateSibling(parent, btn, selector) {
    const inHero = !!btn.closest(".hero");
    parent.querySelectorAll(selector).forEach(function (d) {
      d.classList.remove("on");
      if (inHero) {
        d.style.background = "transparent";
        d.style.color = "rgba(255,255,255,.6)";
        d.style.boxShadow = "none";
      }
    });
    btn.classList.add("on");
    if (inHero) {
      btn.style.background = "rgba(255,255,255,.16)";
      btn.style.color = "#fff";
      btn.style.boxShadow = "none";
    }
  }

  function wireChips() {
    document.querySelectorAll(".chips").forEach(function (group) {
      group.querySelectorAll(".chip").forEach(function (chip) {
        bindAction(chip, function () {
          activateSibling(group, chip, ".chip");
        });
      });
    });
  }

  function wireToggles() {
    document.querySelectorAll(".toggle").forEach(function (tog) {
      bindAction(tog, function () { tog.classList.toggle("on"); });
    });
  }

  function wireTabs() {
    document.querySelectorAll(".tabbar .tab").forEach(function (tab) {
      const label = text(tab.querySelector("span") || tab);
      if (tab.classList.contains("fab") || !label) {
        bindNav(tab, ROUTES.add);
        return;
      }
      const map = { Home: ROUTES.home, Portfolio: ROUTES.portfolio, Tax: ROUTES.tax, More: ROUTES.more };
      if (map[label]) bindNav(tab, map[label]);
    });
  }

  function firstHdrIcon() {
    const hdr = document.querySelector(".hdr");
    if (!hdr) return null;
    return hdr.querySelector(".iconbtn");
  }

  function isBackIcon(btn) {
    if (!btn) return false;
    const p = btn.querySelector("path");
    const d = (p && p.getAttribute("d")) || "";
    return d.indexOf("15 5l-7 7 7 7") !== -1 || d.indexOf("M15 5l-7 7 7 7") !== -1;
  }

  function wireEye() {
    const sid = screenId();
    if (sid !== "01-dashboard") return;
    const hdr = document.querySelector(".hdr");
    if (!hdr) return;
    const btns = hdr.querySelectorAll(".iconbtn");
    if (!btns[0]) return;
    bindAction(btns[0], function () {
      const hidden = document.body.classList.toggle("amounts-hidden");
      try { sessionStorage.setItem("porto-hide-amounts", hidden ? "1" : "0"); } catch (e) {}
      applyHiddenAmounts(hidden);
    });
    try {
      if (sessionStorage.getItem("porto-hide-amounts") === "1") {
        document.body.classList.add("amounts-hidden");
        applyHiddenAmounts(true);
      }
    } catch (e) {}
  }

  const hiddenCache = new Map();
  function applyHiddenAmounts(hidden) {
    const candidates = document.querySelectorAll(
      ".num, .hero .num, .it .v, .it .r, .kv span:last-child, .pill.pos, .pill.neg"
    );
    candidates.forEach(function (el, i) {
      const t = el.textContent;
      if (!/[Rp%\d]/.test(t)) return;
      const key = el;
      if (hidden) {
        if (!hiddenCache.has(key)) hiddenCache.set(key, el.innerHTML);
        const compact = t.trim().length <= 6 ? "••" : "••••••";
        if (/^Rp/.test(t.trim()) || t.indexOf("Rp") !== -1) el.textContent = "Rp " + compact;
        else if (/%/.test(t)) el.textContent = "••%";
        else el.textContent = compact;
      } else if (hiddenCache.has(key)) {
        el.innerHTML = hiddenCache.get(key);
      }
    });
    // eye icon: swap to a slashed eye when hidden
    const eye = document.querySelector(".hdr .iconbtn");
    if (eye && eye.querySelector("svg")) {
      /* leave the icon; opacity signals state */
      eye.style.opacity = hidden ? ".45" : "";
    }
  }

  /* ---------- per-screen wiring ---------- */

  function wireDashboard() {
    const hdr = document.querySelector(".hdr");
    if (hdr) {
      const btns = hdr.querySelectorAll(".iconbtn");
      if (btns[1]) bindToast(btns[1]); // bell
    }
    const pricePill = findByText(document, ".pill, .hero span", "Prices ");
    if (pricePill) bindNav(pricePill, ROUTES.prices);

    const grid = document.querySelector(".grid2");
    if (grid) {
      const cards = grid.querySelectorAll(":scope > .card");
      if (cards[0]) bindNav(cards[0], ROUTES.portfolio);
      if (cards[1]) bindNav(cards[1], ROUTES.liabilities);
    }

    const spt = findByText(document, ".card", "SPT 2026 snapshot");
    if (spt) bindNav(spt, ROUTES.tax);

    // allocation legend rows
    const alloc = findByText(document, ".card", "Allocation");
    if (alloc) {
      alloc.querySelectorAll(".between").forEach(function (row) {
        const t = text(row);
        if (t.indexOf("Gold") !== -1) bindNav(row, ROUTES.antam);
        else if (t.indexOf("Vehicles") !== -1) bindNav(row, ROUTES.innova);
        else if (t.indexOf("%") !== -1) bindNav(row, ROUTES.portfolio);
      });
    }
  }

  function wirePortfolio() {
    document.querySelectorAll(".hdr .iconbtn").forEach(function (b) { bindToast(b); });
    document.querySelectorAll(".it").forEach(function (it) {
      const t = text(it);
      if (t.indexOf("Emas Antam") !== -1) bindNav(it, ROUTES.antam);
      else bindToast(it);
    });
    document.querySelectorAll(".card").forEach(function (card) {
      if (card.querySelector(".it")) return;
      const t = text(card);
      if (t.indexOf("Land &") !== -1 || t.indexOf("Cash &") !== -1) bindToast(card);
    });
  }

  function wireAntam() {
    const back = firstHdrIcon();
    if (back) bindBack(back, ROUTES.portfolio);
    const more = document.querySelectorAll(".hdr .iconbtn")[1];
    if (more) {
      bindAction(more, function () {
        actionSheet("Emas Antam", [
          { label: "Gift · hibah", sub: "20 g of 85 g", href: ROUTES.hibah },
          { label: "Update price", href: ROUTES.prices },
          { label: "Sell this holding", toast: true },
        ]);
      });
    }
    document.querySelectorAll(".btn").forEach(function (btn) {
      const t = text(btn);
      if (t.indexOf("Sell") !== -1 || t.indexOf("gift") !== -1) {
        bindAction(btn, function () {
          actionSheet("Dispose Emas Antam", [
            { label: "Gift · hibah", sub: "Nadia · 20 g", href: ROUTES.hibah },
            { label: "Sell", toast: true },
          ]);
        });
      } else if (t.indexOf("Update price") !== -1) {
        bindNav(btn, ROUTES.prices);
      }
    });
  }

  function wireCar() {
    const back = firstHdrIcon();
    if (back) bindBack(back, ROUTES.portfolio);
    const edit = document.querySelectorAll(".hdr .iconbtn")[1];
    if (edit) {
      bindAction(edit, function () {
        actionSheet("Innova Zenix", [
          { label: "Documents in vault", href: ROUTES.vault },
          { label: "Linked loan", sub: "Toyota Astra Financial", href: ROUTES.liabilities },
          { label: "Dispose this asset", toast: true },
        ]);
      });
    }
    document.querySelectorAll(".it").forEach(function (it) {
      const t = text(it);
      if (t.indexOf("BPKB") !== -1 || t.indexOf("STNK") !== -1 || t.indexOf("Faktur") !== -1) {
        bindNav(it, ROUTES.vault);
      } else {
        bindToast(it);
      }
    });
    const addVal = findByText(document, ".pill", "Add valuation");
    if (addVal) bindToast(addVal);
    const loan = findByText(document, ".card", "Linked loan");
    if (loan) bindNav(loan, ROUTES.liabilities);
    const docsHead = findByText(document, ".h2", "Documents");
    if (docsHead) {
      const five = docsHead.parentElement && docsHead.parentElement.querySelector("span");
      if (five && text(five).indexOf("files") !== -1) bindNav(five, ROUTES.vault);
    }
  }

  function wireAdd() {
    const back = firstHdrIcon();
    if (back) bindBack(back, ROUTES.home);
    const cancel = findByText(document.querySelector(".hdr"), "span", "Cancel", true);
    if (cancel) bindBack(cancel, ROUTES.home);
    // class picker
    const grid = document.querySelector('[style*="repeat(6,1fr)"]');
    if (grid) {
      grid.querySelectorAll(":scope > div").forEach(function (tile) {
        bindAction(tile, function () {
          grid.querySelectorAll(":scope > div").forEach(function (d) {
            d.style.borderColor = "var(--line)";
            d.style.background = "#fff";
          });
          tile.style.borderColor = "var(--jati3)";
          tile.style.background = "#EEF6F2";
        });
      });
    }
    document.querySelectorAll(".field").forEach(function (f) { bindToast(f); });
    const attach = findByText(document, "div", "Attach receipt");
    if (attach) bindToast(attach.closest("div[style], .card") || attach);
    const review = document.querySelector(".btn.primary");
    if (review) bindToast(review);
  }

  function wireDispose(fallback) {
    const back = firstHdrIcon();
    if (back) bindBack(back, fallback);
    document.querySelectorAll(".btn.primary").forEach(function (btn) { bindToast(btn); });
    document.querySelectorAll(".field").forEach(function (f) { bindToast(f); });
  }

  function wireLiabilities() {
    const plus = document.querySelector(".hdr .iconbtn");
    if (plus) bindToast(plus);
    document.querySelectorAll(".content > .card").forEach(function (card) {
      const t = text(card);
      if (t.indexOf("Innova") !== -1) bindNav(card, ROUTES.innova);
      else if (t.indexOf("Total outstanding") !== -1) return;
      else bindToast(card);
    });
  }

  function wireTax() {
    const cal = document.querySelector(".hdr .iconbtn");
    if (cal) bindToast(cal);
    document.querySelectorAll(".btn").forEach(function (btn) { bindToast(btn); });
    // issue rows: Review / Add / Fix
    document.querySelectorAll(".card .row").forEach(function (row) {
      const t = text(row);
      if (t.indexOf("Bitcoin") !== -1) bindNav(row, ROUTES.portfolio);
      else if (t.indexOf("Review") !== -1 || t.indexOf("Add") !== -1 || t.indexOf("Fix") !== -1) bindToast(row);
    });
    document.querySelectorAll(".it").forEach(function (it) {
      const t = text(it);
      if (t.indexOf("Saham") !== -1) bindNav(it, ROUTES.portfolio);
      else if (t.indexOf("Jenius") !== -1 || t.indexOf("Bitcoin") !== -1 || t.indexOf("Panakkukang") !== -1) bindToast(it);
    });
  }

  function wireVault() {
    const up = document.querySelector(".hdr .iconbtn");
    if (up) bindToast(up);
    const search = findByText(document, ".content .row, .content div", "Search deeds");
    if (search) bindToast(search);
    document.querySelectorAll(".grid3 > .card").forEach(function (card) {
      const t = text(card);
      if (t.indexOf("Vehicles") !== -1) bindNav(card, ROUTES.innova);
      else if (t.indexOf("Tax") !== -1) bindNav(card, ROUTES.tax);
      else if (t.indexOf("Investments") !== -1) bindNav(card, ROUTES.portfolio);
      else if (t.indexOf("Hibah") !== -1) bindNav(card, ROUTES.hibah);
      else if (t.indexOf("Bank") !== -1) bindNav(card, ROUTES.liabilities);
      else bindToast(card);
    });
    const warn = findByText(document, ".card", "no supporting document");
    if (warn) bindToast(warn);
    const seeAll = findByText(document, "span, .h2 ~ span, .between span", "See all");
    if (seeAll) bindToast(seeAll);
    document.querySelectorAll(".it").forEach(function (it) {
      const t = text(it);
      if (t.indexOf("Antam") !== -1) bindNav(it, ROUTES.antam);
      else bindToast(it);
    });
  }

  function wirePrices() {
    const refresh = document.querySelector(".hdr .iconbtn");
    if (refresh) bindToast(refresh);
    const sheet = document.querySelector(".sheet");
    const overlay = sheet && sheet.previousElementSibling;
    function hideSheet() {
      if (sheet) sheet.style.display = "none";
      if (overlay) overlay.style.display = "none";
    }
    function showSheet() {
      if (sheet) sheet.style.display = "";
      if (overlay) overlay.style.display = "";
    }
    if (sheet) {
      const x = sheet.querySelector(".iconbtn");
      if (x) bindAction(x, hideSheet);
      if (overlay) bindAction(overlay, hideSheet);
      sheet.querySelectorAll(".btn").forEach(function (btn) {
        bindAction(btn, function () {
          toast(TOAST_MSG);
          hideSheet();
        });
      });
      const src = sheet.querySelector(".field");
      sheet.querySelectorAll(".field").forEach(function (f) { bindToast(f); });
    }
    document.querySelectorAll(".content .it, .card .it").forEach(function (it) {
      const t = text(it);
      if (t.indexOf("Emas Antam") !== -1) bindNav(it, ROUTES.antam);
      else if (t.indexOf("Pasar Uang") !== -1 || t.indexOf("stale") !== -1) {
        bindAction(it, showSheet);
      } else {
        bindToast(it);
      }
    });
  }

  function wireSettings() {
    const shield = document.querySelector(".hdr .iconbtn");
    if (shield) bindToast(shield);
    const profile = document.querySelector(".content > .card");
    if (profile && contains(profile, "Sutejo")) bindToast(profile);
    document.querySelectorAll(".it").forEach(function (it) {
      if (it.querySelector(".toggle")) return; // already wired
      bindToast(it);
    });
  }

  function wireMore() {
    // more.html uses data-href already; still bind anything leftover
  }

  function wireDesktop() {
    const sid = screenId();
    const navMap = {
      "Dashboard": ROUTES.d1,
      "Portfolio": ROUTES.portfolio,
      "Prices & tickers": ROUTES.d3,
      "Liabilities": ROUTES.liabilities,
      "Tax · SPT L-1": ROUTES.d2,
      "Document vault": ROUTES.vault,
      "Family members": ROUTES.settings,
      "Settings": ROUTES.settings,
    };
    document.querySelectorAll(".side .nav > div").forEach(function (item) {
      if (item.classList.contains("sec")) return;
      const t = text(item);
      if (t === "Disposals") {
        bindAction(item, function () {
          actionSheet("Disposals", [
            { label: "Sell land · Gowa", href: ROUTES.sell },
            { label: "Gift · hibah · Emas Antam", href: ROUTES.hibah },
          ]);
        });
        return;
      }
      if (navMap[t]) bindNav(item, navMap[t]);
    });

    const lock = findByText(document, ".side div", "Year-end lock");
    if (lock) bindNav(lock.closest('[style*="margin-top:auto"]') || lock, ROUTES.d2);
    const who = findByText(document, ".side div", "Sutejo Kurniawan");
    if (who) bindNav(who.closest(".row") || who, ROUTES.settings);

    document.querySelectorAll(".btn").forEach(function (btn) {
      const t = text(btn);
      if (t === "Add" || t === "New instrument") bindNav(btn, ROUTES.add);
      else bindToast(btn);
    });

    const search = document.querySelector(".search");
    if (search) bindToast(search);

    // named holdings on desktop pages
    document.querySelectorAll(".it, tr, .card").forEach(function (el) {
      if (el.getAttribute("data-proto")) return;
      const t = text(el);
      if (!t || t.length > 180) return;
      if (t.indexOf("Emas Antam") !== -1 || t.indexOf("GOLD-ANTAM") !== -1 || (t.indexOf("Antam") !== -1 && t.indexOf("g") !== -1)) {
        if (el.closest(".side")) return;
        if (el.classList.contains("card") && t.indexOf("Allocation") !== -1) return;
        bindNav(el, ROUTES.antam);
      }
    });
  }

  function wireBrand() {
    const home = document.createElement("a");
    // brand page is a 1440 board; treat as desk-like
    document.body.classList.add("desk-screen");
  }

  function wireCatchAll() {
    const selectors = [
      ".btn", ".iconbtn", ".tab", ".it", ".field", ".chip",
      ".pill", ".side .nav > div"
    ];
    document.querySelectorAll(selectors.join(",")).forEach(function (el) {
      if (el.getAttribute("data-proto")) return;
      if (el.classList.contains("sec")) return;
      if (el.closest("[data-proto]")) return;
      bindToast(el);
    });
  }

  function wireScreen() {
    const sid = screenId();
    wireTabs();
    wireSegments();
    wireChips();
    wireToggles();
    wireEye();

    switch (sid) {
      case "01-dashboard": wireDashboard(); break;
      case "02-portfolio": wirePortfolio(); break;
      case "03-instrument-antam": wireAntam(); break;
      case "04-asset-car": wireCar(); break;
      case "05-add-asset": wireAdd(); break;
      case "06-dispose-sell": wireDispose(ROUTES.portfolio); break;
      case "07-dispose-hibah": wireDispose(ROUTES.antam); break;
      case "08-liabilities": wireLiabilities(); break;
      case "09-tax-l1": wireTax(); break;
      case "10-vault": wireVault(); break;
      case "11-prices": wirePrices(); break;
      case "12-settings": wireSettings(); break;
      case "more": wireMore(); break;
      case "d1-dashboard":
      case "d2-tax-l1":
      case "d3-prices":
        wireDesktop();
        break;
      case "00-brand-system":
        wireBrand();
        break;
    }
    wireCatchAll();
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupLayout();
    wireScreen();
  });
})();
