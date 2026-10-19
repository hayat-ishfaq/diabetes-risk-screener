"""
Structure and repository integrity tests.

Verifies that essential project components exist:
- backend/app.py
- frontend/package.json
- README.md
"""

import os


def get_repo_root() -> str:
    """Find repository root whether tests are invoked from root or tests dir."""
    current_dir = os.path.abspath(os.path.dirname(__file__))
    candidate = os.path.abspath(os.path.join(current_dir, "..", ".."))
    if os.path.exists(os.path.join(candidate, "backend")):
        return candidate
    return os.getcwd()


def test_structure():
    """Assert presence of 'backend/app.py', 'frontend/package.json', and 'README.md'."""
    repo_root = get_repo_root()

    required_files = [
        os.path.join(repo_root, "backend", "app.py"),
        os.path.join(repo_root, "frontend", "package.json"),
        os.path.join(repo_root, "README.md"),
    ]

    for file_path in required_files:
        assert os.path.exists(file_path), f"Required file not found: {file_path}"
        assert os.path.isfile(file_path), f"Expected file but found directory: {file_path}"
