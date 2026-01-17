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
    Recursively converts Contentful SDK objects (Entries, Assets, datetimes)
    into JSON-serializable dictionaries and strings.
    """
    if isinstance(data, list):
        return [normalize_contentful_data(item) for item in data]

    if isinstance(data, dict):
        return {k: normalize_contentful_data(v) for k, v in data.items()}

    if hasattr(data, "sys") and hasattr(data, "fields"):
        fields = data.fields()
        return {
            "sys": normalize_contentful_data(data.sys),
            "fields": normalize_contentful_data(fields),
        }

    if isinstance(data, datetime):
        return data.isoformat()

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

        normalized_content = normalize_contentful_data(entry.fields().get("content"))
        normalized_date = normalize_contentful_data(entry.sys.get("created_at"))

        return {
            "id": entry.id,
            "title": entry.fields().get("title"),
            "slug": entry.fields().get("slug"),
            "content": normalized_content,
            "published_date": normalized_date,
        }
    except Exception as e:
        print(f"Error fetching post '{slug}' from Contentful: {e}")
        return None
