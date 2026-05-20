# X Events Fetcher

Small Python utility to open a site in a headless browser, read rendered posts, and write the latest items to `data/events.json`.

Local setup:

```bash
python -m pip install -r event_fetcher/requirements.txt
python -m playwright install chromium
```

Run it (blog category example):

```bash
python event_fetcher/fetch_events.py --output data/events --limit 10
```

Each blog article typically contains multiple events (collaborations, gacha events, special campaigns). The scraper automatically splits these into separate event entries. The `--limit` parameter controls how many blog articles to fetch; each article may produce multiple events.

Scraped event images are downloaded into `public/images/events/` and cropped to remove the outer screenshot border when the detector finds a clear bounding box around the actual promo art.

The GitHub Actions workflow at `.github/workflows/fetch_events.yml` runs this daily (set to `--limit 30` to capture all recent events) and commits the updated `data/events/blog_jp_output.json`, `data/events/blog_zh_output.json`, and cropped files under `public/images/events/` back to the repo.
