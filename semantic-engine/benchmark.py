#!/usr/bin/env python3
"""Benchmark suite: 20 real user questions through the semantic-engine pipeline."""

import json
import sys
import time
import urllib.request
import urllib.error

API_BASE = "http://localhost:8001"
TIMEOUT = 120

BENCHMARK = [
    # --- GitHub Issues (5) ---
    ("Q01", "show issues in mojombo/grit", "github_issues"),
    ("Q02", "open issues in mojombo/grit", "github_issues"),
    ("Q03", "closed issues in mojombo/grit", "github_issues"),
    ("Q04", "recent issues in mojombo/grit", "github_issues"),
    ("Q05", "issues assigned to me on GitHub", "github_issues"),
    # --- GitHub Repositories (4) ---
    ("Q06", "search python repositories", "github_repos"),
    ("Q07", "top starred repositories", "github_repos"),
    ("Q08", "repositories written in rust", "github_repos"),
    ("Q09", "search for my repositories on GitHub", "github_repos"),
    # --- GitHub Pull Requests (3) ---
    ("Q10", "pull requests in mojombo/grit", "github_pulls"),
    ("Q11", "open pull requests in mojombo/grit", "github_pulls"),
    ("Q12", "recent pull requests in mojombo/grit", "github_pulls"),
    # --- GitHub Code Search (3) ---
    ("Q13", "search authentication code on GitHub", "github_code"),
    ("Q14", "search for code using python on GitHub", "github_code"),
    ("Q15", "find code about logging on GitHub", "github_code"),
    # --- Notion Pages (3) ---
    ("Q16", "search my notion pages", "notion_pages"),
    ("Q17", "notion pages about roadmap", "notion_pages"),
    ("Q18", "recent notion pages", "notion_pages"),
    # --- Notion Databases (2) ---
    ("Q19", "notion databases", "notion_databases"),
    ("Q20", "notion databases edited recently", "notion_databases"),
]


def api_post(path: str, body: dict) -> dict | None:
    url = f"{API_BASE}{path}"
    data = json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
            return json.loads(resp.read().decode())
    except Exception as e:
        return {"error": str(e)}


def run_benchmark():
    results = []
    for qid, question, category in BENCHMARK:
        print(f"[{qid}] {question} ...", end=" ", flush=True)
        row = {"id": qid, "question": question, "category": category}

        # Plan
        plan = api_post("/query/plan", {"query": question})
        row["plan_tables"] = (plan or {}).get("candidate_tables", [])
        row["plan_functions"] = (plan or {}).get("candidate_functions", [])
        row["plan_required_filters"] = (plan or {}).get("required_filters", [])

        # SQL
        sql_resp = api_post("/query/sql", {"query": question})
        row["generated_sql"] = (sql_resp or {}).get("sql", "")
        row["sql_warnings"] = (sql_resp or {}).get("warnings", [])

        # Full Query
        t0 = time.time()
        query_resp = api_post("/query", {"query": question})
        elapsed = time.time() - t0
        row["elapsed_s"] = round(elapsed, 1)

        if query_resp and "error" not in query_resp:
            row["generated_sql"] = query_resp.get("generated_sql", row["generated_sql"])
            row["result_count"] = len(query_resp.get("query_results", []))
            row["confidence"] = query_resp.get("confidence", 0)
            row["answer"] = query_resp.get("answer", "")
            row["warnings"] = query_resp.get("warnings", [])
            row["evidence"] = query_resp.get("evidence", [])
        else:
            row["result_count"] = 0
            row["confidence"] = 0
            row["answer"] = str(query_resp)
            row["warnings"] = [str(query_resp.get("error", "unknown"))]

        results.append(row)
        result_str = f"{row['result_count']} rows" if row['result_count'] > 0 else "0 rows"
        print(f"{result_str} ({elapsed:.1f}s)")
    return results


def classify(results: list) -> list:
    for r in results:
        sql = r.get("generated_sql", "").lower()
        tables = r.get("plan_tables", [])
        warnings = r.get("warnings", [])
        rc = r.get("result_count", 0)
        cat = r.get("category", "")
        q = r.get("question", "").lower()

        issues = []
        classification = "correct"

        # Check for execution errors
        if any("coral sql error" in w.lower() or "error" in w.lower() for w in warnings if w):
            classification = "coral_execution_error"
            issues.append("Coral execution error in response")

        # Determine the primary table used (from the first candidate)
        primary_table = tables[0] if tables else "none"

        # Check table selection correctness
        if cat == "github_issues":
            if primary_table != "github.issues" and "github.search_issues" not in tables:
                classification = "wrong_table"
                issues.append(f"Expected github.issues or github.search_issues, got {primary_table}")
        elif cat == "github_repos":
            if "search_repositories" not in sql and "github.repositories" not in sql and "github.repos" not in sql:
                # If the plan suggests search, that's ok
                plan_has_search = any("search" in t for t in tables)
                if not plan_has_search and "github.repos" not in sql and "github.repositories" not in sql:
                    classification = "wrong_table"
                    issues.append(f"Expected search_repositories or repositories, got {primary_table}")
        elif cat == "github_pulls":
            if primary_table != "github.pulls" and "github.search_issues" not in tables:
                classification = "wrong_table"
                issues.append(f"Expected github.pulls or search_issues, got {primary_table}")
        elif cat == "github_code":
            if "search_code" not in sql:
                classification = "wrong_table"
                issues.append(f"Expected search_code function, got {primary_table}")
        elif cat == "notion_pages":
            if "notion.search" not in sql and "notion.search_objects" not in sql and "search" not in sql:
                classification = "wrong_table"
                issues.append(f"Expected notion.search or notion.search_objects, got {primary_table}")
        elif cat == "notion_databases":
            if "notion.databases" not in sql and "notion.search" not in sql:
                classification = "wrong_table"
                issues.append(f"Expected notion.databases or notion.search, got {primary_table}")

        # Check for missing owner/repo filter in issues or pulls
        if cat in ("github_issues", "github_pulls") and "where" not in sql:
            if "search" not in sql:
                if classification == "correct":
                    classification = "missing_filters"
                issues.append("Missing owner/repo WHERE clause")

        # Check for search function with wrong args (q => vs named)
        if "search_data_source_templates" in sql:
            classification = "wrong_function_args"
            issues.append("search_data_source_templates uses named args, got q =>")

        # Check for search_issues without is:issue qualifier
        if "search_issues" in sql and "is:issue" not in sql and "is:pull-request" not in sql:
            # Only flag if it's a search_issues question
            if "issues" in q or "pull requests" in q:
                if classification == "correct":
                    classification = "partial"
                issues.append("search_issues missing is:issue qualifier")

        # Check for empty result with valid source data
        if rc == 0 and classification in ("correct", "partial", "missing_filters"):
            classification = "empty_result"
            issues.append("Empty result despite valid source data")

        # If no issues but 0 rows with no WHERE clause, it's missing filters
        if rc == 0 and classification == "correct" and "where" not in sql:
            classification = "empty_result"
            issues.append("0 rows — likely missing required filters")

        r["classification"] = classification
        r["issues"] = issues
    return results


def expected_sql(r: dict) -> str:
    cat = r["category"]
    q = r["question"].lower()
    if cat == "github_issues":
        if "me" in q or "assigned" in q:
            return "SELECT * FROM github.issues LIMIT 20"
        return "SELECT * FROM github.issues WHERE owner='mojombo' AND repo='grit' LIMIT 20"
    elif cat == "github_repos":
        if "my" in q:
            return "SELECT * FROM github.repositories LIMIT 20"
        return "SELECT * FROM github.search_repositories(q => '<query>') LIMIT 20"
    elif cat == "github_pulls":
        return "SELECT * FROM github.pulls WHERE owner='mojombo' AND repo='grit' LIMIT 20"
    elif cat == "github_code":
        return "SELECT * FROM github.search_code(q => '<query>') LIMIT 20"
    elif cat == "notion_pages":
        return "SELECT * FROM notion.search LIMIT 20"
    elif cat == "notion_databases":
        return "SELECT * FROM notion.databases WHERE database_id = '<id>' LIMIT 20"
    return ""


def print_report(results: list):
    print("\n" + "=" * 140)
    print("BENCHMARK RESULTS")
    print("=" * 140)
    print(f"{'ID':<5} {'Category':<20} {'Classification':<22} {'Rows':<6} {'Conf':<6} {'Time':<6} SQL")
    print("-" * 140)
    for r in results:
        sql_short = r.get("generated_sql", "")[:85].replace("\n", " ")
        print(f"{r['id']:<5} {r['category']:<20} {r['classification']:<22} {r['result_count']:<6} {r['confidence']:<6} {r['elapsed_s']:<6} {sql_short}")

    print("\n" + "=" * 140)
    print("FAILURE ANALYSIS")
    print("=" * 140)
    for r in results:
        if r["classification"] == "correct":
            continue
        print(f"\n### {r['id']}: {r['question']}")
        print(f"  Classification: {r['classification']}")
        print(f"  Issues: {', '.join(r['issues'])}")
        print(f"  Generated SQL: {r['generated_sql']}")
        expected = expected_sql(r)
        if expected:
            print(f"  Expected SQL:  {expected}")
        print(f"  Plan tables: {r['plan_tables'][:3]}")
        print(f"  Plan functions: {r['plan_functions'][:3]}")
        print(f"  Row count: {r['result_count']}")
        print(f"  Warnings: {r['warnings']}")
        # Root cause
        causes = []
        if "wrong_table" in r["classification"]:
            causes.append("retrieval")
        if "missing_filters" in r["classification"] or "empty_result" in r["classification"]:
            causes.append("entity_extraction")
        if "wrong_function_args" in r["classification"]:
            causes.append("rule_generator_limitation")
        if "coral_execution_error" in r["classification"]:
            causes.append("rule_generator_limitation")
        if causes:
            print(f"  Root cause: {', '.join(causes)}")
        print(f"  LLM likely fix: {'yes' if 'retrieval' not in causes or 'entity_extraction' in causes else 'partial'}")

    # Summary
    print("\n" + "=" * 140)
    print("SUMMARY")
    print("=" * 140)
    correct = sum(1 for r in results if r["classification"] == "correct")
    partial = sum(1 for r in results if r["classification"] == "partial")
    wrong_table = sum(1 for r in results if "wrong_table" in r["classification"])
    missing_filters = sum(1 for r in results if "missing_filters" in r["classification"])
    empty = sum(1 for r in results if "empty_result" in r["classification"])
    exec_err = sum(1 for r in results if "coral_execution_error" in r["classification"])
    func_args = sum(1 for r in results if "wrong_function_args" in r["classification"])
    print(f"  Correct:               {correct}")
    print(f"  Partially correct:     {partial}")
    print(f"  Wrong table:           {wrong_table}")
    print(f"  Missing filters:       {missing_filters}")
    print(f"  Empty result:          {empty}")
    print(f"  Wrong function args:   {func_args}")
    print(f"  Coral execution error: {exec_err}")
    print(f"  Total:                 {len(results)}")

    # Failures by root cause
    print("\n--- Root Cause Distribution ---")
    cause_map = {}
    for r in results:
        for cause in r.get("issues", []):
            cause_map[cause] = cause_map.get(cause, 0) + 1
    for cause, count in sorted(cause_map.items(), key=lambda x: -x[1]):
        print(f"  {cause}: {count}")

    # LLM impact
    print("\n--- LLM Impact Estimate ---")
    llm_fixable = 0
    not_fixable = 0
    for r in results:
        if r["classification"] != "correct":
            causes = r.get("issues", [])
            # LLM would fix missing filters, entity extraction, partial, empty result
            if any("filter" in c or "entity" in c or "empty" in c or "qualifier" in c for c in causes):
                llm_fixable += 1
            elif any("table" in c for c in causes):
                # Wrong table could be partially fixed by LLM (better context understanding)
                llm_fixable += 1
            elif any("function_args" in c or "execution" in c for c in causes):
                llm_fixable += 1
            else:
                not_fixable += 1
    print(f"  Failures likely fixable by LLM: {llm_fixable}")
    print(f"  Failures unlikely fixable: {not_fixable}")


if __name__ == "__main__":
    print("Running 20-query benchmark...")
    results = run_benchmark()
    results = classify(results)
    print_report(results)

    # Output raw JSON for further analysis
    with open("/tmp/benchmark_results.json", "w") as f:
        json.dump(results, f, indent=2, default=str)
    print("\nRaw results saved to /tmp/benchmark_results.json")
