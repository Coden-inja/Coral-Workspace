import os
import sys
import re
import httpx
import json

def print_banner(text):
    print("\n" + "=" * 80)
    print(f" {text:^78} ")
    print("=" * 80)

def print_section(title):
    print("\n" + "=" * 80)
    print(f" [TEST: {title}]")
    print("=" * 80)

def main():
    print_banner("CORALTEAMS HYBRID MULTI-CLOUD CONTROL PLANE DIAGNOSTIC")
    
    # Track overall health
    all_services_healthy = True

    # =========================================================================
    # STEP 1: SERVICE DISCOVERY & NETWORK TOPO
    # =========================================================================
    # 1. Parse Backend URL from frontend/.env
    env_path = "frontend/.env"
    backend_url = None
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                if line.startswith("NEXT_PUBLIC_API_URL="):
                    backend_url = line.split("=", 1)[1].strip()
                    
    if not backend_url:
        print("[FAIL] Error: NEXT_PUBLIC_API_URL not set in frontend/.env.")
        sys.exit(1)

    # 2. Parse Ollama Colab Host from semantic-engine/app/config.py or semantic-engine/.env
    colab_url = "https://jarrod-unannulled-opposedly.ngrok-free.dev" # default fallback
    se_env_path = "semantic-engine/.env"
    if os.path.exists(se_env_path):
        with open(se_env_path, "r", encoding="utf-8") as f:
            for line in f:
                if line.startswith("OLLAMA_HOST="):
                    colab_url = line.split("=", 1)[1].strip()
    else:
        se_config_path = "semantic-engine/app/config.py"
        if os.path.exists(se_config_path):
            with open(se_config_path, "r", encoding="utf-8") as f:
                for line in f:
                    match = re.search(r'ollama_host:\s*str\s*=\s*["\']([^"\']+)["\']', line)
                    if match:
                        colab_url = match.group(1)

    # 3. Target Deployed URLs
    frontend_url = "https://coral-workspace.vercel.app"
    render_url = "https://coral-workspace.onrender.com"

    print(f" [BACKEND] Codespaces Backend Tunnel URL : {backend_url}")
    print(f" [FRONTEND] Deployed Vercel Frontend URL  : {frontend_url}")
    print(f" [SEMANTIC] Deployed Render Semantic URL  : {render_url}")
    print(f" [LLM GPU] Google Colab GPU Ollama URL   : {colab_url}")
    print("=" * 80)

    client = httpx.Client(timeout=10.0)

    # =========================================================================
    # SERVICE 1: DEPLOYED VERCEL FRONTEND DIAGNOSTICS
    # =========================================================================
    print_section("SERVICE TEST 1: Deployed Vercel Frontend (UI Layer)")
    try:
        response = client.get(f"{frontend_url}/login")
        print(f" Request URL : {frontend_url}/login")
        print(f" Status Code : {response.status_code}")
        
        if response.status_code == 200:
            print(" Raw Headers :")
            for k, v in list(response.headers.items())[:5]:
                print(f"   {k}: {v}")
            title_match = re.search(r"<title>(.*?)</title>", response.text)
            if title_match:
                print(f"   Page Title: '{title_match.group(1)}'")
            else:
                print("   [WARN] No title tag found in Vercel output.")
            print(" [OK] Frontend is ONLINE and serving page routes!")
        else:
            print(f" [FAIL] Frontend returned non-200 status: {response.status_code}")
            print(f" Raw Response Snippet: {response.text[:200]}")
            all_services_healthy = False
    except Exception as e:
        print(f" [FAIL] Frontend ping failed: {e}")
        all_services_healthy = False

    # =========================================================================
    # SERVICE 2: CODESPACES BACKEND TUNNEL DIAGNOSTICS
    # =========================================================================
    print_section("SERVICE TEST 2: Codespaces Backend Tunnel (App API)")
    try:
        response = client.get(f"{backend_url}/")
        print(f" Request URL : {backend_url}/")
        print(f" Status Code : {response.status_code}")
        
        if response.status_code == 200:
            print(f" Raw JSON Response: {response.json()}")
            print(" [OK] Backend Tunnel is ONLINE and responding!")
        else:
            print(f" [FAIL] Backend tunnel returned non-200 status: {response.status_code}")
            print(f" Raw Response Snippet: {response.text[:200]}")
            all_services_healthy = False
    except Exception as e:
        print(f" [FAIL] Backend tunnel ping failed: {e}")
        all_services_healthy = False

    # =========================================================================
    # SERVICE 3: DEPLOYED RENDER SEMANTIC ENGINE DIAGNOSTICS
    # =========================================================================
    print_section("SERVICE TEST 3: Deployed Render Semantic Engine (Schema Planner)")
    try:
        response = client.get(f"{render_url}/")
        print(f" Request URL : {render_url}/")
        print(f" Status Code : {response.status_code}")
        
        if response.status_code == 200:
            try:
                print(f" Raw JSON Response: {response.json()}")
            except:
                print(f" Raw Text Response: {response.text[:200]}")
            print(" [OK] Render Semantic Engine is ONLINE and responding!")
        else:
            print(f" [FAIL] Render Semantic Engine returned non-200 status: {response.status_code}")
            print(f" Raw Response Snippet: {response.text[:200]}")
            all_services_healthy = False
    except Exception as e:
        print(f" [FAIL] Deployed Semantic Engine ping failed: {e}")
        all_services_healthy = False

    # =========================================================================
    # SERVICE 4: GOOGLE COLAB GPU OLLAMA DIAGNOSTICS (OLLAMA DIRECT API)
    # =========================================================================
    print_section("SERVICE TEST 4: Google Colab GPU Ollama (AI Generation Layer)")
    ollama_online = False
    try:
        response = client.get(f"{colab_url}/api/tags")
        print(f" Request URL : {colab_url}/api/tags")
        print(f" Status Code : {response.status_code}")
        
        if response.status_code == 200:
            print(f" Raw Models Installed: {json.dumps(response.json(), indent=2)}")
            print(" [OK] Colab GPU Ollama is ONLINE and fully responding!")
            ollama_online = True
        else:
            print(f" [FAIL] Colab GPU Ollama tunnel returned non-200 status: {response.status_code}")
            print(f" Raw Response Snippet (Ngrok/Server Error Info):\n{response.text[:300]}")
            all_services_healthy = False
    except Exception as e:
        print(f" [FAIL] Colab GPU Ollama tunnel ping failed: {e}")
        all_services_healthy = False

    # =========================================================================
    # DIRECT LLM PROMPT TEST
    # =========================================================================
    if ollama_online:
        print_section("ISOLATED DIRECT TEST: Colab GPU LLM Generation Check")
        prompt_data = {
            "model": "qwen2.5:3b",
            "prompt": "Are you fully operational and responsive? Answer in exactly 3 words.",
            "stream": False
        }
        print(f" Sending direct prompt: '{prompt_data['prompt']}' to model: {prompt_data['model']}")
        try:
            gen_resp = client.post(f"{colab_url}/api/generate", json=prompt_data, timeout=60.0)
            if gen_resp.status_code == 200:
                print(f" Status Code : {gen_resp.status_code}")
                print(f" Direct Raw AI Text Output: '{gen_resp.json().get('response', '').strip()}'")
                print(" [OK] Isolated LLM verification COMPLETE!")
            else:
                print(f" [FAIL] Direct LLM query failed: {gen_resp.status_code}")
                print(f" Raw Response: {gen_resp.text[:200]}")
                all_services_healthy = False
        except Exception as e:
            print(f" [FAIL] Direct LLM query threw exception: {e}")
            all_services_healthy = False

    # =========================================================================
    # COMPONENT TEST: 2. Codespaces User DB (Register/Login)
    # =========================================================================
    print_section("INTEGRATION TEST: Backend Authentication & Workspace Setup")
    signup_data = {
        "email": "test_analyst@coralteams.io",
        "password": "SecurePassword123"
    }
    
    token = None
    workspace_id = None
    client.timeout = 120.0 # extend for semantic DB executions

    try:
        # Attempt Login first
        login_response = client.post(f"{backend_url}/api/login", json=signup_data)
        login_data = login_response.json() if login_response.status_code == 200 else {}
        
        if "error" in login_data or login_response.status_code != 200:
            print(" User does not exist yet. Registering fresh account...")
            register_response = client.post(f"{backend_url}/api/register", json=signup_data)
            print(f" Register Status : {register_response.status_code}")
            print(f" Register Response: {register_response.json()}")
            
            if register_response.status_code == 200 and "error" not in register_response.json():
                login_resp = client.post(f"{backend_url}/api/login", json=signup_data)
                token = login_resp.json().get("access_token")
        else:
            print(" [OK] Login successful!")
            token = login_data.get("access_token")
            
        if token:
            print(f" JWT Token retrieved: {token[:25]}...")
            client.headers.update({"Authorization": f"Bearer {token}"})
            
            # Workspace setup
            workspace_data = {"name": "Demo Harbor Workspace"}
            response = client.post(f"{backend_url}/api/workspaces", json=workspace_data)
            workspace_json = response.json() if response.status_code == 200 else {}
            
            if response.status_code == 200 and "error" not in workspace_json:
                workspace_id = workspace_json.get("id")
                print(f" [OK] Workspace created! ID: {workspace_id}")
            else:
                list_resp = client.get(f"{backend_url}/api/workspaces")
                if list_resp.status_code == 200 and len(list_resp.json()) > 0:
                    workspace_id = list_resp.json()[0].get("id")
                    print(f" Reused existing Workspace. ID: {workspace_id}")
        else:
            print(" [FAIL] Authentication failed. Cannot proceed with integrated tests.")
    except Exception as e:
        print(f" [FAIL] Integrated auth setup failed: {e}")

    if not workspace_id:
        workspace_id = 1

    # =========================================================================
    # TRUE E2E SCENARIO 1: Natural Language Grounded Investigation (NL-to-NL)
    # =========================================================================
    print_section("E2E SCENARIO 1: Natural Language Grounded Investigation (NL-to-NL)")
    print("Goal: Enter natural language query -> Fetch DB records -> Synthesize grounded meaning via Colab LLM.")
    
    nl_query = {
        "workspace_id": workspace_id,
        "query_text": "Which employees resolved the most incidents?"
    }
    
    print(f" Submitting NL Query: '{nl_query['query_text']}'")
    try:
        response = client.post(f"{backend_url}/api/query/nl", json=nl_query)
        if response.status_code == 200:
            result = response.json()
            print("\n [SUCCESS] E2E Scenario 1 Completed Successfully!")
            print(f" SQL: {result.get('generated_sql')}")
            print("-" * 80)
            
            # Transparency logging: Print exactly what facts the Coral database returned
            coral_resp = result.get("coral_response", {})
            raw_db_results = coral_resp.get("query_results", [])
            print(f" Raw Coral Database Query Results (Fact Check): {raw_db_results}")
            
            print("-" * 80)
            print(" Conversational Response (Synthesized via Google Colab GPU):")
            print(result.get("conversational_response"))
            print("-" * 80)
        else:
            print(f" [FAIL] Scenario 1 Failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f" [FAIL] Scenario 1 request failed: {e}")

    # =========================================================================
    # TRUE E2E SCENARIO 2: Direct Developer SQL Terminal (Raw SQL -> Pure JSON)
    # =========================================================================
    print_section("E2E SCENARIO 2: Direct Developer SQL Terminal (Raw SQL -> Pure JSON)")
    print("Goal: Enter raw SQL directly -> Execute against database -> Return pure JSON array instantly, skipping LLM.")
    
    # Corrected selector: SELECT id, email FROM users
    raw_query = {
        "workspace_id": workspace_id,
        "sql_query": "SELECT id, email FROM users LIMIT 5"
    }
    
    print(f" Executing Direct Raw SQL Query: '{raw_query['sql_query']}'")
    try:
        response = client.post(f"{backend_url}/api/query/raw", json=raw_query)
        if response.status_code == 200:
            result = response.json()
            if result.get("status") == "success":
                print("\n [SUCCESS] E2E Scenario 2 Completed Successfully!")
                print(f" SQL: {result.get('sql')}")
                print(f" Response Status: {result.get('status')}")
                print("-" * 80)
                print(" Raw JSON Results Returned (No LLM):")
                print(json.dumps(result.get("query_results"), indent=2))
                print("-" * 80)
            else:
                print("\n [FAIL] E2E Scenario 2 Failed on Backend SQL Execution!")
                print(f" SQL: {raw_query['sql_query']}")
                print(f" Backend Error: {result.get('message')}")
        else:
            print(f" [FAIL] Scenario 2 Failed with status code {response.status_code}: {response.text}")
    except Exception as e:
        print(f" [FAIL] Scenario 2 request failed: {e}")

    if all_services_healthy:
        print_banner("ALL E2E SERVICE DIAGNOSTICS & PIPELINES OPERATIONAL!")
    else:
        print_banner("DIAGNOSTICS COMPLETED WITH SERVICE OFFLINE WARNINGS!")

if __name__ == "__main__":
    main()
