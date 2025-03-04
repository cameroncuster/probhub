#!/usr/bin/env python3

import os
import re
import csv
import json
import requests
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime
import psycopg
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Constants
CODEFORCES_API_BASE = "https://codeforces.com/api"
CSV_OUTPUT_FILE = "codeforces_problems.csv"
ADDED_BY_PROFILE = "https://codeforces.com/profile/ssk4988"
ADDED_BY = "ssk4988"
DATABASE_URL = os.getenv("DATABASE_URL")

# Problem URLs from input
PROBLEM_URLS = [
    "codeforces.com/contest/2002/problem/C",
    "codeforces.com/contest/1794/problem/E",
    "codeforces.com/contest/2056/problem/D",
    "codeforces.com/contest/2061/problem/E",
    "codeforces.com/contest/1988/problem/E",
    "codeforces.com/contest/1763/problem/E",
    "codeforces.com/contest/2004/problem/E",
    "codeforces.com/contest/1285/problem/E",
    "codeforces.com/contest/2033/problem/G",
    "codeforces.com/contest/1674/problem/G",
    "codeforces.com/contest/1750/problem/E",
    "codeforces.com/contest/1657/problem/E",
    "codeforces.com/contest/1766/problem/E",
    "codeforces.com/contest/1971/problem/G",
    "codeforces.com/contest/2026/problem/E",
    "codeforces.com/contest/2022/problem/E1",
    "codeforces.com/contest/981/problem/E",
    "codeforces.com/contest/13/problem/E",
    "codeforces.com/contest/1615/problem/E",
    "codeforces.com/contest/1100/problem/F",
    "codeforces.com/contest/1987/problem/F1",
    "codeforces.com/contest/1922/problem/F",
    "codeforces.com/contest/1919/problem/F2",
    "codeforces.com/contest/1476/problem/E",
    "codeforces.com/contest/1748/problem/E",
    "codeforces.com/contest/1486/problem/E",
    "codeforces.com/contest/1736/problem/D",
    "codeforces.com/contest/1909/problem/E",
    "codeforces.com/contest/1203/problem/F1",
    "codeforces.com/contest/1936/problem/C",
    "codeforces.com/contest/1856/problem/E1",
    "codeforces.com/contest/1824/problem/B2",
    "codeforces.com/contest/1810/problem/E",
    "codeforces.com/contest/1804/problem/E",
]


def extract_contest_and_index(url: str) -> Tuple[str, str]:
    """Extract contest ID and problem index from a Codeforces problem URL."""
    # Handle both URL formats
    if "problemset/problem" in url:
        match = re.search(r"problem(?:set)?/problem/(\d+)/([A-Z0-9]+)", url)
    else:
        match = re.search(r"contest/(\d+)/problem/([A-Z0-9]+)", url)

    if not match:
        raise ValueError(f"Could not parse contest ID and index from URL: {url}")

    return match.group(1), match.group(2)


def fetch_all_problems_data() -> Dict[str, Any]:
    """Fetch all problems data from Codeforces API at once."""
    try:
        print("Fetching all problems from Codeforces API...")
        response = requests.get(f"{CODEFORCES_API_BASE}/problemset.problems")
        if response.status_code != 200:
            print(f"Error fetching problems: {response.status_code}")
            return None

        data = response.json()
        if data.get("status") != "OK":
            print(f"API error: {data.get('comment', 'Unknown error')}")
            return None

        print(
            f"Successfully fetched {len(data['result']['problems'])} problems from API"
        )
        return data["result"]
    except Exception as e:
        print(f"Error fetching problems data: {str(e)}")
        return None


def find_problem_data(
    all_problems_data: Dict[str, Any], contest_id: str, index: str
) -> Optional[Dict[str, Any]]:
    """Find a specific problem in the pre-loaded problems data."""
    if not all_problems_data:
        return None

    # Find the specific problem
    problem_data = None
    for problem in all_problems_data["problems"]:
        # Convert contestId to string for comparison
        if (
            str(problem.get("contestId", "")) == contest_id
            and problem.get("index", "") == index
        ):
            problem_data = problem
            break

    if not problem_data:
        print(f"Problem not found: contest {contest_id}, index {index}")
        return None

    # Get problem statistics
    problem_statistics = None
    for stat in all_problems_data["problemStatistics"]:
        if (
            str(stat.get("contestId", "")) == contest_id
            and stat.get("index", "") == index
        ):
            problem_statistics = stat
            break

    # Construct problem object
    problem = {
        "id": f"{contest_id}{index}",
        "name": problem_data.get("name", "Unknown"),
        "tags": problem_data.get("tags", []),
        "difficulty": problem_data.get("rating", 0),
        "url": f"https://codeforces.com/contest/{contest_id}/problem/{index}",
        "solved": (
            problem_statistics.get("solvedCount", 0) if problem_statistics else 0
        ),
        "dateAdded": datetime.now().strftime("%Y-%m-%d"),
        "addedBy": ADDED_BY,
        "addedByUrl": ADDED_BY_PROFILE,
        "likes": 0,  # Default values as these aren't available from the API
        "dislikes": 0,
    }

    return problem


def write_to_csv(problems: List[Dict[str, Any]], filename: str) -> None:
    """Write problem data to a CSV file."""
    fieldnames = [
        "id",
        "name",
        "tags",
        "difficulty",
        "url",
        "solved",
        "dateAdded",
        "addedBy",
        "addedByUrl",
        "likes",
        "dislikes",
    ]

    with open(filename, "w", newline="", encoding="utf-8") as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for problem in problems:
            # Convert tags list to string for CSV
            if isinstance(problem["tags"], list):
                problem["tags"] = json.dumps(problem["tags"])
            writer.writerow(problem)

    print(f"CSV file created: {filename}")


def insert_into_database(problems: List[Dict[str, Any]]) -> None:
    """Insert problem data into the database."""
    if not DATABASE_URL:
        print(
            "DATABASE_URL environment variable not found. Skipping database insertion."
        )
        return

    try:
        # Connect to the database using psycopg3
        with psycopg.connect(DATABASE_URL) as conn:
            # Create a cursor
            with conn.cursor() as cursor:
                # Insert each problem
                for problem in problems:
                    # Convert tags list to PostgreSQL array format
                    tags_array = problem["tags"]
                    if isinstance(tags_array, str):
                        # If tags were converted to JSON string for CSV, convert back to list
                        tags_array = json.loads(tags_array)

                    # SQL query for insertion
                    query = """
                    INSERT INTO problems 
                    (name, tags, difficulty, url, solved, date_added, added_by, added_by_url, likes, dislikes)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """

                    # Execute the query
                    cursor.execute(
                        query,
                        (
                            problem["name"],
                            tags_array,
                            problem["difficulty"],
                            problem["url"],
                            problem["solved"],
                            problem["dateAdded"],
                            problem["addedBy"],
                            problem["addedByUrl"],
                            problem["likes"],
                            problem["dislikes"],
                        ),
                    )

                # Commit is automatic with context manager
                print(
                    f"Successfully inserted {len(problems)} problems into the database."
                )

    except Exception as e:
        print(f"Error inserting into database: {str(e)}")


def main():
    """Main function to fetch problem data, write to CSV, and insert into database."""
    print("Starting Codeforces problem data extraction...")

    # Fetch all problems data once
    all_problems_data = fetch_all_problems_data()
    if not all_problems_data:
        print("Failed to fetch problems data from API. Exiting.")
        return

    problems = []
    for url in PROBLEM_URLS:
        try:
            # Ensure URL has https:// prefix
            if not url.startswith("http"):
                url = "https://" + url

            contest_id, index = extract_contest_and_index(url)
            print(f"Processing: Contest {contest_id}, Problem {index}")

            problem_data = find_problem_data(all_problems_data, contest_id, index)
            if problem_data:
                problems.append(problem_data)
                print(f"Successfully extracted data for {problem_data['name']}")
            else:
                print(f"Failed to find data for contest {contest_id}, problem {index}")

        except Exception as e:
            print(f"Error processing URL {url}: {str(e)}")

    if problems:
        # Write to CSV
        write_to_csv(problems, CSV_OUTPUT_FILE)
        print(
            f"Successfully processed {len(problems)} out of {len(PROBLEM_URLS)} problems"
        )

        # Insert into database - commented out for first run
        insert_into_database(problems)

        # Print the extracted problem data
        print("\nExtracted Problem Data:")
        for problem in problems:
            print(
                f"ID: {problem['id']}, Name: {problem['name']}, Difficulty: {problem['difficulty']}"
            )
    else:
        print(
            "No problem data was fetched. CSV file not created and database not updated."
        )


if __name__ == "__main__":
    main()
