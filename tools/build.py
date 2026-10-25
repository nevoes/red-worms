#!/usr/bin/env python3
"""Builds the site pages from src/*.html (page content only) + a shared header/footer.

Usage:  python3 tools/build.py
Each src file starts with a comment line:  <!-- title: ... | desc: ... -->
"""
import pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"

WA = "https://wa.me/972529456936?text=" + "%D7%A9%D7%9C%D7%95%D7%9D%2C%20%D7%94%D7%92%D7%A2%D7%AA%D7%99%20%D7%9E%D7%94%D7%90%D7%AA%D7%A8%20%D7%A9%D7%9C%20%D7%94%D7%9E%D7%A8%D7%9B%D7%96%20%D7%9C%D7%AA%D7%95%D7%9C%D7%A2%D7%99%20%D7%9E%D7%99%D7%97%D7%96%D7%95%D7%A8"
COMMUNITY = "https://chat.whatsapp.com/FJklT78znHj69qb9kPPApb"
EMAIL = "red.worm.center@gmail.com"

NAV = [
    ("index.html", "בית"),
    ("worms.html", "היכרות עם התולעים"),
    ("humus.html", "הומוס"),
    ("faq.html", "שאלות ומילון"),
    ("shop.html", "חנות"),
]

WA_ICON = '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="#fff" d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3zm0 23.6a10.6 10.6 0 0 1-5.4-1.5l-.4-.2-3.9 1 1-3.8-.2-.4A10.6 10.6 0 1 1 16 26.6zm5.8-7.9c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1a8.7 8.7 0 0 1-4.3-3.8c-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4 3.7 3.7 0 0 0-1.1 2.7 6.4 6.4 0 0 0 1.3 3.4 14.7 14.7 0 0 0 5.6 5c2.1.9 2.9 1 4 .8a3.4 3.4 0 0 0 2.2-1.6 2.8 2.8 0 0 0 .2-1.6c-.1-.1-.3-.2-.6-.4z"/></svg>'


def page(fname, title, desc, body):
    nav = "\n".join(
        f'<a href="{href}"{" aria-current=\"page\"" if href == fname else ""}>{label}</a>'
        for href, label in NAV
    )
    full_title = "המרכז לתולעי מיחזור – כל תולעת מלכה" if fname == "index.html" else f"{title} | המרכז לתולעי מיחזור"
    return f"""<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{full_title}</title>
<meta name="description" content="{desc}">
<meta property="og:title" content="{full_title}">
<meta property="og:description" content="{desc}">
<meta property="og:type" content="website">
<meta property="og:locale" content="he_IL">
<meta name="theme-color" content="#2A1D15">
<link rel="icon" href="assets/logo.svg" type="image/svg+xml">
<link rel="preload" href="assets/fonts/secular-one-hebrew-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/style.css">
</head>
<body>
<a class="skip" href="#main">דילוג לתוכן</a>
<header class="site-head">
  <div class="wrap">
    <a class="brand" href="index.html">
      <img src="assets/logo.svg" alt="" width="44" height="44">
      <span><b>המרכז לתולעי מיחזור</b><small>כל תולעת מלכה</small></span>
    </a>
    <button class="menu-btn" aria-expanded="false" aria-controls="nav">תפריט</button>
    <nav class="nav" id="nav" aria-label="ראשי">
{nav}
      <a class="btn btn-primary btn-small" href="shop.html#order">להזמנה</a>
    </nav>
  </div>
</header>
<main id="main">
{body}
</main>
<footer class="site-foot">
  <div class="wrap">
    <div class="cols">
      <div>
        <a class="brand" href="index.html">
          <img src="assets/logo.svg" alt="" width="44" height="44">
          <span><b>המרכז לתולעי מיחזור</b><small>כל תולעת מלכה</small></span>
        </a>
        <p>מגדלים תולעים אדומות, מייצרים הומוס ומלמדים מיחזור ביתי מאז שנת 2000. משק משפחתי בקיבוץ שדה נחום שבעמק המעיינות.</p>
      </div>
      <div>
        <h4>באתר</h4>
        <ul>
          <li><a href="worms.html">היכרות עם התולעים האדומות</a></li>
          <li><a href="worms.html#start">איך מתחילים</a></li>
          <li><a href="worms.html#calculator">מחשבון תולעים</a></li>
          <li><a href="humus.html">הומוס ותה הומוס</a></li>
          <li><a href="shop.html">חנות ומשלוחים</a></li>
          <li><a href="shop.html#downloads">דפי מידע להורדה</a></li>
        </ul>
      </div>
      <div>
        <h4>יצירת קשר</h4>
        <p>הזמנות – דרך הטופס באתר. שאלות קצרות – גם בווטסאפ.</p>
        <a class="btn btn-primary btn-small" href="shop.html#order">לטופס ההזמנה</a>
        <ul style="margin-top:14px">
          <li><a href="{WA}" target="_blank" rel="noopener">שאלה בווטסאפ: 052-9456936</a></li>
          <li><a href="{COMMUNITY}" target="_blank" rel="noopener">קהילת המגדלים בווטסאפ</a></li>
        </ul>
      </div>
    </div>
    <div class="legal">
      <span>© <span data-year>2026</span> המרכז לתולעי מיחזור – כל תולעת מלכה</span>
      <span>שרית ואשד נבו</span>
    </div>
  </div>
</footer>
<a class="wa-float" href="{WA}" target="_blank" rel="noopener" aria-label="שאלה בווטסאפ" title="שאלה? כתבו לנו בווטסאפ">{WA_ICON}</a>
<script src="assets/site.js" defer></script>
</body>
</html>
"""


def main():
    for src in sorted(SRC.glob("*.html")):
        text = src.read_text(encoding="utf-8")
        m = re.match(r"<!--\s*title:(.*?)\|\s*desc:(.*?)-->\s*", text, re.S)
        title, desc = (m.group(1).strip(), m.group(2).strip()) if m else (src.stem, "")
        body = text[m.end():] if m else text
        body = body.replace("{{WA}}", WA).replace("{{COMMUNITY}}", COMMUNITY).replace("{{EMAIL}}", EMAIL)
        (ROOT / src.name).write_text(page(src.name, title, desc, body), encoding="utf-8")
        print("built", src.name)


if __name__ == "__main__":
    main()
