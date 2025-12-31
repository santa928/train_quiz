#!/usr/bin/env python3
"""
Download images from Wikimedia Commons and generate credit metadata.

Input JSON format (list of items):
[
  {
    "id": "jr-east-yamanote-e235",
    "lineName": "山手線",
    "series": "E235系",
    "file_title": "File:JRE E235 series Yamanote Line train.jpg",
    "output": "assets/images/yamanote-e235.jpg"
  }
]
"""

from __future__ import annotations

import argparse
import html
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

API_URL = "https://commons.wikimedia.org/w/api.php"
RETRY_STATUS = {429, 503}
MAX_RETRIES = 10
RETRY_BACKOFF = 5.0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Fetch Wikimedia Commons images and credits.")
    parser.add_argument("--input", required=True, help="Path to JSON input file.")
    parser.add_argument("--width", type=int, default=1200, help="Thumbnail width (default: 1200).")
    parser.add_argument("--skip-existing", action="store_true", help="Skip download if output exists.")
    parser.add_argument("--dry-run", action="store_true", help="Do not download files.")
    parser.add_argument("--credits-out", help="Write credits JSON to this path.")
    parser.add_argument("--lines-out", help="Write line objects JSON to this path.")
    parser.add_argument("--artist-label", default="撮影", help="Label for artist attribution.")
    parser.add_argument("--user-agent", default="Mozilla/5.0 (train_quiz)", help="User-Agent header.")
    parser.add_argument("--sleep", type=float, default=0.0, help="Sleep seconds between requests.")
    return parser.parse_args()


def open_with_retry(req: urllib.request.Request) -> urllib.request.addinfourl:
    last_error = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            return urllib.request.urlopen(req)
        except urllib.error.HTTPError as exc:
            last_error = exc
            if exc.code not in RETRY_STATUS:
                raise
            time.sleep(RETRY_BACKOFF * attempt)
    raise last_error


def get_json(url: str, user_agent: str) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": user_agent})
    with open_with_retry(req) as resp:
        return json.load(resp)


def strip_html(value: str | None) -> str:
    if not value:
        return ""
    text = re.sub(r"<[^>]+>", "", value)
    return html.unescape(text).strip()


def normalize_title(title: str) -> str:
    if title.startswith("File:"):
        return title
    return f"File:{title}"


def file_page_url(title: str) -> str:
    normalized = normalize_title(title)
    encoded = urllib.parse.quote(normalized, safe=":/")
    return f"https://commons.wikimedia.org/wiki/{encoded}"


def fetch_image_info(title: str, width: int, user_agent: str) -> dict:
    params = {
        "action": "query",
        "titles": normalize_title(title),
        "prop": "imageinfo",
        "iiprop": "url|extmetadata",
        "format": "json",
    }
    if width > 0:
        params["iiurlwidth"] = str(width)
    url = f"{API_URL}?{urllib.parse.urlencode(params)}"
    data = get_json(url, user_agent)
    page = next(iter(data.get("query", {}).get("pages", {}).values()), {})
    info = page.get("imageinfo", [{}])[0]
    if not info:
        raise RuntimeError(f"Missing imageinfo for {title}")
    return info


def build_license_text(meta: dict, artist_label: str) -> str:
    license_name = strip_html(meta.get("LicenseShortName", {}).get("value"))
    if not license_name:
        license_name = strip_html(meta.get("UsageTerms", {}).get("value"))
    license_url = strip_html(meta.get("LicenseUrl", {}).get("value"))
    artist = strip_html(meta.get("Artist", {}).get("value"))

    parts = []
    if license_name:
        if license_url:
            parts.append(f"{license_name} ({license_url})")
        else:
            parts.append(license_name)
    if artist:
        label = artist_label.strip()
        if label:
            parts.append(f"{label}: {artist}")
        else:
            parts.append(f"By {artist}")
    return " / ".join(parts)


def ensure_parent(path: str) -> None:
    parent = os.path.dirname(path)
    if parent:
        os.makedirs(parent, exist_ok=True)


def download_file(url: str, path: str, user_agent: str) -> None:
    req = urllib.request.Request(url, headers={"User-Agent": user_agent})
    with open_with_retry(req) as resp, open(path, "wb") as f:
        f.write(resp.read())


def main() -> int:
    args = parse_args()
    with open(args.input, "r", encoding="utf-8") as f:
        items = json.load(f)

    credits = []
    lines = []

    for item in items:
        title = item.get("file_title")
        output = item.get("output")
        if not title or not output:
            raise RuntimeError("Each item must include file_title and output.")

        info = fetch_image_info(title, args.width, args.user_agent)
        url = info.get("thumburl") or info.get("url")
        if not url:
            raise RuntimeError(f"Missing image URL for {title}")

        if not args.dry_run:
            if args.skip_existing and os.path.exists(output):
                pass
            else:
                ensure_parent(output)
                download_file(url, output, args.user_agent)

        meta = info.get("extmetadata", {})
        source_name = item.get("source_name") or f"Wikimedia Commons: {normalize_title(title).replace('File:', '')}"
        credit = {
            "sourceName": source_name,
            "sourceUrl": file_page_url(title),
            "license": build_license_text(meta, args.artist_label),
        }

        credits.append(
            {
                "id": item.get("id", ""),
                "image": output,
                "credit": credit,
            }
        )

        lines.append(
            {
                "id": item.get("id", ""),
                "lineName": item.get("lineName", ""),
                "series": item.get("series", ""),
                "image": output,
                "credit": credit,
            }
        )

        if args.sleep:
            time.sleep(args.sleep)

    if args.credits_out:
        ensure_parent(args.credits_out)
        with open(args.credits_out, "w", encoding="utf-8") as f:
            json.dump(credits, f, ensure_ascii=False, indent=2)

    if args.lines_out:
        ensure_parent(args.lines_out)
        with open(args.lines_out, "w", encoding="utf-8") as f:
            json.dump(lines, f, ensure_ascii=False, indent=2)

    print(f"Processed {len(items)} item(s).")
    if args.credits_out:
        print(f"Credits written to {args.credits_out}")
    if args.lines_out:
        print(f"Lines written to {args.lines_out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
