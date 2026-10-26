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
# Change to "https://www.red-worms.net/" once the domain is connected, then rebuild.
BASE = "https://nevoes.github.io/red-worms/"
# GoatCounter site code (visitor stats, no cookies). Empty = no tracking script.
GOATCOUNTER = "red-worms"

LD_ORG = """<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Store","name":"המרכז לתולעי מיחזור – כל תולעת מלכה",
"alternateName":"כל תולעת מלכה","url":"%s","logo":"%sassets/logo-mark-192.png","image":"%sassets/og-image.jpg",
"description":"תולעים אדומות, הומוס וערכה חינוכית למיחזור ביתי. מגדלים וממחזרים מאז שנת 2000.",
"foundingDate":"2000","telephone":"+972-52-945-6936","email":"red.worm.center@gmail.com",
"address":{"@type":"PostalAddress","addressLocality":"קיבוץ שדה נחום","addressRegion":"עמק המעיינות","addressCountry":"IL"},
"founder":[{"@type":"Person","name":"שרית נבו"},{"@type":"Person","name":"אשד נבו"}],
"sameAs":[]}
</script>"""

LD_PRODUCTS = """<script type="application/ld+json">
{"@context":"https://schema.org","@type":"ItemList","itemListElement":[
%s
]}
</script>"""
PRODUCTS = [
  ("חבילת תולעים אדומות", "גרעין רבייה של 65 תולעים אדומות לפחות, יחד עם המצע שבו גדלו.", 65, "assets/img/worm-packages.webp"),
  ("שני כלי עבודה", "מקלטרת וכף לטיפול בהומוס, עדינים ומותאמים לעבודה עם תולעים.", 45, "assets/img/product-tools.webp"),
  ("פלייסמנט הסבר A3", "פלייסמנט דו-צדדי עם הסברים על האוכל, מבנה הגוף, מחזור החיים והמיחזור.", 35, "assets/img/product-placemat.webp"),
  ("הערכה החינוכית: לומדים מיחזור עם תולעים אדומות", "65 תולעים, קופסת גידול שקופה, שני כלי עבודה, פלייסמנט וסיפור דיגיטלי.", 215, "assets/img/product-story.webp"),
]

NAV = [
    ("index.html", "בית"),
    ("worms.html", "היכרות עם התולעים"),
    ("humus.html", "הומוס"),
    ("faq.html", "שאלות ומילון"),
    ("shop.html", "חנות"),
]

WA_ICON = '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="#fff" d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3zm0 23.6a10.6 10.6 0 0 1-5.4-1.5l-.4-.2-3.9 1 1-3.8-.2-.4A10.6 10.6 0 1 1 16 26.6zm5.8-7.9c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1a8.7 8.7 0 0 1-4.3-3.8c-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4 3.7 3.7 0 0 0-1.1 2.7 6.4 6.4 0 0 0 1.3 3.4 14.7 14.7 0 0 0 5.6 5c2.1.9 2.9 1 4 .8a3.4 3.4 0 0 0 2.2-1.6 2.8 2.8 0 0 0 .2-1.6c-.1-.1-.3-.2-.6-.4z"/></svg>'


import hashlib
ASSET_V = hashlib.md5((ROOT / "assets/style.css").read_bytes() + (ROOT / "assets/site.js").read_bytes()).hexdigest()[:8]


def page(fname, title, desc, body):
    nav = "\n".join(
        f'<a href="{href}"{" aria-current=\"page\"" if href == fname else ""}>{label}</a>'
        for href, label in NAV
    )
    canon = BASE + ("" if fname == "index.html" else fname)
    ld = LD_ORG % (BASE, BASE, BASE) if fname == "index.html" else ""
    if fname == "shop.html":
        import json
        items = ",\n".join(json.dumps({"@type": "ListItem", "position": i + 1, "item": {"@type": "Product", "name": n, "description": d,
            "image": BASE + img, "brand": {"@type": "Brand", "name": "המרכז לתולעי מיחזור"},
            "offers": {"@type": "Offer", "price": str(pr), "priceCurrency": "ILS", "availability": "https://schema.org/InStock", "url": BASE + "shop.html"}}},
            ensure_ascii=False) for i, (n, d, pr, img) in enumerate(PRODUCTS))
        ld = LD_PRODUCTS % items
    gc = (f'<script data-goatcounter="https://{GOATCOUNTER}.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>\n' if GOATCOUNTER else "")
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
<link rel="icon" href="favicon.ico" sizes="any">
<link rel="icon" href="assets/logo-mark-192.png" type="image/png">
<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
<meta property="og:image" content="{BASE}assets/og-image.jpg">
<meta property="og:url" content="{canon}">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="{canon}">
{ld}
<link rel="preload" href="assets/fonts/secular-one-hebrew-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/style.css?v={ASSET_V}">
</head>
<body>
<a class="skip" href="#main">דילוג לתוכן</a>
<header class="site-head">
  <div class="wrap">
    <a class="brand" href="index.html">
      <img src="assets/logo-mark-192.png" alt="" width="48" height="48">
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
        <a href="index.html" class="foot-logo"><img src="assets/logo-full-light.webp" alt="המרכז לתולעי מיחזור – כל תולעת מלכה" width="220" height="155" loading="lazy"></a>
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
      <span>שרית ואשד נבו · <a href="accessibility.html">הצהרת נגישות</a></span>
    </div>
  </div>
</footer>
<a class="wa-float" href="{WA}" target="_blank" rel="noopener" aria-label="שאלה בווטסאפ" title="שאלה? כתבו לנו בווטסאפ">{WA_ICON}</a>
<script src="assets/site.js?v={ASSET_V}" defer></script>
{gc}</body>
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
    pages = sorted(p.name for p in SRC.glob("*.html"))
    urls = "\n".join(f"  <url><loc>{BASE}{'' if n == 'index.html' else n}</loc></url>" for n in pages)
    (ROOT / "sitemap.xml").write_text(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}\n</urlset>\n', encoding="utf-8")
    (ROOT / "robots.txt").write_text(f"User-agent: *\nAllow: /\nDisallow: /archive/\nDisallow: /src/\nDisallow: /tools/\n\nSitemap: {BASE}sitemap.xml\n", encoding="utf-8")


if __name__ == "__main__":
    main()
