import contentful
from datetime import datetime
from server.config import (
    CONTENTFUL_ACCESS_TOKEN,
    CONTENTFUL_CONTENT_TYPE_ID,
    CONTENTFUL_SPACE_ID,
)

try:
    client = contentful.Client(CONTENTFUL_SPACE_ID, CONTENTFUL_ACCESS_TOKEN)
except Exception as e:
    client = None
    print(f"Failed to initialize Contentful client: {e}")


def normalize_contentful_data(data):
    """
    Recursively converts Contentful SDK objects (Entries, Assets, Links, datetimes)
    into JSON-serializable dictionaries and strings.
    """
    # 1. Handle List
    if isinstance(data, list):
        return [normalize_contentful_data(item) for item in data]

    # 2. Handle Dict
    if isinstance(data, dict):
        return {k: normalize_contentful_data(v) for k, v in data.items()}

    # 3. Handle Contentful Objects (Entries, Assets, Links)
    # All Contentful SDK resources have a 'sys' attribute.
    if hasattr(data, "sys"):
        serialized = {"sys": normalize_contentful_data(data.sys)}

        # Check if 'fields' attribute exists (method or property)
        if hasattr(data, "fields"):
            try:
                # In the Python SDK, .fields() is usually a method
                if callable(data.fields):
                    fields_data = data.fields()
                else:
                    fields_data = data.fields

                serialized["fields"] = normalize_contentful_data(fields_data)
            except Exception:
                pass

        return serialized

    # 4. Handle Datetime
    if isinstance(data, datetime):
        return data.isoformat()

    # 5. Return basic types (str, int, float, bool, None) as-is
    return data


def get_all_posts():
    """Fetches all blog post entries from Contentful."""
    if not client:
        print("Error: Contentful client not initialized.")
        return None
    try:
        entries = client.entries(
            {
                "content_type": CONTENTFUL_CONTENT_TYPE_ID,
                "order": "-sys.createdAt",
            }
        )
        return [
            {
                "id": entry.id,
                "title": entry.fields().get("title"),
                "slug": entry.fields().get("slug"),
                "summary": entry.fields().get("summary"),
                "published_date": normalize_contentful_data(
                    entry.sys.get("created_at")
                ),
            }
            for entry in entries
        ]
    except Exception as e:
        print(f"Error fetching posts from Contentful: {e}")
        return None


def get_post_by_slug(slug):
    """Fetches a single blog post entry by its slug from Contentful."""
    if not client:
        print("Error: Contentful client not initialized.")
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
            "content": normalize_contentful_data(
                raw_fields.get("content") if isinstance(raw_fields, dict) else None
            ),
            "published_date": (
                normalize_contentful_data(entry.sys.get("created_at"))
                if hasattr(entry.sys, "get")
                else None
            ),
        }
    except Exception as e:
        print(f"Error fetching post '{slug}' from Contentful: {e}")
        return None
