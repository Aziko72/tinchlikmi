# tinchlikmi.uz

**Tinchlikmi? — nima yangilik?** YouTube kanalining sayti.

- YouTube kanal: https://www.youtube.com/@tinchlikm
- Sayt: statik (HTML/CSS/JS), GitHub Pages'da.
- Yangi videolar avtomatik qo'shiladi: `.github/workflows/update-videos.yml` har soatda
  `scripts/fetch_videos.py` ni ishga tushiradi. U kanalning ochiq RSS lentasini o'qib,
  `data/videos.json` ni yangilaydi.

## Sozlamalar (`scripts/fetch_videos.py`)
- `SINCE` — shu sanadan oldingi videolar ko'rsatilmaydi.
- `EXCLUDE_TAGS` — sarlavha/tavsifida shu teglar bo'lgan videolar ko'rsatilmaydi.

## Qo'lda yangilash
GitHub → **Actions** → "YouTube videolarini yangilash" → **Run workflow**.
