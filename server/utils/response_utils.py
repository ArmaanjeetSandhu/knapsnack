"""
Utility function for HTTP responses.
"""

from typing import List, Optional, Tuple

from flask import Response, jsonify


def create_error_response(
    message: str, details: Optional[List[str]] = None, status_code: int = 400
) -> Tuple[Response, int]:
    """
    Create a standardised error response.

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
