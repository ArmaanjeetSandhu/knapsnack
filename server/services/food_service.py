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
    Search for foods using the USDA API.

    Args:
        api_key: USDA API key
        search_term: Term to search for
        api_endpoint: USDA API endpoint URL

    Returns:
        List of food dictionaries with nutrients

    Raises:
        requests.exceptions.RequestException: If API request fails
    """
    params: Dict[str, Union[str, int, bool]] = {
        "api_key": api_key,
        "query": search_term,
        "dataType": "SR Legacy",
        "pageSize": 25,
        "requireAllWords": True,
    }

    response = requests.get(api_endpoint, params=params)
    response.raise_for_status()

    search_results = []
    for food in response.json().get("foods", []):
        search_results.append(
            {
                "fdcId": str(food.get("fdcId")),
                "description": food.get("description"),
                "nutrients": extract_nutrients(food.get("foodNutrients", [])),
            }
        )

    return search_results
