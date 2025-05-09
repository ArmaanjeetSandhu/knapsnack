"""
Utility functions for HTTP responses.
"""

from typing import Dict, List, Optional, Tuple

import pandas as pd
from flask import Response, jsonify


def create_error_response(
    message: str, details: Optional[List[str]] = None, status_code: int = 400
) -> Tuple[Response, int]:
    """
    Create a standardized error response.

    Args:
        message: Main error message
        details: List of detailed error messages
        status_code: HTTP status code

    Returns:
        Flask response with JSON and status code
    """
    response = {"error": message}
    if details:
        response["messages"] = "; ".join(details)
    return jsonify(response), status_code


def process_bounds_for_response(bounds: pd.Series) -> Dict[str, float]:
    """
    Process nutrient bounds for API response.

    Args:
        bounds: Pandas Series with nutrient bounds

    Returns:
        Dictionary with non-NA values converted to float
    """
    return {k: float(v) for k, v in bounds.to_dict().items() if pd.notna(v)}
