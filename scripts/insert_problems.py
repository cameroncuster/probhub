#!/usr/bin/env python3

import os
import csv
import json
import psycopg
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Constants
CSV_INPUT_FILE = "codeforces_problems.csv"
DATABASE_URL = os.getenv("DATABASE_URL")


def insert_csv_into_database(csv_file: str) -> None:
    """Read data from CSV file and insert into database."""
    if not DATABASE_URL:
        print(
            "DATABASE_URL environment variable not found. Cannot connect to database."
        )
        return

    try:
        # Read the CSV file
        problems = []
        with open(csv_file, "r", newline="", encoding="utf-8") as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                # Convert tags from JSON string back to list
                if "tags" in row and isinstance(row["tags"], str):
                    try:
                        row["tags"] = json.loads(row["tags"])
                    except json.JSONDecodeError:
                        print(
                            f"Warning: Could not parse tags for problem {row.get('id', 'unknown')}"
                        )
                        row["tags"] = []

                problems.append(row)

        print(f"Read {len(problems)} problems from CSV file")

        # Connect to the database and insert data
        with psycopg.connect(DATABASE_URL) as conn:
            with conn.cursor() as cursor:
                # Insert each problem
                inserted_count = 0
                for problem in problems:
                    try:
                        # Check if the problem already exists
                        check_query = "SELECT COUNT(*) FROM problems WHERE url = %s"
                        cursor.execute(check_query, (problem.get("url", ""),))
                        exists = cursor.fetchone()[0] > 0

                        if exists:
                            print(
                                f"Problem {problem.get('id', 'unknown')} already exists, skipping."
                            )
                            continue

                        # SQL query for insertion without ON CONFLICT
                        query = """
                        INSERT INTO problems 
                        (name, tags, difficulty, url, solved, date_added, added_by, added_by_url, likes, dislikes)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        """

                        # Execute the query
                        cursor.execute(
                            query,
                            (
                                problem.get("name", "Unknown"),
                                problem.get("tags", []),
                                int(problem.get("difficulty", 0)),
                                problem.get("url", ""),
                                int(problem.get("solved", 0)),
                                problem.get("dateAdded", ""),
                                problem.get("addedBy", ""),
                                problem.get("addedByUrl", ""),
                                int(problem.get("likes", 0)),
                                int(problem.get("dislikes", 0)),
                            ),
                        )
                        inserted_count += 1
                        print(f"Inserted problem {problem.get('id', 'unknown')}")
                    except Exception as e:
                        print(
                            f"Error inserting problem {problem.get('id', 'unknown')}: {str(e)}"
                        )
                        # Continue with the next problem instead of aborting the transaction
                        conn.rollback()

                # Commit is automatic with context manager
                print(
                    f"Successfully inserted {inserted_count} problems into the database."
                )

    except FileNotFoundError:
        print(f"CSV file not found: {csv_file}")
    except Exception as e:
        print(f"Error processing CSV file: {str(e)}")


def main():
    """Main function to read CSV and insert into database."""
    print(f"Reading from CSV file: {CSV_INPUT_FILE}")
    insert_csv_into_database(CSV_INPUT_FILE)
    print("Database insertion process completed.")


if __name__ == "__main__":
    main()
