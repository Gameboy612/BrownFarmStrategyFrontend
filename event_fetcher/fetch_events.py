#!/usr/bin/env python3
"""Fetch Japanese blog events and Chinese forum titles automatically.

Defaults:
- Japanese blog category: https://linegame-official.blog.jp/archives/cat_1301701.html
- Chinese forum: https://forum.gamer.com.tw/B.php?bsn=29387

Usage: only `--output-dir` (or `--output`) is required for JSON outputs; cropped images default to `public/images/events`.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
from collections import Counter, deque
from io import BytesIO
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Sequence

import requests
from PIL import Image
from playwright.sync_api import sync_playwright


DEFAULT_JP_BLOG = "https://linegame-official.blog.jp/archives/cat_1301701.html"
DEFAULT_TW_FORUM = "https://forum.gamer.com.tw/B.php?bsn=29387"
DEFAULT_IMAGE_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'images', 'events')
DEFAULT_BORDER_RGB = (251, 242, 227)
DEFAULT_BORDER_TOLERANCE = 24
DEFAULT_MIN_FRAME_RATIO = 0.08
DEFAULT_MIN_EDGE_TOUCHES = 2


def _quantize_rgb(rgb: tuple[int, int, int], step: int = 16) -> tuple[int, int, int]:
    return tuple((channel // step) * step for channel in rgb)


def _color_distance(left: tuple[int, int, int], right: tuple[int, int, int]) -> int:
    return abs(left[0] - right[0]) + abs(left[1] - right[1]) + abs(left[2] - right[2])


def _is_border_pixel(pixel: tuple[int, int, int]) -> bool:
    return _color_distance(pixel, DEFAULT_BORDER_RGB) <= DEFAULT_BORDER_TOLERANCE


def _flood_fill_component(match_mask: List[bool], width: int, height: int, seed_index: int, visited: List[bool]) -> Dict[str, Any]:
    queue = deque([seed_index])
    visited[seed_index] = True
    pixels: List[int] = []
    min_x = width
    min_y = height
    max_x = -1
    max_y = -1
    edge_hits = 0

    while queue:
        index = queue.popleft()
        pixels.append(index)
        y, x = divmod(index, width)
        min_x = min(min_x, x)
        min_y = min(min_y, y)
        max_x = max(max_x, x)
        max_y = max(max_y, y)
        if x == 0 or y == 0 or x == width - 1 or y == height - 1:
            edge_hits += 1

        for neighbor in (index - 1, index + 1, index - width, index + width):
            if neighbor < 0 or neighbor >= width * height or visited[neighbor] or not match_mask[neighbor]:
                continue
            ny, nx = divmod(neighbor, width)
            if abs(nx - x) + abs(ny - y) != 1:
                continue
            visited[neighbor] = True
            queue.append(neighbor)

    return {
        'pixels': pixels,
        'bbox': (min_x, min_y, max_x + 1, max_y + 1),
        'edge_hits': edge_hits,
    }


def _find_holes(frame_mask: List[bool], width: int, height: int, frame_bbox: tuple[int, int, int, int]) -> List[Dict[str, Any]]:
    left, top, right, bottom = frame_bbox
    hole_visited = [False] * (width * height)
    holes: List[Dict[str, Any]] = []

    for y in range(top + 1, bottom - 1):
        for x in range(left + 1, right - 1):
            index = y * width + x
            if frame_mask[index] or hole_visited[index]:
                continue

            queue = deque([index])
            hole_visited[index] = True
            touches_frame_edge = False
            min_x = x
            min_y = y
            max_x = x
            max_y = y
            size = 0

            while queue:
                current = queue.popleft()
                cy, cx = divmod(current, width)
                size += 1
                min_x = min(min_x, cx)
                min_y = min(min_y, cy)
                max_x = max(max_x, cx)
                max_y = max(max_y, cy)

                if cx <= left or cy <= top or cx >= right - 1 or cy >= bottom - 1:
                    touches_frame_edge = True

                for neighbor in (current - 1, current + 1, current - width, current + width):
                    if neighbor < 0 or neighbor >= width * height or hole_visited[neighbor] or frame_mask[neighbor]:
                        continue
                    ny, nx = divmod(neighbor, width)
                    if abs(nx - cx) + abs(ny - cy) != 1:
                        continue
                    hole_visited[neighbor] = True
                    queue.append(neighbor)

            if not touches_frame_edge and size > 0:
                holes.append({
                    'size': size,
                    'bbox': (min_x, min_y, max_x + 1, max_y + 1),
                })

    return holes


def detect_content_bbox(image: Image.Image) -> Optional[tuple[int, int, int, int]]:
    rgb = image.convert('RGB')
    width, height = rgb.size
    if width < 8 or height < 8:
        return None

    pixels = list(rgb.getdata())
    frame_mask = [_is_border_pixel(pixel) for pixel in pixels]
    visited = [False] * (width * height)

    candidates: List[Dict[str, Any]] = []
    for index, is_match in enumerate(frame_mask):
        if not is_match or visited[index]:
            continue
        component = _flood_fill_component(frame_mask, width, height, index, visited)
        area = len(component['pixels'])
        if area < max(64, width * height // 200):
            continue

        component_mask = [False] * (width * height)
        for pixel_index in component['pixels']:
            component_mask[pixel_index] = True

        holes = _find_holes(component_mask, width, height, component['bbox'])
        if not holes:
            continue

        candidates.append({
            'frame': component,
            'hole': max(holes, key=lambda item: item['size']),
        })

    if not candidates:
        return None

    hole = max(candidates, key=lambda item: (item['hole']['size'], len(item['frame']['pixels'])))['hole']
    left, top, right, bottom = hole['bbox']

    if left <= 0 or top <= 0 or right >= width or bottom >= height:
        return None

    return left, top, right, bottom


def _guess_extension(content_type: str, image: Image.Image) -> str:
    if 'png' in content_type.lower():
        return '.png'
    if 'jpeg' in content_type.lower() or 'jpg' in content_type.lower():
        return '.jpg'
    if image.format:
        fmt = image.format.lower()
        if fmt in {'png', 'jpeg', 'jpg', 'webp', 'gif'}:
            return f'.{"jpg" if fmt == "jpeg" else fmt}'
    return '.png'


def process_media_image(src: str, image_dir: str, cache: Dict[str, str]) -> str:
    if not src or src in cache:
        return cache.get(src, src)
    if not src.startswith(('http://', 'https://')):
        cache[src] = src
        return src

    os.makedirs(image_dir, exist_ok=True)

    try:
        response = requests.get(src, timeout=30)
        response.raise_for_status()

        image = Image.open(BytesIO(response.content))
        image.load()

        bbox = detect_content_bbox(image)
        if bbox:
            original_area = image.size[0] * image.size[1]
            cropped_width = bbox[2] - bbox[0]
            cropped_height = bbox[3] - bbox[1]
            cropped_area = cropped_width * cropped_height
            if cropped_area >= original_area * 0.25:
                image = image.crop(bbox)
            else:
                bbox = None

        extension = _guess_extension(response.headers.get('content-type', ''), image)
        digest = hashlib.sha1(src.encode('utf-8')).hexdigest()[:16]
        filename = f'event_{digest}{extension if extension else ".png"}'
        output_path = os.path.join(image_dir, filename)

        save_format = 'PNG' if extension == '.png' else 'JPEG'
        if save_format == 'JPEG' and image.mode not in {'RGB', 'L'}:
            image = image.convert('RGB')
        image.save(output_path, format=save_format, optimize=True)

        public_src = f'/images/events/{filename}'
        cache[src] = public_src
        return public_src
    except Exception:
        cache[src] = src
        return src


def process_event_media(event: Dict[str, Any], image_dir: str, cache: Dict[str, str]) -> Dict[str, Any]:
    processed = dict(event)
    media_urls = processed.get('media_urls') or []
    new_media = []

    for media in media_urls:
        if not isinstance(media, dict):
            continue
        media_copy = dict(media)
        original_src = media_copy.get('src', '')
        processed_src = process_media_image(original_src, image_dir, cache)
        media_copy['src'] = processed_src
        if processed_src != original_src:
            media_copy['original_src'] = original_src
            media_copy['processed'] = 'cropped'
        new_media.append(media_copy)

    processed['media_urls'] = new_media
    return processed


def load_json(path: str) -> Optional[Dict[str, Any]]:
    if not os.path.exists(path):
        return None
    try:
        with open(path, "r", encoding="utf-8") as fh:
            return json.load(fh)
    except Exception:
        return None


def write_output(path: str, payload: Dict[str, Any]) -> None:
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    with open(path, "w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)


def get_article_links_from_category_page(page) -> List[str]:
    try:
        anchors = page.locator('a').evaluate_all(
            r"elements => elements.map(a => a.href).filter(h => /\/archives\/\d+\.html/.test(h))"
        )
    except Exception:
        anchors = []

    seen = set()
    out = []
    for a in anchors:
        clean = a.split('#')[0]
        if clean not in seen:
            seen.add(clean)
            out.append(clean)
    return out


def collect_blog_posts_from_category(page, category_url: str, limit: int) -> List[Dict[str, Any]]:
    # Reuse existing logic: find article links then visit each and extract sections
    anchors = []
    try:
        page.goto(category_url, wait_until="domcontentloaded", timeout=60000)
        anchors = get_article_links_from_category_page(page)
    except Exception:
        anchors = []

    anchors = anchors[:limit]
    collected: List[Dict[str, Any]] = []
    for href in anchors:
        try:
            page.goto(href, wait_until='domcontentloaded', timeout=30000)
        except Exception:
            pass

        try:
            title = (page.locator('article h1').first.text_content() or '').strip()
        except Exception:
            title = ''

        # Extract article body sections with images and text
        sections = []
        try:
            sections = page.evaluate(
                r'''() => {
    function extractContent(element, title) {
        const sections = [{
            title: title,
            description: [],
            img: []
        }];

        function walk(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                const content = node.textContent.trim();
                if (content.startsWith('■')) {
                    sections.push({ title: content, description: [], img: [] })
                } else {
                    if (content.includes('©')) return true;
                    if (content) sections[sections.length - 1].description.push(content)
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.tagName === 'IMG') {
                    sections[sections.length - 1].img.push({ src: node.src.replace('-s.png', '.png'), alt: node.alt || '' });
                }
                let child = node.firstChild;
                while (child) {
                    const stop = walk(child);
                    if (stop) return true;
                    child = child.nextSibling;
                }
            }
            return false;
        }

        walk(element);
        return sections;
    }

    const title = (document.querySelector('article h1') || { textContent: '' }).textContent.trim();
    const body = document.querySelector('.article-body') || document.querySelector('article');
    if (!body) return [];
    return extractContent(body, title || '');
}'''
            )
        except Exception:
            sections = []

        # Convert sections to event-like entries when date ranges are available
        for i, sec in enumerate(sections, start=1):
            sec_title = (sec.get('title') or '').strip()
            sec_text = '\n'.join(sec.get('description') or [])
            imgs = sec.get('img') or []

            # Find common Japanese date range patterns (fallback if not found)
            timestamp = re.findall(r'(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日\s*.*?(\d{1,2})\s*:\s*(\d{2}).*?～\s*((?:\d{4})?)?\s*年?\s*(\d{1,2})?月?\s*(\d{1,2})?日?.*?(\d{1,2})?\s*:\s*(\d{2})', sec_text, re.MULTILINE | re.DOTALL)
            if not timestamp:
                # still include posts without parsed timestamps
                # collected.append({
                #     'id': f"{href}-sec{i}",
                #     'url': href,
                #     'title': sec_title or title or f"Post {i}",
                #     'text': sec_text,
                #     'start_time': '',
                #     'end_time': '',
                #     'media_urls': imgs,
                #     'source': 'linegame-blog',
                # })
                continue

            ts = list(timestamp[0])
            if timestamp[0][0] == '':  # If year is missing, assume current year
                ts[0] = str(datetime.now().year)
            for j in range(5, 10):
                if ts[j] == '':
                    ts[j] = ts[j - 5]

            # Taiwan time
            start_time = f"{ts[0]}-{ts[1].zfill(2)}-{ts[2].zfill(2)}T{ts[3].zfill(2)}:{ts[4].zfill(2)}:00+08:00"
            end_time = f"{ts[5]}-{ts[6].zfill(2)}-{ts[7].zfill(2)}T{ts[8].zfill(2)}:{ts[9].zfill(2)}:00+08:00"
            # Check if end_time > start_time
            if datetime.fromisoformat(end_time) < datetime.fromisoformat(start_time):
                start_time = end_time
            
            collected.append({
                'id': f"{href}-sec{i}",
                'url': href,
                'title': sec_title or title or f"Event {i}",
                'text': sec_text,
                'start_time': start_time,
                'end_time': end_time,
                'media_urls': imgs,
                'source': 'linegame-blog',
            })

    collected = list(filter(
        lambda e: (datetime.fromisoformat(e['end_time']) - datetime.now(timezone.utc)) >= timedelta(days=-2),  # Only include events that ended within the last 2 days or in the future
        collected
    ))

    collected.sort(key=lambda e: 
        datetime.fromisoformat(e['end_time']).timestamp() if (datetime.fromisoformat(e['start_time']) < datetime.now(timezone.utc)) else (
            # Events that haven't started yet are sorted by how soon they will start
            datetime.fromisoformat(e['start_time']).timestamp()
        )
        , reverse=False)  # Sort by start time, newest first

    return collected


def collect_forum_titles(page, forum_url: str, limit: int) -> List[Dict[str, Any]]:
    try:
        page.goto(forum_url, wait_until='domcontentloaded', timeout=60000)
    except Exception:
        pass

    # Find text nodes containing '情報' and try to locate a surrounding link
    sections = page.evaluate(
        r"""() => {
    function extractContent(element, title) {
        const entries = element.querySelectorAll('.b-list__main');
        const sections = [];

        for (var i = 0; i < entries.length; i++) {
            const entry = entries[i];
            const img_node = entry.querySelector(".b-list__img");
            if (!img_node) continue;
            const img = img_node.dataset.thumbnail;
            const title = entry.querySelector(".b-list__main__title").textContent.trim();
            const description = entry.querySelector("p.b-list__brief").textContent.trim();
            const href = window.origin + '/' + entry.querySelector(".b-list__main__title").getAttribute('href');
            if (!title.startsWith('【情報】')) continue;
            // Replace image URL params to get full size if possible
            const clean_img = img.split('?')[0];
            sections.push({
                title: title,
                description: [description],
                img: [{
                    src: clean_img,
                    alt: ""
                }],
                href: href
            })
        }
        
        return sections;
    }

    const title = (document.querySelector('article h1') || { textContent: '' }).textContent.trim();
    const body = document.querySelector('table.b-list') || document.querySelector('article');
    if (!body) return [];
    return extractContent(body, title || '');
}"""
    )

    collected = []

    # Convert sections to event-like entries when date ranges are available
    for i, sec in enumerate(sections, start=1):
        sec_title = (sec.get('title') or '').strip()
        sec_text = '\n'.join(sec.get('description') or [])
        imgs = sec.get('img') or []
        href = sec.get('href') or ''

        # Find common Japanese date range patterns (fallback if not found)
        re_search_text = sec_title.replace('（', '(').replace('）', ')').replace('：', ':').replace(' ', '').replace('~', '～')  # Normalize full-width parentheses
        timestamp = re.findall(r'(?:(\d{4})?)\s*年?\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日\s*.*?(\d{1,2})\s*:\s*(\d{2}).*?～.*?(\d{4})?\s*年?\s*(\d{1,2})?\s*月?\s*(\d{1,2})?\s*日?.*?(\d{1,2})?\s*:\s*(\d{2})', re_search_text, re.MULTILINE | re.DOTALL)

        if not timestamp:
            "2026年6月15日9:59止"  # Try another common pattern
            timestamp = re.findall(r"(?:(\d{4})?)年\s*(\d{1,2})月\s*(\d{1,2})日\s*(\d{1,2})\s*:?\s*(\d{2})\s*止", re_search_text)
            now_timestamp = (str(datetime.now().year), str(datetime.now().month), str(datetime.now().day), '00', '00')
            timestamp = [now_timestamp + ts for ts in timestamp]  # Pad to 10 groups for uniform processing
        if not timestamp:
            # still include posts without parsed timestamps
            # collected.append({
            #     'id': f"{href}-sec{i}",
            #     'url': href,
            #     'title': sec_title or f"Post {i}",
            #     'text': sec_text,
            #     'start_time': '',
            #     'end_time': '',
            #     'media_urls': imgs,
            #     'source': 'linegame-blog',
            # })
            continue

        ts = list(timestamp[0])
        if timestamp[0][0] == '':  # If year is missing, assume current year
            ts[0] = str(datetime.now().year)
        for j in range(5, 10):
            if ts[j] == '':
                ts[j] = ts[j - 5]

        # Taiwan time
        start_time = f"{ts[0]}-{ts[1].zfill(2)}-{ts[2].zfill(2)}T{ts[3].zfill(2)}:{ts[4].zfill(2)}:00+08:00"
        end_time = f"{ts[5]}-{ts[6].zfill(2)}-{ts[7].zfill(2)}T{ts[8].zfill(2)}:{ts[9].zfill(2)}:00+08:00"

        # Check if end_time > start_time
        if datetime.fromisoformat(end_time) < datetime.fromisoformat(start_time):
            start_time = end_time
        
        collected.append({
            'id': f"{href}-sec{i}",
            'url': href,
            'title': sec_title or f"Event {i}",
            'text': sec_text,
            'start_time': start_time,
            'end_time': end_time,
            'media_urls': imgs,
            'source': 'linegame-blog',
        })

    collected = list(filter(
        lambda e: datetime.fromisoformat(e['end_time']) - datetime.now(timezone.utc) >= timedelta(days=-2) if e['end_time'] else True,  # Only include events that ended within the last 2 days or in the future
        collected
    ))

    collected.sort(key=lambda e: 
        datetime.fromisoformat(e['end_time']).timestamp() if (datetime.fromisoformat(e['start_time']) < datetime.now(timezone.utc)) else (
            # Events that haven't started yet are sorted by how soon they will start
            datetime.fromisoformat(e['start_time']).timestamp()
        )
        , reverse=False)  # Sort by start time, newest first

    return collected



def main(argv: Optional[Sequence[str]] = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-dir", "--output", dest="output_dir", default="tmp", help="Directory to write outputs")
    parser.add_argument("--image-dir", default=DEFAULT_IMAGE_DIR, help="Directory to write cropped images")
    parser.add_argument("--limit", default=20, type=int, help="Maximum items per source")
    args = parser.parse_args(argv)

    output_dir = args.output_dir
    image_dir = args.image_dir
    limit = args.limit

    # If a pre-fetched JP file exists, prefer using it for JP events
    existing_events = load_json(os.path.join(os.path.dirname(__file__), '..', 'data', 'events', 'blog_jp_output.json'))
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        context = browser.new_context(locale="ja-JP", viewport={"width": 1200, "height": 2000})
        page = context.new_page()

        # Japanese events: prefer data/events.json, otherwise scrape
        if existing_events and existing_events.get('events'):
            jp_events = existing_events.get('events')[:limit]
            jp_source = existing_events.get('source_url') or DEFAULT_JP_BLOG
        else:
            jp_events = collect_blog_posts_from_category(page, DEFAULT_JP_BLOG, limit)
            jp_source = DEFAULT_JP_BLOG

        # Chinese forum: scrape titles containing '情報'
        cn_events = collect_forum_titles(page, DEFAULT_TW_FORUM, limit)

        browser.close()

    image_cache: Dict[str, str] = {}
    jp_events = [process_event_media(event, image_dir, image_cache) for event in jp_events]
    cn_events = [process_event_media(event, image_dir, image_cache) for event in cn_events]

    now = datetime.now(timezone.utc).isoformat()

    jp_payload = {
        'source_url': jp_source,
        'screen_name': 'linegame-blog',
        'fetched_at': now,
        'events': jp_events,
    }
    cn_payload = {
        'source_url': DEFAULT_TW_FORUM,
        'screen_name': 'bahamut-forum',
        'fetched_at': now,
        'events': cn_events,
    }

    write_output(os.path.join(output_dir, 'blog_jp_output.json'), jp_payload)
    write_output(os.path.join(output_dir, 'blog_zh_output.json'), cn_payload)

    print(f"Wrote {len(jp_events)} JP events and {len(cn_events)} CN forum titles to {output_dir}")
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
