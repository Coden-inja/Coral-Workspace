import os
import sys
import httpx

def print_section(title):
    print("\n" + "=" * 80)
    print(f" 🛡️  SCENARIO: {title}")
    print("=" * 80)

def main():
    print("\n" + "█" * 80)
    print("        CORALTEAMS E2E SECURITY STACK VALIDATION SUITE        ")
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
    
    # 2. Test Backend Health Check
    try:
        response = httpx.get(f"{backend_url}/", timeout=10.0)
        if response.status_code == 200:
            print(f"✅ Connection Established! Backend response: {response.json()}")
        else:
            print(f"❌ Backend returned status code {response.status_code}: {response.text}")
            sys.exit(1)
    except Exception as e:
        print(f"❌ Failed to connect to Backend tunnel: {e}")
        print("   Please ensure your GitHub Codespace is active and Ngrok is serving.")
        sys.exit(1)

    client = httpx.Client(timeout=120.0)
    token = None
    workspace_id = None
    connector_id = None

    # =========================================================================
    # SCENARIO 1: Security Authentication & Session Handshake
    # =========================================================================
    print_section("1. Security Authentication & Session Handshake")
    print("Goal: Test user database write, password hashing, and JWT token issuance.")
    
    signup_data = {
        "email": "test_analyst@coralteams.io",
        "name": "Lead Analyst Jordan",
        "password": "SecurePassword123",
        "role": "admin"
    }
    
    print(f"🔹 Registering new account: {signup_data['email']}...")
    try:
        # First, try to login in case the user already exists
        login_response = client.post(
            f"{backend_url}/auth/login",
            json={"email": signup_data["email"], "password": signup_data["password"]}
        )
        if login_response.status_code == 200:
            print("ℹ️  User already existed. Logging in directly...")
            token = login_response.json().get("access_token")
        else:
            # Register if not exists
            register_response = client.post(f"{backend_url}/auth/register", json=signup_data)
            if register_response.status_code == 200:
                print("✅ Account created successfully in PostgreSQL!")
                token = register_response.json().get("access_token")
            else:
                print(f"❌ Registration failed: {register_response.status_code} - {register_response.text}")
                sys.exit(1)
        
        if token:
            print(f"🔑 JWT Token issued: {token[:25]}...")
            client.headers.update({"Authorization": f"Bearer {token}"})
        else:
            print("❌ Token extraction failed.")
            sys.exit(1)
    except Exception as e:
        print(f"❌ Scenario 1 Failed: {e}")
        sys.exit(1)

    # =========================================================================
    # SCENARIO 2: Workspace Boundary Provisioning
    # =========================================================================
    print_section("2. Workspace Boundary Provisioning")
    print("Goal: Test Postgres workspace tables & dynamic environment setup.")
    
    workspace_data = {
        "name": "Demo Harbor Workspace",
        "description": "Secure workspace boundary for multi-cloud validation operations."
    }
    
    print(f"🔹 Creating Workspace boundary: '{workspace_data['name']}'...")
    try:
        response = client.post(f"{backend_url}/workspaces", json=workspace_data)
        if response.status_code == 200:
            workspace_id = response.json().get("id")
            print(f"✅ Workspace provisioned successfully! ID: {workspace_id}")
        else:
            # Fallback if list is already populated
            list_resp = client.get(f"{backend_url}/workspaces")
            if list_resp.status_code == 200 and len(list_resp.json()) > 0:
                workspace_id = list_resp.json()[0].get("id")
                print(f"ℹ️  Reusing existing Workspace boundary. ID: {workspace_id}")
            else:
                print(f"❌ Workspace creation failed: {response.status_code} - {response.text}")
                sys.exit(1)
    except Exception as e:
        print(f"❌ Scenario 2 Failed: {e}")
        sys.exit(1)

    # =========================================================================
    # SCENARIO 3: Log Ingestion & Data Connectors Setup
    # =========================================================================
    print_section("3. Log Ingestion & Data Connectors Setup")
    print("Goal: Configure dynamic data connector endpoints for logs ingestion.")
    
    connector_data = {
        "name": "Slack Operations Feed",
        "type": "slack",
        "configuration": {"channel": "#security-alerts", "webhook_url": "https://hooks.slack.com/services/123"},
        "workspace_id": workspace_id
    }
    
    print(f"🔹 Connecting connector '{connector_data['name']}' to Workspace {workspace_id}...")
    try:
        response = client.post(f"{backend_url}/connectors", json=connector_data)
        if response.status_code == 200:
            connector_id = response.json().get("id")
            print(f"✅ Connector connected successfully! ID: {connector_id}")
        else:
            print(f"❌ Connector failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Scenario 3 Failed: {e}")

    # =========================================================================
    # SCENARIO 4: Natural Language AI Grounding & CEO Report (LLM Flow)
    # =========================================================================
    print_section("4. Natural Language AI Grounding & CEO Report (Dual-Stage LLM)")
    print("Goal: Test NL-to-SQL parsing, data execution, and final Colab LLM synthesization.")
    
    query_payload = {
        "query": "Which employees resolved the most incidents?",
        "workspace_id": workspace_id
    }
    
    print(f"🔹 Submitting Natural Language Query to LLM...")
    print(f"👉 Query: '{query_payload['query']}'")
    try:
        response = client.post(f"{backend_url}/query", json=query_payload, timeout=120.0)
        if response.status_code == 200:
            result = response.json()
            print("\n🎉 E2E MULTI-CLOUD PIPELINE COMPLETED SUCCESSFULLY!")
            print(f"🤖 User Query: {result.get('query')}")
            print(f"⚙️  Generated SQL: {result.get('generated_sql')}")
            print("-" * 75)
            print("🤖 Conversational Response (Synthesized Conversational ground from Google Colab GPU):")
            coral_response = result.get("coral_response", {})
            print(coral_response.get("answer", "No response synthesized."))
            print("-" * 75)
            print(f"📊 Confidence Score: {coral_response.get('confidence', 'N/A')}")
        else:
            print(f"❌ End-to-End Query Failed with status code {response.status_code}: {response.text}")
            print("   Please check that your Colab Ollama is serving on the dynamic tunnel.")
    except Exception as e:
        print(f"❌ End-to-End Query Connection Failed: {e}")
        print("   Verify all dynamic tunnels are active and Colab is listening.")

    print("\n" + "█" * 80)
    print("               CORALTEAMS E2E VALIDATION RUN COMPLETED!               ")
    print("█" * 80 + "\n")

if __name__ == "__main__":
    main()
