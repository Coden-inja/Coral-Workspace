import os
import sys
import httpx

def print_section(title):
    print("\n" + "=" * 80)
    print(f" 🛡️  {title}")
    print("=" * 80)

def main():
    print("\n" + "█" * 80)
    print("        CORALTEAMS MULTI-CLOUD INDEPENDENT DIAGNOSTIC SUITE        ")
    print("█" * 80)
    
    # 1. Read Backend URL from frontend/.env
    env_path = "frontend/.env"
    if not os.path.exists(env_path):
        print(f"❌ Error: {env_path} not found. Please create it or run sync_tunnels.py.")
        sys.exit(1)
        
    backend_url = None
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            if line.startswith("NEXT_PUBLIC_API_URL="):
                backend_url = line.split("=", 1)[1].strip()
                
    if not backend_url:
        print("❌ Error: NEXT_PUBLIC_API_URL not set in frontend/.env.")
        sys.exit(1)
        
    print(f"📍 Connected Backend Tunnel URL: {backend_url}")
    
    semantic_url = "https://coral-workspace.onrender.com"
    client = httpx.Client(timeout=120.0)
    
    # Diagnostic state tracking
    results = {
        "1. Codespaces Backend Connectivity": "Pending",
        "2. Codespaces User DB (Register/Login)": "Pending",
        "3. Codespaces Workspace Provisioning": "Pending",
        "4. Codespaces Slack Data Connector": "Pending",
        "5. Render Semantic Engine Root": "Pending",
        "6. Render-to-Colab LLM Handshake": "Pending",
        "7. E2E NL-to-SQL Grounded Query": "Pending"
    }

    # =========================================================================
    # COMPONENT 1: Codespaces Backend Connectivity
    # =========================================================================
    print_section("COMPONENT TEST: 1. Codespaces Backend Connectivity")
    try:
        response = client.get(f"{backend_url}/")
        if response.status_code == 200:
            print(f"✅ Backend Online! Response: {response.json()}")
            results["1. Codespaces Backend Connectivity"] = "✅ PASS"
        else:
            print(f"❌ Backend returned status code {response.status_code}: {response.text}")
            results["1. Codespaces Backend Connectivity"] = f"❌ FAIL ({response.status_code})"
    except Exception as e:
        print(f"❌ Connection Failed: {e}")
        results["1. Codespaces Backend Connectivity"] = "❌ OFFLINE (Check Codespace)"

    # =========================================================================
    # COMPONENT 2: User DB / Session Authentication
    # =========================================================================
    print_section("COMPONENT TEST: 2. Codespaces User DB (Register/Login)")
    signup_data = {
        "email": "test_analyst@coralteams.io",
        "password": "SecurePassword123"
    }
    
    token = None
    try:
        # Attempt Login first
        login_response = client.post(f"{backend_url}/api/login", json=signup_data)
        login_data = login_response.json() if login_response.status_code == 200 else {}
        
        if "error" in login_data or login_response.status_code != 200:
            print("ℹ️  User does not exist yet. Registering fresh account...")
            register_response = client.post(f"{backend_url}/api/register", json=signup_data)
            
            if register_response.status_code == 200 and "error" not in register_response.json():
                print("✅ Account registered successfully!")
                login_resp = client.post(f"{backend_url}/api/login", json=signup_data)
                token = login_resp.json().get("access_token")
            else:
                err_msg = register_response.json().get("error", register_response.text) if register_response.status_code == 200 else register_response.text
                print(f"❌ Registration failed: {register_response.status_code} - {err_msg}")
                results["2. Codespaces User DB (Register/Login)"] = f"❌ FAIL ({register_response.status_code})"
        else:
            print("✅ Login successful!")
            token = login_data.get("access_token")
            
        if token:
            print(f"🔑 JWT Token retrieved: {token[:25]}...")
            client.headers.update({"Authorization": f"Bearer {token}"})
            results["2. Codespaces User DB (Register/Login)"] = "✅ PASS"
        else:
            if results["2. Codespaces User DB (Register/Login)"] == "Pending":
                results["2. Codespaces User DB (Register/Login)"] = "❌ FAIL (Token Extraction)"
    except Exception as e:
        print(f"❌ Database Write/Read Failed: {e}")
        results["2. Codespaces User DB (Register/Login)"] = "❌ EXCEPTION"

    # =========================================================================
    # COMPONENT 3: Workspace Provisioning
    # =========================================================================
    print_section("COMPONENT TEST: 3. Codespaces Workspace Provisioning")
    workspace_data = {"name": "Demo Harbor Workspace"}
    workspace_id = None
    
    try:
        response = client.post(f"{backend_url}/api/workspaces", json=workspace_data)
        workspace_json = response.json() if response.status_code == 200 else {}
        
        if response.status_code == 200 and "error" not in workspace_json:
            workspace_id = workspace_json.get("id")
            print(f"✅ Workspace created! ID: {workspace_id}")
            results["3. Codespaces Workspace Provisioning"] = "✅ PASS"
        else:
            list_resp = client.get(f"{backend_url}/api/workspaces")
            if list_resp.status_code == 200 and len(list_resp.json()) > 0:
                workspace_id = list_resp.json()[0].get("id")
                print(f"ℹ️  Reusing existing Workspace boundary. ID: {workspace_id}")
                results["3. Codespaces Workspace Provisioning"] = "✅ PASS (Reused)"
            else:
                print(f"❌ Workspace creation failed: {response.status_code} - {response.text}")
                results["3. Codespaces Workspace Provisioning"] = "❌ FAIL"
    except Exception as e:
        print(f"❌ Workspace boundary failed: {e}")
        results["3. Codespaces Workspace Provisioning"] = "❌ EXCEPTION"

    # =========================================================================
    # COMPONENT 4: Slack Connector
    # =========================================================================
    print_section("COMPONENT TEST: 4. Codespaces Slack Data Connector")
    connector_data = {
        "workspace_id": workspace_id or 1,
        "credentials": "xoxb-slack-token-mock-123456"
    }
    try:
        response = client.post(f"{backend_url}/api/connectors/slack", json=connector_data)
        if response.status_code == 200:
            print(f"✅ Slack Connector registered successfully! ID: {response.json().get('id')}")
            results["4. Codespaces Slack Data Connector"] = "✅ PASS"
        else:
            print(f"❌ Connector creation failed: {response.status_code} - {response.text}")
            results["4. Codespaces Slack Data Connector"] = "❌ FAIL"
    except Exception as e:
        print(f"❌ Connector failed: {e}")
        results["4. Codespaces Slack Data Connector"] = "❌ EXCEPTION"

    # =========================================================================
    # COMPONENT 5: Render Semantic Engine Root
    # =========================================================================
    print_section("COMPONENT TEST: 5. Render Semantic Engine Root")
    try:
        response = httpx.get(semantic_url, timeout=10.0)
        if response.status_code == 200:
            print(f"✅ Semantic Engine Online! Response: {response.json()}")
            results["5. Render Semantic Engine Root"] = "✅ PASS"
        else:
            print(f"❌ Semantic Engine root returned {response.status_code}: {response.text}")
            results["5. Render Semantic Engine Root"] = f"❌ FAIL ({response.status_code})"
    except Exception as e:
        print(f"❌ Connection to Render Failed: {e}")
        results["5. Render Semantic Engine Root"] = "❌ OFFLINE (Check Render)"

    # =========================================================================
    # COMPONENT 6: Render-to-Colab LLM Handshake
    # =========================================================================
    print_section("COMPONENT TEST: 6. Render-to-Colab LLM Handshake")
    try:
        response = httpx.get(f"{semantic_url}/health", timeout=15.0)
        if response.status_code == 200:
            print(f"✅ Colab Ollama Online! Response: {response.json()}")
            results["6. Render-to-Colab LLM Handshake"] = "✅ PASS"
        else:
            print(f"❌ Colab handshake returned {response.status_code}: {response.text}")
            results["6. Render-to-Colab LLM Handshake"] = f"❌ FAIL ({response.status_code})"
    except Exception as e:
        print(f"❌ Connection to Colab Handshake Failed: {e}")
        results["6. Render-to-Colab LLM Handshake"] = "❌ OFFLINE (Check Colab ngrok)"

    # =========================================================================
    # COMPONENT 7: E2E Grounded Query
    # =========================================================================
    print_section("COMPONENT TEST: 7. E2E NL-to-SQL Grounded Query")
    query_payload = {
        "workspace_id": workspace_id or 1,
        "query_text": "Which employees resolved the most incidents?"
    }
    print(f"👉 Submitting Query: '{query_payload['query_text']}'")
    try:
        response = client.post(f"{backend_url}/api/query/nl", json=query_payload, timeout=120.0)
        if response.status_code == 200:
            result = response.json()
            print("\n🎉 Query Executed Successfully!")
            print(f"⚙️  Generated SQL: {result.get('generated_sql')}")
            print(f"🤖 Synthesized ground: {result.get('conversational_response')}")
            results["7. E2E NL-to-SQL Grounded Query"] = "✅ PASS"
        else:
            print(f"❌ E2E Query Failed: {response.status_code} - {response.text}")
            results["7. E2E NL-to-SQL Grounded Query"] = f"❌ FAIL ({response.status_code})"
    except Exception as e:
        print(f"❌ E2E query request failed: {e}")
        results["7. E2E NL-to-SQL Grounded Query"] = "❌ EXCEPTION"

    # =========================================================================
    # DIAGNOSTIC DASHBOARD REPORT
    # =========================================================================
    print("\n" + "█" * 80)
    print("                 CORALTEAMS MULTI-CLOUD DIAGNOSTIC REPORT                 ")
    print("█" * 80)
    for component, status in results.items():
        print(f" 📑 {component:<45} : {status}")
    print("█" * 80 + "\n")

    # Exit early if any core diagnostic component failed
    core_failed = any(
        "❌" in results[comp] for comp in [
            "1. Codespaces Backend Connectivity",
            "2. Codespaces User DB (Register/Login)",
            "5. Render Semantic Engine Root",
            "6. Render-to-Colab LLM Handshake"
        ]
    )
    if core_failed:
        print("⚠️  Core diagnostic components failed. Skipping E2E integration scenarios.")
        return

    # =========================================================================
    # E2E SCENARIO A: Active Threat Correlation
    # =========================================================================
    print_section("INTEGRATION SCENARIO A: Active Threat Correlation Playbook")
    print("Goal: Synthesize real-time multi-cloud correlation by querying specific alert details.")
    
    threat_query = {
        "workspace_id": workspace_id or 1,
        "query_text": "Which security alerts from IP 10.0.0.45 are high severity?"
    }
    
    print(f"🔹 Simulating correlation request for IP '10.0.0.45'...")
    print(f"👉 NL Query: '{threat_query['query_text']}'")
    try:
        response = client.post(f"{backend_url}/api/query/nl", json=threat_query, timeout=120.0)
        if response.status_code == 200:
            result = response.json()
            print("\n✅ Scenario A Completed Successfully!")
            print(f"⚙️  Translated SQL: {result.get('generated_sql')}")
            print("-" * 80)
            print("🤖 Conversational Threat Grounding (Synthesized on Google Colab GPU):")
            print(result.get("conversational_response"))
            print("-" * 80)
        else:
            print(f"❌ Scenario A Failed with status code {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ Scenario A Request Failed: {e}")

    # =========================================================================
    # E2E SCENARIO B: Autonomous Playbook Containment Response
    # =========================================================================
    print_section("INTEGRATION SCENARIO B: Autonomous Playbook Containment Response")
    print("Goal: Validate dynamic database retrieval of incident containment states.")
    
    containment_query = {
        "workspace_id": workspace_id or 1,
        "query_text": "Which incidents are currently under containment?"
    }
    
    print("🔹 Checking active workspace containment playbook states...")
    print(f"👉 NL Query: '{containment_query['query_text']}'")
    try:
        response = client.post(f"{backend_url}/api/query/nl", json=containment_query, timeout=120.0)
        if response.status_code == 200:
            result = response.json()
            print("\n✅ Scenario B Completed Successfully!")
            print(f"⚙️  Translated SQL: {result.get('generated_sql')}")
            print("-" * 80)
            print("🤖 Conversational Playbook Status (Synthesized on Google Colab GPU):")
            print(result.get("conversational_response"))
            print("-" * 80)
        else:
            print(f"❌ Scenario B Failed with status code {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ Scenario B Request Failed: {e}")

    # =========================================================================
    # E2E SCENARIO C: Autonomous Multi-Platform Security Audit (Notion, Figma, GitHub)
    # =========================================================================
    print_section("INTEGRATION SCENARIO C: Autonomous Multi-Platform Security Audit")
    print("Goal: Synthesize real audit checks across active GitHub, Notion, and Figma workspaces.")
    
    audit_queries = [
        {
            "platform": "GitHub Integration",
            "query_text": "List all recent repository changes and commit details from our GitHub SOC workspace"
        },
        {
            "platform": "Notion Security Integration",
            "query_text": "Show all logged incident tickets and workspace records on our Notion operations page"
        },
        {
            "platform": "Figma Design Integration",
            "query_text": "Retrieve the layout details and file names in our Figma security mock folder"
        }
    ]

    for audit in audit_queries:
        print(f"\n🔹 Performing E2E Query for active {audit['platform']}...")
        print(f"👉 NL Query: '{audit['query_text']}'")
        try:
            response = client.post(
                f"{backend_url}/api/query/nl",
                json={"workspace_id": workspace_id or 1, "query_text": audit["query_text"]},
                timeout=120.0
            )
            if response.status_code == 200:
                result = response.json()
                print(f"✅ {audit['platform']} Audit Completed Successfully!")
                print(f"⚙️  Translated SQL: {result.get('generated_sql')}")
                print("-" * 80)
                print(f"🤖 Conversational Synthesis (Synthesized on Google Colab GPU):")
                print(result.get("conversational_response"))
                print("-" * 80)
            else:
                print(f"❌ Audit failed with status code {response.status_code}: {response.text}")
        except Exception as e:
            print(f"❌ Audit request failed: {e}")

    print("\n" + "█" * 80)
    print("             🎉 ALL E2E SECURITY STACK SCENARIOS COMPLETED!             ")
    print("█" * 80 + "\n")

if __name__ == "__main__":
    main()
