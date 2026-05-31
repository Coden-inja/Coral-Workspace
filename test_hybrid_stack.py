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
        "password": "SecurePassword123"
    }
    
    print(f"🔹 Attempting login for test user: {signup_data['email']}...")
    try:
        # First, try to log in
        login_response = client.post(
            f"{backend_url}/api/login",
            json=signup_data
        )
        
        login_data = login_response.json() if login_response.status_code == 200 else {}
        
        # If login returned "error", it means the user doesn't exist yet! We must register them.
        if "error" in login_data or login_response.status_code != 200:
            print("ℹ️  User does not exist or credentials expired. Registering fresh account...")
            register_response = client.post(f"{backend_url}/api/register", json=signup_data)
            
            if register_response.status_code == 200 and "error" not in register_response.json():
                print("✅ Account created successfully in PostgreSQL!")
                # Log in to get token
                login_resp = client.post(f"{backend_url}/api/login", json=signup_data)
                token = login_resp.json().get("access_token")
            else:
                print(f"❌ Registration failed: {register_response.status_code} - {register_response.text}")
                sys.exit(1)
        else:
            print("ℹ️  User already existed. Logged in successfully!")
            token = login_data.get("access_token")
        
        if token:
            print(f"🔑 JWT Token issued: {token[:25]}...")
            client.headers.update({"Authorization": f"Bearer {token}"})
        else:
            print(f"❌ Token extraction failed. Response data was: {login_data}")
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
        "name": "Demo Harbor Workspace"
    }
    
    print(f"🔹 Creating Workspace boundary: '{workspace_data['name']}'...")
    try:
        response = client.post(f"{backend_url}/api/workspaces", json=workspace_data)
        workspace_json = response.json() if response.status_code == 200 else {}
        
        if response.status_code == 200 and "error" not in workspace_json:
            workspace_id = workspace_json.get("id")
            print(f"✅ Workspace provisioned successfully! ID: {workspace_id}")
        else:
            # Fallback if list is already populated or error occurs
            list_resp = client.get(f"{backend_url}/api/workspaces")
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
        "workspace_id": workspace_id,
        "credentials": "xoxb-slack-token-mock-123456"
    }
    
    print(f"🔹 Connecting Slack connector to Workspace {workspace_id}...")
    try:
        response = client.post(f"{backend_url}/api/connectors/slack", json=connector_data)
        if response.status_code == 200:
            connector_id = response.json().get("id")
            print(f"✅ Slack Connector connected successfully! ID: {connector_id}")
        else:
            print(f"❌ Connector failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Scenario 3 Failed: {e}")

    # =========================================================================
    # SCENARIO 4: Natural Language AI Grounding & CEO Report (Dual-Stage LLM)
    # =========================================================================
    print_section("4. Natural Language AI Grounding & CEO Report (Dual-Stage LLM)")
    print("Goal: Test NL-to-SQL parsing, data execution, and final Colab LLM synthesization.")
    
    query_payload = {
        "workspace_id": workspace_id,
        "query_text": "Which employees resolved the most incidents?"
    }
    
    print(f"🔹 Submitting Natural Language Query to LLM...")
    print(f"👉 Query: '{query_payload['query_text']}'")
    try:
        response = client.post(f"{backend_url}/api/query/nl", json=query_payload, timeout=120.0)
        if response.status_code == 200:
            result = response.json()
            print("\n🎉 E2E MULTI-CLOUD PIPELINE COMPLETED SUCCESSFULLY!")
            print(f"🤖 User Query: {result.get('query_text')}")
            print(f"⚙️  Generated SQL: {result.get('generated_sql')}")
            print("-" * 75)
            print("🤖 Conversational Response (Synthesized Grounded Answer from Google Colab GPU):")
            print(result.get("conversational_response", "No response synthesized."))
            print("-" * 75)
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
