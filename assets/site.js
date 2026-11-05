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
  var backBtn = $("[data-back]", form), nextBtn = $("[data-next]", form), dots = $$(".steps li", form);
  var history = ["contact"], sending = false;

  var val = function (n) { var el = form.elements[n]; if (!el) return ""; if (el.length && !el.tagName) { var c = $$("input[name='" + n + "']:checked", form)[0]; return c ? c.value : ""; } return (el.value || "").trim(); };
  var reason = function () { return val("reason"); };
  var isOrder = function () { return reason() === "הזמנה ותשלום"; };
  var path = function () { return isOrder() ? ["contact", "products", "shipping", "pay"] : ["contact", "general"]; };
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
    return { lines: lines, sum: sum + cost };
  };

  var show = function (name) {
    Object.keys(steps).forEach(function (k) { steps[k].hidden = k !== name; });
    var p = path(), idx = p.indexOf(name);
    dots.forEach(function (d, i) { d.hidden = i >= p.length; d.className = i < idx ? "done" : i === idx ? "now" : ""; if (name === "done") d.className = "done"; });
    backBtn.hidden = history.length < 2 || name === "done";
    nextBtn.hidden = name === "done";
    var last = p.indexOf(name) === p.length - 1;
    nextBtn.textContent = last ? (isOrder() ? "שליחת ההזמנה" : "שליחת הפנייה") : "המשך";
    if (name === "pay") {
      var t = totals();
      $("[data-lines]", form).innerHTML = t.lines.map(function (l) { return "<div>" + l + "</div>"; }).join("");
      $("[data-total]", form).textContent = t.sum + " ₪";
    }
    $(".err[data-err=send]", form).hidden = true;
    $(".err[data-err=fields]", form).hidden = true;
  };

  var validate = function (name) {
    var ok = true, first = null;
    $$("[required]", steps[name]).forEach(function (el) {
      var bad = !el.value.trim() || (el.type === "tel" && el.value.replace(/\D/g, "").length < 9);
      el.setAttribute("aria-invalid", bad ? "true" : "false");
      if (bad) { ok = false; first = first || el; }
    });
    if (name === "contact" && reason() === "__other__" && !val("reason_other")) { ok = false; first = first || form.elements.reason_other; }
    if (name === "products") {
      var any = ["worms", "tools", "placemat", "kit"].some(function (i) { return qty(i) > 0; });
      $(".err[data-err=products]", form).hidden = any; if (!any) ok = false;
    }
    if (name === "shipping" && shipInput().dataset.kind === "home") {
      ["city", "street"].forEach(function (n) { var el = form.elements[n]; var bad = !el.value.trim(); el.setAttribute("aria-invalid", bad ? "true" : "false"); if (bad) { ok = false; first = first || el; } });
    }
    if (name === "pay" && val("status") === "__other__" && !val("status_other")) { ok = false; first = first || form.elements.status_other; }
    $(".err[data-err=fields]", form).hidden = !first;
    if (first) first.focus();
    return ok;
  };

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
    var cur = history[history.length - 1];
    if (!validate(cur) || sending) return;
    var p = path(), i = p.indexOf(cur);
    if (i < p.length - 1) { history.push(p[i + 1]); show(p[i + 1]); steps[p[i + 1]].scrollIntoView({ block: "nearest" }); return; }
    sending = true; nextBtn.disabled = true; nextBtn.textContent = "שולחים…";
    send().then(function () {
      $("[data-done-msg]", form).textContent = isOrder()
        ? (val("status").indexOf("שילמתי") === 0 ? "ההזמנה התקבלה. נבדוק את התשלום ונחזור אליכם לתאם את המסירה." : "ההזמנה התקבלה. נחזור אליכם בהקדם להשלמת התשלום ותיאום המסירה.")
        : "הפנייה התקבלה. נחזור אליכם בהקדם.";
      $("[data-summary]", form).textContent = summaryText();
      history.push("done"); show("done");
    }).catch(function () {
      $(".err[data-err=send]", form).hidden = false;
    }).then(function () { sending = false; nextBtn.disabled = false; if (history[history.length - 1] !== "done") show(cur); });
  });

  backBtn.addEventListener("click", function () { if (history.length > 1) { history.pop(); show(history[history.length - 1]); } });

  // "other" text fields
  $$("input[name=reason], input[name=status]").forEach(function (r) {
    r.addEventListener("change", function () {
      form.elements.reason_other.hidden = val("reason") !== "__other__";
      form.elements.status_other.hidden = val("status") !== "__other__";
      if (history[history.length - 1] === "contact") show("contact");
    });
  });
  // shipping conditional blocks
  $$("input[name=ship]").forEach(function (r) {
    r.addEventListener("change", function () {
      var k = shipInput().dataset.kind || "";
      $$("[data-show]", form).forEach(function (b) { b.hidden = b.dataset.show !== k; });
    });
  });
  // steppers
  $$(".qty-row").forEach(function (row) {
    $$("button", row).forEach(function (b) {
      b.addEventListener("click", function () {
        var o = $("output", row); o.textContent = Math.max(0, Math.min(3, +o.textContent + +b.dataset.d));
        $(".err[data-err=products]", form).hidden = true;
      });
    });
  });
  // "להזמנה" buttons on product cards
  $$("[data-add]").forEach(function (a) {
    a.addEventListener("click", function () {
      var row = $(".qty-row[data-item='" + a.dataset.add + "'] output", form);
      if (row && +row.textContent === 0) row.textContent = "1";
      $("input[name=reason][value='הזמנה ותשלום']", form).checked = true;
      form.elements.reason_other.hidden = true;
      if (history[history.length - 1] === "general") { history = ["contact"]; }
      show(history[history.length - 1]);
    });
  });

  show("contact");
})();
