import re
from datetime import datetime
from typing import Any, cast

import contentful

from server.config import (
    CONTENTFUL_ACCESS_TOKEN,
    CONTENTFUL_CONTENT_TYPE_ID,
    CONTENTFUL_SPACE_ID,
)

_client: Any | None = None


def _get_client() -> Any | None:
    """
    Returns the Contentful client, creating it on first use.

    Constructing the client fetches the space's content types over the network, so it is
    deferred until a blog endpoint needs it. A failed attempt is not cached, so the next
    request tries again.
    """
    global _client
    if _client is None:
        try:
            contentful_module = cast(Any, contentful)
            _client = contentful_module.Client(
                CONTENTFUL_SPACE_ID, CONTENTFUL_ACCESS_TOKEN
            )
        except Exception as e:
            print(f"Failed to initialise Contentful client: {e}")
    return _client


def _as_list(val: Any) -> list[Any]:
    """Helper to erase 'Unknown' types for Pyright without triggering Mypy's redundant cast."""
    return cast(list[Any], val)


def _as_dict(val: Any) -> dict[str, Any]:
    """Helper to erase 'Unknown' types for Pyright without triggering Mypy's redundant cast."""
    return cast(dict[str, Any], val)


def normalise_contentful_data(data: Any) -> Any:
    """
    Recursively converts Contentful SDK objects (Entries, Assets, Links, datetimes)
    into JSON-serialisable dictionaries and strings.
    """
    if isinstance(data, list):
        return [normalise_contentful_data(item) for item in _as_list(data)]

    if isinstance(data, dict):
        return {k: normalise_contentful_data(v) for k, v in _as_dict(data).items()}

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


def extract_first_image(content: Any) -> str | None:
    """
    Traverses content (Rich Text or Markdown string) to find the first image URL.
    """
    if not content:
        return None

    if isinstance(content, str):
        match = re.search(r"!\[[^\]]*\]\(([^)]*)\)", content)
        if match:
            url = match.group(1)
            if url.startswith("//"):
                return f"https:{url}"
            return url
        return None

    if isinstance(content, dict):
        content_dict = _as_dict(content)

        if content_dict.get("nodeType") == "embedded-asset-block":
            try:
                data_dict = _as_dict(content_dict.get("data", {}))
                target = data_dict.get("target", {})

                if isinstance(target, dict):
                    target_dict = _as_dict(target)
                    fields = _as_dict(target_dict.get("fields", {}))
                    file_data = _as_dict(fields.get("file", {}))

                    asset_url: str | None = (
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

        content_list = content_dict.get("content", [])
        if isinstance(content_list, list):
            for node in _as_list(content_list):
                url = extract_first_image(node)
                if url:
                    return url

    return None


def get_all_posts() -> list[dict[str, Any]] | None:
    """Fetches all blog post entries from Contentful."""
    client = _get_client()
    if not client:
        return None
    try:
        entries = cast(
            list[Any],
            client.entries(
                {
                    "content_type": CONTENTFUL_CONTENT_TYPE_ID,
                    "order": "-sys.createdAt",
                }
            ),
        )

        posts: list[dict[str, Any]] = []
        for entry in entries:
            fields = entry.fields() if callable(entry.fields) else entry.fields

            if not isinstance(fields, dict):
                continue

            fields_dict = _as_dict(fields)

            raw_content = fields_dict.get("content")
            normalised_content = normalise_contentful_data(raw_content)
            thumbnail_url = extract_first_image(normalised_content)

            posts.append(
                {
                    "id": entry.id,
                    "title": fields_dict.get("title"),
                    "slug": fields_dict.get("slug"),
                    "summary": fields_dict.get("summary"),
                    "thumbnail": thumbnail_url,
                    "published_date": normalise_contentful_data(
                        entry.sys.get("created_at") if hasattr(entry, "sys") else None
                    ),
                }
            )

        return posts
    except Exception as e:
        print(f"Error fetching posts from Contentful: {e}")
        return None


def get_post_by_slug(slug: str) -> dict[str, Any] | None:
    """Fetches a single blog post entry by its slug from Contentful."""
    client = _get_client()
    if not client:
        return None
    try:
        entries = cast(
            list[Any],
            client.entries(
                {
                    "content_type": CONTENTFUL_CONTENT_TYPE_ID,
                    "fields.slug": slug,
                    "limit": 1,
                }
            ),
        )
        if not entries:
            return None

        entry = entries[0]

        raw_fields = entry.fields() if callable(entry.fields) else entry.fields

        if not isinstance(raw_fields, dict):
            return None

        fields_dict = _as_dict(raw_fields)

        return {
            "id": entry.id,
            "title": fields_dict.get("title"),
            "slug": fields_dict.get("slug"),
            "content": normalise_contentful_data(fields_dict.get("content")),
            "published_date": (
                normalise_contentful_data(entry.sys.get("created_at"))
                if hasattr(entry, "sys") and hasattr(entry.sys, "get")
                else None
            ),
        }
    except Exception as e:
        print(f"Error fetching post '{slug}' from Contentful: {e}")
        return None
