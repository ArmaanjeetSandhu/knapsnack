import re
from datetime import datetime
from typing import Any, Dict, List, Optional

import contentful

from server.config import (
    CONTENTFUL_ACCESS_TOKEN,
    CONTENTFUL_CONTENT_TYPE_ID,
    CONTENTFUL_SPACE_ID,
)

try:
    client = contentful.Client(CONTENTFUL_SPACE_ID, CONTENTFUL_ACCESS_TOKEN)
except Exception as e:
    client = None
    print(f"Failed to initialise Contentful client: {e}")


def normalise_contentful_data(data: Any) -> Any:
    """
    Recursively converts Contentful SDK objects (Entries, Assets, Links, datetimes)
    into JSON-serialisable dictionaries and strings.
    """
    if isinstance(data, list):
        return [normalise_contentful_data(item) for item in data]

    if isinstance(data, dict):
        return {k: normalise_contentful_data(v) for k, v in data.items()}

    if hasattr(data, "sys"):
        serialised = {"sys": normalise_contentful_data(data.sys)}

        if hasattr(data, "fields"):
            try:
                if callable(data.fields):
                    fields_data = data.fields()
                else:
                    fields_data = data.fields

                serialised["fields"] = normalise_contentful_data(fields_data)
            except Exception:
                pass

        return serialised

    if isinstance(data, datetime):
        return data.isoformat()

    return data


def extract_first_image(content: Any) -> Optional[str]:
    """
    Traverses content (Rich Text or Markdown string) to find the first image URL.
    """
    if not content:
        return None

    if isinstance(content, str):
        match = re.search(r"!\[.*?\]\((.*?)\)", content)
        if match:
            url = match.group(1)
            if url.startswith("//"):
                return f"https:{url}"
            return url
        return None

    if isinstance(content, dict):
        if content.get("nodeType") == "embedded-asset-block":
            try:
                target = content.get("data", {}).get("target", {})

                if isinstance(target, dict):
                    fields = target.get("fields", {})
                    file_data = fields.get("file", {})
                    asset_url: Optional[str] = (
                        file_data.get("url")
                        if isinstance(file_data.get("url"), str)
                        else None
                    )

                    if asset_url:
                        if asset_url.startswith("//"):
                            return f"https:{asset_url}"
                        return asset_url
            except (AttributeError, KeyError, TypeError):
                pass

        content_list = content.get("content", [])
        if isinstance(content_list, list):
            for node in content_list:
                url = extract_first_image(node)
                if url:
                    return url

    return None


def get_all_posts() -> Optional[List[Dict[str, Any]]]:
    """Fetches all blog post entries from Contentful."""
    if not client:
        print("Error: Contentful client not initialised.")
        return None
    try:
        entries = client.entries(
            {
                "content_type": CONTENTFUL_CONTENT_TYPE_ID,
                "order": "-sys.createdAt",
            }
        )

        posts = []
        for entry in entries:
            fields = entry.fields() if callable(entry.fields) else entry.fields

            if not isinstance(fields, dict):
                continue

            raw_content = fields.get("content")
            normalised_content = normalise_contentful_data(raw_content)
            thumbnail_url = extract_first_image(normalised_content)

            posts.append(
                {
                    "id": entry.id,
                    "title": fields.get("title"),
                    "slug": fields.get("slug"),
                    "summary": fields.get("summary"),
                    "thumbnail": thumbnail_url,
                    "published_date": normalise_contentful_data(
                        entry.sys.get("created_at")
                    ),
                }
            )

        return posts
    except Exception as e:
        print(f"Error fetching posts from Contentful: {e}")
        return None


def get_post_by_slug(slug: str) -> Optional[Dict[str, Any]]:
    """Fetches a single blog post entry by its slug from Contentful."""
    if not client:
        print("Error: Contentful client not initialised.")
        return None
    try:
        entries = client.entries(
            {
                "content_type": CONTENTFUL_CONTENT_TYPE_ID,
                "fields.slug": slug,
                "limit": 1,
            }
        )
        if not entries:
            return None

        entry = entries[0]

        raw_fields = entry.fields() if callable(entry.fields) else entry.fields

        return {
            "id": entry.id,
            "title": raw_fields.get("title") if isinstance(raw_fields, dict) else None,
            "slug": raw_fields.get("slug") if isinstance(raw_fields, dict) else None,
            "content": normalise_contentful_data(
                raw_fields.get("content") if isinstance(raw_fields, dict) else None
            ),
            "published_date": (
                normalise_contentful_data(entry.sys.get("created_at"))
                if hasattr(entry.sys, "get")
                else None
            ),
        }
    except Exception as e:
        print(f"Error fetching post '{slug}' from Contentful: {e}")
        return None
