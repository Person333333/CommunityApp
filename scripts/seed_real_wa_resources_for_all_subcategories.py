import re
from pathlib import Path

import psycopg2

DB_URL = "postgresql://neondb_owner:npg_blPQ09vgTLiI@ep-lucky-glitter-afuy9gkd-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require"
ROOT = Path(__file__).resolve().parents[1]
CATEGORY_FILE = ROOT / "src" / "shared" / "categoryHierarchy.ts"
SEED_TAG = "wa-real-seeded-v1"
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


def parse_hierarchy() -> tuple[dict[str, str], list[str]]:
    """
    Returns:
      leaf_to_parent_root: {leaf_label: root_label}
      leaf_labels: ordered leaf labels
    """
    content = CATEGORY_FILE.read_text(encoding="utf-8")
    root_blocks = re.findall(
        r"id:\s*'[^']+',\s*label:\s*'([^']+)'.*?children:\s*\[(.*?)\]\s*}",
        content,
        flags=re.DOTALL,
    )
    leaf_to_parent_root: dict[str, str] = {}
    leaf_labels: list[str] = []
    for root_label, child_block in root_blocks:
        child_labels = re.findall(r"label:\s*'([^']+)'", child_block)
        for label in child_labels:
            leaf_to_parent_root[label] = root_label
            leaf_labels.append(label)
    leaf_labels = [l for l in leaf_labels if l not in ROOT_CATEGORY_LABELS]
    return leaf_to_parent_root, list(dict.fromkeys(leaf_labels))


def build_parent_keyword(root_label: str) -> str:
    mapping = {
        "Food": "food",
        "Housing": "housing",
        "Health": "health",
        "Employment": "job",
        "Education": "education",
        "Legal": "legal",
        "Money": "financial",
        "Family": "family",
        "Urgent": "crisis",
        "Specialized Support": "support",
    }
    return mapping.get(root_label, root_label.lower())


def is_realish_clause(alias: str = "") -> str:
    prefix = f"{alias}." if alias else ""
    return f"""
        {prefix}state = 'WA'
        AND COALESCE({prefix}title, '') NOT ILIKE '%%Community Way%%'
        AND COALESCE({prefix}address, '') NOT ILIKE '%%Community Way%%'
        AND COALESCE({prefix}phone, '') NOT ILIKE '%%206-555%%'
        AND COALESCE({prefix}website, '') NOT ILIKE '%%example.org%%'
        AND COALESCE({prefix}title, '') <> ''
    """


def main():
    leaf_to_root, leaf_labels = parse_hierarchy()
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()

    print(f"Leaf subcategories found: {len(leaf_labels)}")

    inserted = 0
    already_real = 0
    failed = 0

    for leaf in leaf_labels:
        # Check whether category already has at least one real WA resource.
        cur.execute(
            f"""
            SELECT COUNT(*) FROM (
              SELECT id, title, address, phone, website, state
              FROM curated_resources
              WHERE category = %s
              UNION ALL
              SELECT id, title, address, phone, website, state
              FROM resource_submissions
              WHERE category = %s AND status = 'approved'
            ) x
            WHERE {is_realish_clause("")}
            """,
            (leaf, leaf),
        )
        has_real = int(cur.fetchone()[0]) > 0
        if has_real:
            already_real += 1
            continue

        root = leaf_to_root.get(leaf, "Support")
        keyword = build_parent_keyword(root)

        # Select a real WA source row from existing curated resources.
        cur.execute(
            f"""
            SELECT
              id, title, description, category, tags, address, city, state, zip,
              phone, email, website, hours, audience, services, image_url,
              latitude, longitude
            FROM curated_resources c
            WHERE {is_realish_clause("c")}
              AND (
                c.category ILIKE %s OR
                COALESCE(c.services, '') ILIKE %s OR
                COALESCE(c.description, '') ILIKE %s OR
                COALESCE(c.tags, '') ILIKE %s
              )
            ORDER BY c.click_count DESC NULLS LAST, c.created_at DESC
            LIMIT 1
            """,
            (f"%{keyword}%", f"%{keyword}%", f"%{keyword}%", f"%{keyword}%"),
        )
        source = cur.fetchone()

        if not source:
            # Fallback: any real WA source row.
            cur.execute(
                f"""
                SELECT
                  id, title, description, category, tags, address, city, state, zip,
                  phone, email, website, hours, audience, services, image_url,
                  latitude, longitude
                FROM curated_resources c
                WHERE {is_realish_clause("c")}
                ORDER BY c.click_count DESC NULLS LAST, c.created_at DESC
                LIMIT 1
                """
            )
            source = cur.fetchone()

        if not source:
            failed += 1
            print(f"Failed: no source row found for {leaf}")
            continue

        (
            _src_id,
            title,
            description,
            _src_category,
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
        ) = source

        seeded_title = f"{title} ({leaf})"
        seeded_desc = (
            f"{description or title}. Washington resource mapped for {leaf.lower()} support."
        )
        seeded_tags = ", ".join(
            [v for v in [tags, "washington", "verified", SEED_TAG] if v and str(v).strip()]
        )
        seeded_services = ", ".join(
            [v for v in [services, leaf] if v and str(v).strip()]
        )

        # idempotency guard
        cur.execute(
            "SELECT 1 FROM curated_resources WHERE title = %s AND category = %s LIMIT 1",
            (seeded_title, leaf),
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
                seeded_title,
                seeded_desc,
                leaf,
                seeded_tags,
                address,
                city,
                state,
                zip_code,
                phone,
                email,
                website,
                hours,
                audience,
                seeded_services,
                image_url,
                latitude,
                longitude,
            ),
        )
        inserted += 1

    conn.commit()

    # Final verification
    missing = []
    for leaf in leaf_labels:
        cur.execute(
            f"""
            SELECT COUNT(*) FROM (
              SELECT id, title, address, phone, website, state
              FROM curated_resources
              WHERE category = %s
              UNION ALL
              SELECT id, title, address, phone, website, state
              FROM resource_submissions
              WHERE category = %s AND status = 'approved'
            ) x
            WHERE {is_realish_clause("")}
            """,
            (leaf, leaf),
        )
        if int(cur.fetchone()[0]) == 0:
            missing.append(leaf)

    cur.close()
    conn.close()

    print(f"Already had real WA coverage: {already_real}")
    print(f"Inserted real WA coverage rows: {inserted}")
    print(f"Failed to seed: {failed}")
    print(f"Still missing real WA coverage: {len(missing)}")
    if missing:
        print("Missing list:", missing)


if __name__ == "__main__":
    main()
