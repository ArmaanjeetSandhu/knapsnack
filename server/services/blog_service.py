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
    print(f"Failed to initialize Contentful client: {e}")


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
                "published_date": entry.sys["created_at"],
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
        return {
            "id": entry.id,
            "title": entry.fields().get("title"),
            "slug": entry.fields().get("slug"),
            "content": entry.fields().get("content"),
            "published_date": entry.sys["created_at"],
        }
    except Exception as e:
        print(f"Error fetching post '{slug}' from Contentful: {e}")
        return None
