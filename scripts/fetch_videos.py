"""YouTube kanal RSS lentasidan videolarni olib, data/videos.json ga qo'shadi.

GitHub Actions har soatda ishga tushiradi. Lenta faqat so'nggi 15 ta videoni beradi,
shuning uchun eski yozuvlar JSON ichida saqlanib, yangilari ustiga qo'shiladi.
"""
import json
import os
import sys
import urllib.request
import xml.etree.ElementTree as ET

CHANNEL_ID = "UC3bNRfsnCGdWHxc3UqEPmpQ"
# Faqat shu sanadan keyin chiqqan videolar saytda ko'rinadi (kanal yangiliklar formatiga o'tgan kun).
SINCE = "2026-10-25"
# Sarlavha yoki tavsifida shu so'zlar bo'lgan videolar ko'rsatilmaydi.
EXCLUDE_TAGS = ["#zona404", "#shorts"]

FEED = f"https://www.youtube.com/feeds/videos.xml?channel_id={CHANNEL_ID}"
OUT = os.path.join(os.path.dirname(__file__), "..", "data", "videos.json")
NS = {
    "a": "http://www.w3.org/2005/Atom",
    "yt": "http://www.youtube.com/xml/schemas/2015",
    "media": "http://search.yahoo.com/mrss/",
}


def fetch_feed():
    req = urllib.request.Request(FEED, headers={"User-Agent": "Mozilla/5.0 (tinchlikmi.uz updater)"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def parse(xml_bytes):
    root = ET.fromstring(xml_bytes)
    items = []
    for e in root.findall("a:entry", NS):
        vid = e.findtext("yt:videoId", namespaces=NS)
        title = (e.findtext("a:title", namespaces=NS) or "").strip()
        published = e.findtext("a:published", namespaces=NS) or ""
        updated = e.findtext("a:updated", namespaces=NS) or ""
        group = e.find("media:group", NS)
        desc = ""
        views = None
        if group is not None:
            desc = (group.findtext("media:description", namespaces=NS) or "").strip()
            stats = group.find("media:community/media:statistics", NS)
            if stats is not None and stats.get("views"):
                views = int(stats.get("views"))
        items.append({
            "id": vid,
            "title": title,
            "published": published,
            "updated": updated,
            "description": desc,
            "views": views,
        })
    return items


def keep(v):
    if v["published"][:10] < SINCE:
        return False
    text = (v["title"] + " " + v["description"]).lower()
    return not any(tag in text for tag in EXCLUDE_TAGS)


def main():
    try:
        fresh = parse(fetch_feed())
    except Exception as exc:  # tarmoq xatosi bo'lsa eski ro'yxat o'zgarmaydi
        print("Lentani olib bo'lmadi:", exc)
        return 0
    old = []
    if os.path.exists(OUT):
        with open(OUT, encoding="utf-8") as f:
            old = json.load(f).get("videos", [])
    by_id = {v["id"]: v for v in old}
    for v in fresh:
        if keep(v):
            by_id[v["id"]] = v          # yangi video qo'shiladi, mavjudi yangilanadi (sarlavha, ko'rishlar)
    # lentada bor-u, endi filtrga tushmaydiganlarni olib tashlash
    for v in fresh:
        if not keep(v):
            by_id.pop(v["id"], None)
    videos = sorted(by_id.values(), key=lambda v: v["published"], reverse=True)
    data = {"channel": {"id": CHANNEL_ID, "url": "https://www.youtube.com/@tinchlikm", "title": "Tinchlikmi?"},
            "videos": videos}
    new_text = json.dumps(data, ensure_ascii=False, indent=1)
    old_text = open(OUT, encoding="utf-8").read() if os.path.exists(OUT) else ""
    if new_text != old_text:
        os.makedirs(os.path.dirname(OUT), exist_ok=True)
        with open(OUT, "w", encoding="utf-8") as f:
            f.write(new_text)
        print(f"Yangilandi: {len(videos)} ta video")
    else:
        print("O'zgarish yo'q")
    return 0


if __name__ == "__main__":
    sys.exit(main())
