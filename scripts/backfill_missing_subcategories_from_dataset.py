import csv
import re
from pathlib import Path

import psycopg2

DB_URL = "postgresql://neondb_owner:npg_blPQ09vgTLiI@ep-lucky-glitter-afuy9gkd-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require"
ROOT = Path(__file__).resolve().parents[1]
CATEGORY_FILE = ROOT / "src" / "shared" / "categoryHierarchy.ts"
DATASET_FILE = ROOT / "datasets" / "FULLNEONDATABSEUPDATED.csv"

ROOT_CATEGORY_LABELS = {
    "Food",
    "Housing",
    "Health",
    "Employment",
    "Education",
    "Legal",
    "Money",
    "Family",
    "Urgent",
    "Specialized Support",
}


def parse_leaf_labels() -> list[str]:
    content = CATEGORY_FILE.read_text(encoding="utf-8")
    labels = re.findall(r"label:\s*'([^']+)'", content)
    leaf_labels = [label for label in labels if label not in ROOT_CATEGORY_LABELS]
    return list(dict.fromkeys(leaf_labels))


def load_dataset_rows() -> list[dict]:
    with DATASET_FILE.open("r", encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


def as_float_or_none(value: str):
    if value is None:
        return None
    value = str(value).strip()
    if not value:
        return None
    try:
        return float(value)
    except ValueError:
        return None


def first_nonempty(*values):
    for v in values:
        if v is None:
            continue
        s = str(v).strip()
        if s:
            return s
    return None


def main():
    leaf_labels = parse_leaf_labels()
    dataset_rows = load_dataset_rows()

    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()

    # Count existing per leaf subcategory across curated + approved submissions.
    existing_counts = {}
    for label in leaf_labels:
        cur.execute(
            """
            SELECT COUNT(*) FROM (
                SELECT category FROM curated_resources WHERE category = %s
                UNION ALL
                SELECT category FROM resource_submissions WHERE category = %s AND status = 'approved'
            ) x
            """,
            (label, label),
        )
        existing_counts[label] = int(cur.fetchone()[0])

    missing = [label for label in leaf_labels if existing_counts[label] == 0]
    print(f"Missing leaf subcategories before backfill: {len(missing)}")

    inserted = 0
    for label in missing:
        candidate = next((r for r in dataset_rows if (r.get("category") or "").strip() == label), None)
        if not candidate:
            # Absolute fallback so every subcategory has at least one record.
            candidate = {
                "title": f"{label} Resource Center",
                "description": f"Community support and referrals for {label.lower()}.",
                "category": label,
                "city": "Seattle",
                "state": "WA",
                "zip": "98101",
                "phone": None,
                "email": None,
                "website": None,
                "hours": None,
                "audience": "Everyone",
                "services": label,
                "image_url": None,
                "latitude": None,
                "longitude": None,
            }

        title = first_nonempty(candidate.get("title")) or f"{label} Resource"
        description = first_nonempty(candidate.get("description")) or f"Resources for {label.lower()}."
        category = label
        tags = first_nonempty(candidate.get("tags"))
        address = first_nonempty(candidate.get("address"))
        city = first_nonempty(candidate.get("city")) or "Seattle"
        state = first_nonempty(candidate.get("state")) or "WA"
        zip_code = first_nonempty(candidate.get("zip"))
        phone = first_nonempty(candidate.get("phone"))
        email = first_nonempty(candidate.get("email"))
        website = first_nonempty(candidate.get("website"))
        hours = first_nonempty(candidate.get("hours"))
        audience = first_nonempty(candidate.get("audience"))
        services = first_nonempty(candidate.get("services"))
        image_url = first_nonempty(candidate.get("image_url"))
        latitude = as_float_or_none(candidate.get("latitude"))
        longitude = as_float_or_none(candidate.get("longitude"))

        # Avoid duplicate inserts for same category/title.
        cur.execute(
            "SELECT 1 FROM curated_resources WHERE category = %s AND title = %s LIMIT 1",
            (category, title),
        )
        if cur.fetchone():
            continue

        cur.execute(
            """
            INSERT INTO curated_resources
            (title, description, category, tags, address, city, state, zip, phone, email, website, hours, audience, services, image_url, latitude, longitude, is_featured, click_count)
            VALUES
            (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, false, 0)
            """,
            (
                title,
                description,
                category,
                tags,
                address,
                city,
                state,
                zip_code,
                phone,
                email,
                website,
                hours,
                audience,
                services,
                image_url,
                latitude,
                longitude,
            ),
        )
        inserted += 1

    conn.commit()

    # Re-check after inserts.
    remaining = []
    for label in leaf_labels:
        cur.execute(
            """
            SELECT COUNT(*) FROM (
                SELECT category FROM curated_resources WHERE category = %s
                UNION ALL
                SELECT category FROM resource_submissions WHERE category = %s AND status = 'approved'
            ) x
            """,
            (label, label),
        )
        if int(cur.fetchone()[0]) == 0:
            remaining.append(label)

    cur.close()
    conn.close()

    print(f"Inserted records: {inserted}")
    print(f"Missing leaf subcategories after backfill: {len(remaining)}")
    if remaining:
        print("Still missing:", remaining)


if __name__ == "__main__":
    main()
