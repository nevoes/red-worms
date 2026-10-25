#!/usr/bin/env python3
"""Downloads every image from the old Google Sites site (red-worms.net) into archive/old-site-images/.
Run by the "Archive old site images" GitHub Action (manual trigger)."""
import pathlib, re, urllib.parse, urllib.request

PAGES = {
    "home": "בית", "worms": "תולעים-אדומות", "benefits": "תולעים-אדומות/יתרונות-השימוש-בתולעים",
    "growing": "תולעים-אדומות/גידול-תולעים-אדומות", "mail": "תולעים-אדומות/שליחת-תולעים-בדואר",
    "barrel": "תולעים-אדומות/תולעים-בחבית-שתילה", "calculator": "תולעים-אדומות/מחשבון-תולעים",
    "moving": "תולעים-אדומות/מה-עושים-כשעוברים-דירה", "summer": "תולעים-אדומות/מה-עושים-בקיץ",
    "humus": "הומוס", "separation": "הומוס/שיטות-להפרדת-הומוס", "harvest": "הומוס/קציר-הומוס",
    "tea": "הומוס/תה-הומוס", "start": "כיצד-מתחילים", "contact-shop": "יצירת-קשר-רכישה",
    "more": "מוצרים-נוספים", "faq": "שאלות-ותשובות", "posts": "פוסטים", "downloads": "דפי-מידע-להורדה",
}
OUT = pathlib.Path(__file__).resolve().parent.parent / "archive" / "old-site-images"
UA = {"User-Agent": "Mozilla/5.0"}
seen = {}
for slug, path in PAGES.items():
    url = "https://www.red-worms.net/" + urllib.parse.quote(path)
    html = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read().decode("utf-8", "ignore")
    srcs = re.findall(r'https://lh\d-[a-z]+\.googleusercontent\.com/sitesv[^"\'\s)]+', html)
    n = 0
    for s in dict.fromkeys(srcs):
        base = s.split("=")[0]
        if base in seen:
            continue
        n += 1
        dest = OUT / slug / f"{n:02d}.jpg"
        dest.parent.mkdir(parents=True, exist_ok=True)
        try:
            data = urllib.request.urlopen(urllib.request.Request(base + "=w1600", headers=UA), timeout=60).read()
            ext = ".png" if data[:4] == b"\x89PNG" else ".gif" if data[:3] == b"GIF" else ".jpg"
            dest = dest.with_suffix(ext)
            dest.write_bytes(data)
            seen[base] = str(dest.relative_to(OUT))
            print(slug, dest.name, len(data))
        except Exception as e:
            print("failed", slug, base[:60], e)
(OUT / "index.txt").write_text("\n".join(f"{v}\t{k}" for k, v in seen.items()), encoding="utf-8")
