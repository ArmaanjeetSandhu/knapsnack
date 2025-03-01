#!/usr/bin/env python3
"""
Setup script for test environment
"""
import argparse
import subprocess
import sys


def setup_test_environment():
    """
    Set up the test environment by installing required packages
    """
    print("Setting up test environment...")

    requirements = [
        "pytest",
        "pytest-cov",
        "requests-mock",
        "pandas",
        "numpy",
        "scipy",
        "flask",
        "flask-cors",
    ]

    try:
        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", "--upgrade"] + requirements
        )
        print("Successfully installed required packages.")
    except subprocess.CalledProcessError:
        print(
            "Failed to install packages. Please check your internet connection and permissions."
        )
        return False

    return True


def run_tests(coverage=False):
    """
    Run the test suite with optional coverage
    """
    if coverage:
        print("Running tests with coverage...")
        subprocess.call(
            [
                "python",
                "-m",
                "pytest",
                "--cov=server",
                "--cov-report=term",
                "--cov-report=html",
            ]
        )
    else:
        print("Running tests...")
        subprocess.call(["python", "-m", "pytest"])


def main():
    parser = argparse.ArgumentParser(
        description="Set up and run tests for the nutrition API"
    )
    parser.add_argument(
        "--setup", action="store_true", help="Set up the test environment"
    )
    parser.add_argument("--run", action="store_true", help="Run the tests")
    parser.add_argument(
        "--coverage", action="store_true", help="Run tests with coverage"
    )

    args = parser.parse_args()

    if args.setup:
        setup_test_environment()

    if args.run or args.coverage:
        run_tests(coverage=args.coverage)

    if not (args.setup or args.run or args.coverage):
        if setup_test_environment():
            run_tests()


if __name__ == "__main__":
    main()
