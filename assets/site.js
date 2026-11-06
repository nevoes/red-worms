/* המרכז לתולעי מיחזור – scripts */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* year */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* mobile menu */
  var menuBtn = $(".menu-btn"), nav = $("#nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); }); });
  }

  /* sub-nav active state */
  var sub = $(".subnav");
  if (sub && "IntersectionObserver" in window) {
    var links = $$("a", sub);
    var map = {};
    links.forEach(function (a) { var id = a.getAttribute("href").slice(1); var el = document.getElementById(id); if (el) map[id] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          links.forEach(function (l) { l.classList.remove("active"); });
          var a = map[e.target.id];
          if (a) { a.classList.add("active"); a.scrollIntoView({ block: "nearest", inline: "nearest" }); }
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (id) { io.observe(document.getElementById(id)); });
  }

  /* ---------- worm calculator ---------- */
  var calc = $("[data-calc]");
  if (calc) {
    var startSel = $("#calc-start", calc), months = $("#calc-months", calc), out = $("[data-out]", calc),
        bars = $("[data-bars]", calc), mLabel = $("[data-months-label]", calc), rate = 2;
    var fmt = new Intl.NumberFormat("he-IL");
    for (var m = 2; m <= 24; m += 2) bars.appendChild(document.createElement("span"));
    var render = function () {
      var n0 = +startSel.value, mm = +months.value;
      var val = Math.round(n0 * Math.pow(rate, mm / 2));
      out.textContent = fmt.format(val);
      mLabel.textContent = mm;
      $$("span", bars).forEach(function (b, i) {
        var mo = (i + 1) * 2;
        b.style.height = (8 + 92 * (mo / 24)) + "%";
        b.classList.toggle("cur", mo === mm);
        b.style.opacity = mo > mm ? ".25" : "";
      });
    };
    $$(".seg button", calc).forEach(function (btn) {
      btn.addEventListener("click", function () {
        $$(".seg button", calc).forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
        btn.setAttribute("aria-pressed", "true");
        rate = +btn.dataset.rate; render();
      });
    });
    startSel.addEventListener("change", render);
    months.addEventListener("input", render);
    render();
  }

  /* ---------- order form ---------- */
  var form = $("#order-form");
  if (!form) return;

  // Responses go straight into the existing Google Form (and its response sheet).
  var GF = "https://docs.google.com/forms/d/e/1FAIpQLScWIfrifmex9y87DLySw5ONvS__ECavyHJDNTUrZrHklt2SMg/formResponse";
  var E = {
    name: "entry.1809162659", phone: "entry.1106255378", reason: "entry.1190596547",
    subject: "entry.2044178906", details: "entry.1191236565", ship: "entry.181668298",
    point: "entry.326317742", city: "entry.535554403", street: "entry.858975601", apt: "entry.1223858928",
    notes: "entry.583848214", worms: "entry.64347666", tools: "entry.1287468503", kit: "entry.1174937475",
    status: "entry.97565866"
  };
  var SHIP = {
    sde: { gf: "איסוף עצמי מקיבוץ שדה נחום - ללא עלויות משלוח", label: "איסוף עצמי משדה נחום" },
    tlv: { gf: 'איסוף עצמי מנקודת חלוקה (25 ש"ח)', point: "תל אביב", label: "איסוף מנקודת חלוקה בתל אביב" },
    pt:  { gf: 'איסוף עצמי מנקודת חלוקה (25 ש"ח)', point: "פתח תקוה", label: "איסוף מנקודת חלוקה בפתח תקוה" },
    home:{ gf: 'משלוח עד הבית (45 ש"ח)', label: "משלוח עד הבית" }
  };
  var NAMES = { worms: "חבילת תולעים אדומות", tools: "שני כלי עבודה", placemat: "פלייסמנט הסבר", kit: "הערכה החינוכית" };

  var steps = {}; $$("[data-step]", form).forEach(function (s) { steps[s.dataset.step] = s; });
  var backBtn = $("[data-back]", form), nextBtn = $("[data-next]", form), dots = $$(".steps li", form),
      countEl = $("[data-step-count]", form);
  var cur = "what", sending = false, KEY = "rw-order-v1";

  var val = function (n) { var el = form.elements[n]; if (!el) return ""; if (el.length && !el.tagName) { var c = $$("input[name='" + n + "']:checked", form)[0]; return c ? c.value : ""; } return (el.value || "").trim(); };
  var reason = function () { return val("reason"); };
  var isOrder = function () { return reason() === "הזמנה ותשלום"; };
  var qty = function (item) { var r = $(".qty-row[data-item='" + item + "'] output", form); return r ? +r.textContent : 0; };
  var shipInput = function () { return $("input[name=ship]:checked", form); };

  var totals = function () {
    var lines = [], sum = 0;
    $$(".qty-row", form).forEach(function (row) {
      var q = +$("output", row).textContent, p = +row.dataset.price;
      if (q) { lines.push(NAMES[row.dataset.item] + " × " + q + " = " + q * p + " ₪"); sum += q * p; }
    });
    var s = shipInput(), cost = s ? +s.dataset.cost : 0;
    lines.push(SHIP[s.value].label + ": " + (cost ? cost + " ₪" : "ללא עלות"));
    return { lines: lines, sum: sum + cost, items: sum };
  };

  /* show/hide the parts that depend on the choices */
  var sync = function () {
    var order = isOrder();
    $$("[data-when]", form).forEach(function (b) { b.hidden = (b.dataset.when === "order") !== order; });
    form.elements.reason_other.hidden = reason() !== "__other__";
    form.elements.subject.closest(".field").hidden = reason() === "__other__";
    form.elements.status_other.hidden = val("status") !== "__other__";
    var k = shipInput().dataset.kind || "";
    $$("[data-show]", form).forEach(function (b) { b.hidden = b.dataset.show !== k; });
    var t = totals();
    $("[data-mini-total]", form).textContent = (t.items ? t.sum : 0) + " ₪";
  };

  var show = function (name, focus) {
    cur = name;
    Object.keys(steps).forEach(function (k) { steps[k].hidden = k !== name; });
    var idx = name === "what" ? 0 : 1;
    dots.forEach(function (d, i) { d.className = name === "done" || i < idx ? "done" : i === idx ? "now" : ""; });
    countEl.hidden = name === "done";
    countEl.textContent = "שלב " + (idx + 1) + " מתוך 2";
    backBtn.hidden = name !== "details";
    nextBtn.hidden = name === "done";
    nextBtn.textContent = name === "details" ? (isOrder() ? "שליחת ההזמנה" : "שליחת הפנייה") : "המשך";
    if (name === "details" && isOrder()) {
      var t = totals();
      $("[data-lines]", form).innerHTML = t.lines.map(function (l) { return "<div>" + l + "</div>"; }).join("");
      $("[data-total]", form).textContent = t.sum + " ₪";
    }
    $(".err[data-err=send]", form).hidden = true;
    $(".err[data-err=fields]", form).hidden = true;
    sync();
    if (focus) {
      var h = $("h3", steps[name]);
      form.scrollIntoView({ block: "start" });
      if (h) h.focus({ preventScroll: true });
    }
  };

  var mark = function (el, bad) {
    el.setAttribute("aria-invalid", bad ? "true" : "false");
    if (bad) el.setAttribute("aria-describedby", "f-err"); else el.removeAttribute("aria-describedby");
    return bad;
  };
  var validate = function (name) {
    var first = null, ok = true;
    var need = function (n, extra) { var el = form.elements[n]; var bad = mark(el, !el.value.trim() || (extra && extra(el))); if (bad) { ok = false; first = first || el; } };
    if (name === "what") {
      if (reason() === "__other__") need("reason_other");
      if (isOrder()) {
        var any = ["worms", "tools", "placemat", "kit"].some(function (i) { return qty(i) > 0; });
        $(".err[data-err=products]", form).hidden = any;
        if (!any) { ok = false; first = first || $(".qty-row button", form); }
        if (shipInput().dataset.kind === "home") { need("city"); need("street"); }
      } else {
        if (reason() !== "__other__") need("subject");
        need("details");
      }
    }
    if (name === "details") {
      need("name");
      need("phone", function (el) { return el.value.replace(/\D/g, "").length < 9; });
      if (isOrder()) {
        var st = $$("input[name=status]", form);
        if (!val("status")) { ok = false; first = first || st[0]; $("fieldset", st[0].closest("[data-when]")).classList.add("invalid"); }
        else $$("fieldset.invalid", form).forEach(function (f) { f.classList.remove("invalid"); });
        if (val("status") === "__other__") need("status_other");
      }
    }
    var err = $(".err[data-err=fields]", form);
    err.textContent = name === "details" && isOrder() && !val("status") && first && first.name === "status"
      ? "סמנו מה מצב התשלום כדי לשלוח." : "חסר פרט בשדה המסומן. מלאו אותו כדי להמשיך.";
    err.hidden = !first || (first && first.closest(".qty-row"));
    if (first) first.focus();
    return ok;
  };
  $(".err[data-err=fields]", form).id = "f-err";

  /* remember what was filled in (e.g. while switching to Bit and back) */
  var save = function () {
    try {
      var d = { q: {}, f: {} };
      $$(".qty-row", form).forEach(function (r) { d.q[r.dataset.item] = +$("output", r).textContent; });
      $$("input, textarea", form).forEach(function (el) {
        if (el.type === "radio") { if (el.checked) d.f[el.name] = el.value; }
        else if (el.name) d.f[el.name] = el.value;
      });
      d.step = cur === "done" ? "what" : cur;
      sessionStorage.setItem(KEY, JSON.stringify(d));
    } catch (e) {}
  };
  var restore = function () {
    try {
      var d = JSON.parse(sessionStorage.getItem(KEY) || "null"); if (!d) return false;
      Object.keys(d.q).forEach(function (k) { var o = $(".qty-row[data-item='" + k + "'] output", form); if (o) o.textContent = d.q[k]; });
      $$("input, textarea", form).forEach(function (el) {
        if (!(el.name in d.f)) return;
        if (el.type === "radio") el.checked = el.value === d.f[el.name]; else el.value = d.f[el.name];
      });
      return d.step || "what";
    } catch (e) { return false; }
  };
  var clearSaved = function () { try { sessionStorage.removeItem(KEY); } catch (e) {} };

  var summaryText = function () {
    var s = ["שם: " + val("name"), "טלפון: " + val("phone")];
    if (isOrder()) {
      var t = totals();
      s = s.concat(["הזמנה:"], t.lines, ["סה\"כ: " + t.sum + " ₪"]);
      if (shipInput().dataset.kind === "home") s.push("כתובת: " + [val("street"), val("apt") && "דירה " + val("apt"), val("city")].filter(Boolean).join(", "));
      if (val("notes")) s.push("הערות: " + val("notes"));
    } else {
      s.push("נושא: " + (val("subject") || val("reason_other")), "פירוט: " + val("details"));
    }
    return s.join("\n");
  };

  var send = function () {
    var d = new URLSearchParams();
    d.append(E.name, val("name")); d.append(E.phone, val("phone"));
    var pages = ["0", "1"];
    if (reason() === "__other__") { d.append(E.reason, "__other_option__"); d.append(E.reason + ".other_option_response", val("reason_other")); }
    else d.append(E.reason, reason());
    if (!isOrder()) {
      d.append(E.subject, val("subject")); d.append(E.details, val("details")); pages.push("2");
    } else {
      pages.push("6", "7", "3");
      ["worms", "tools", "kit"].forEach(function (i) { var q = Math.min(3, qty(i)); if (q) d.append(E[i], "כמות: " + q); });
      var s = shipInput(), sh = SHIP[s.value]; d.append(E.ship, sh.gf);
      if (sh.point) { d.append(E.point, sh.point); pages.push("4"); }
      if (s.dataset.kind === "home") { d.append(E.city, val("city")); d.append(E.street, val("street")); d.append(E.apt, val("apt")); }
      var t = totals();
      var notes = [val("notes"), "— פירוט מהאתר —", t.lines.join(" | "), "סה\"כ לתשלום: " + t.sum + " ₪"].filter(Boolean).join("\n");
      d.append(E.notes, notes); pages.push("5");
      if (val("status") === "__other__") { d.append(E.status, "__other_option__"); d.append(E.status + ".other_option_response", val("status_other")); }
      else d.append(E.status, val("status"));
    }
    d.append("fvv", "1"); d.append("pageHistory", pages.join(","));
    return fetch(GF, { method: "POST", mode: "no-cors", body: d });
  };

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate(cur) || sending) return;
    if (cur === "what") { show("details", true); save(); return; }
    if (reason() === "__other__") form.elements.subject.value = val("reason_other");
    sending = true; nextBtn.disabled = true; nextBtn.textContent = "שולחים…";
    send().then(function () {
      $("[data-done-msg]", form).textContent = isOrder()
        ? (val("status").indexOf("שילמתי") === 0 ? "ההזמנה התקבלה. נבדוק את התשלום ונחזור אליכם לתאם את המסירה." : "ההזמנה התקבלה. נחזור אליכם בהקדם להשלמת התשלום ותיאום המסירה.")
        : "הפנייה התקבלה. נחזור אליכם בהקדם.";
      $("[data-summary]", form).textContent = summaryText();
      clearSaved();
      show("done", true);
    }).catch(function () {
      $(".err[data-err=send]", form).hidden = false;
    }).then(function () { sending = false; nextBtn.disabled = false; if (cur !== "done") nextBtn.textContent = isOrder() ? "שליחת ההזמנה" : "שליחת הפנייה"; });
  });

  backBtn.addEventListener("click", function () { show("what", true); save(); });

  form.addEventListener("change", function () { sync(); save(); });
  form.addEventListener("input", function (e) { if (e.target.getAttribute("aria-invalid") === "true" && e.target.value.trim()) mark(e.target, false); save(); });

  // steppers
  $$(".qty-row").forEach(function (row) {
    $$("button", row).forEach(function (b) {
      b.addEventListener("click", function () {
        var o = $("output", row); o.textContent = Math.max(0, Math.min(3, +o.textContent + +b.dataset.d));
        $(".err[data-err=products]", form).hidden = true;
        sync(); save();
      });
    });
  });

  // copy the Bit/PayBox number
  $$("[data-copy]", form).forEach(function (b) {
    b.addEventListener("click", function () {
      var done = function () { b.textContent = "הועתק ✓"; setTimeout(function () { b.textContent = "העתקת המספר"; }, 2000); };
      if (navigator.clipboard) navigator.clipboard.writeText(b.dataset.copy).then(done, function () {}); 
    });
  });

  // "להזמנה" buttons: pick the item and jump to the form
  var addItem = function (item) {
    var o = $(".qty-row[data-item='" + item + "'] output", form);
    if (o && +o.textContent === 0) o.textContent = "1";
    $("input[name=reason][value='הזמנה ותשלום']", form).checked = true;
    show("what"); save();
  };
  $$("[data-add]").forEach(function (a) { a.addEventListener("click", function () { addItem(a.dataset.add); }); });

  var start = restore();
  show(start === "details" ? "details" : "what");
  var m = /[?&]add=(\w+)/.exec(location.search);
  if (m && NAMES[m[1]]) {
    addItem(m[1]);
    if (history.replaceState) history.replaceState(null, "", location.pathname + location.hash);
  }
})();
