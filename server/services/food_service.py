"""
Services for food data retrieval and processing.
"""

from typing import Any, Dict, List, Union

import requests

from server.utils.nutrient_utils import extract_nutrients


def search_foods(
    api_key: str, search_term: str, api_endpoint: str
) -> List[Dict[str, Any]]:
    """
    Search for foods using the USDA API with pagination.

    Args:
        api_key: USDA API key
        search_term: Term to search for
        api_endpoint: USDA API endpoint URL

    Returns:
        List of food dictionaries with nutrients

    Raises:
        requests.exceptions.RequestException: If API request fails
    """
    search_results = []
    page_size = 200
    page_number = 1
    total_pages = 1

    while page_number <= total_pages:
        params: Dict[str, Union[str, int, bool]] = {
            "api_key": api_key,
            "query": search_term,
            "dataType": "SR Legacy",
            "pageSize": page_size,
            "pageNumber": page_number,
            "requireAllWords": True,
        }

        response = requests.get(api_endpoint, params=params)
        response.raise_for_status()

        data = response.json()

        if page_number == 1:
            total_hits = data.get("totalHits", 0)
            total_pages = (total_hits + page_size - 1) // page_size

            if total_pages > 10:
                total_pages = 10

        for food in data.get("foods", []):
            search_results.append(
                {
                    "fdcId": str(food.get("fdcId")),
                    "description": food.get("description"),
                    "nutrients": extract_nutrients(food.get("foodNutrients", [])),
                }
            )

        page_number += 1

    return search_results
