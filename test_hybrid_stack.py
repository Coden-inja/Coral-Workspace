import os
import sys
import httpx

def print_section(title):
    print("\n" + "=" * 65)
    print(f" {title}")
    print("=" * 65)

def main():
    print_section("🔍 CORALTEAMS HYBRID ARCHITECTURE CONNECTIVITY TEST")
    
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
        
    print(f"📍 Read Backend Tunnel URL: {backend_url}")
    
    # 2. Ping Backend
    print("\n🛰️  Step 1: Pinging Backend Codespace Tunnel...")
    try:
        response = httpx.get(f"{backend_url}/", timeout=10.0)
        if response.status_code == 200:
            print(f"✅ Backend Online! Response: {response.json()}")
        else:
            print(f"❌ Backend returned status code {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ Failed to connect to Backend: {e}")
        print("   Make sure your GitHub Codespace is running and the Ngrok tunnel is alive.")
        sys.exit(1)
        
    # 3. Ping Render Semantic Engine
    semantic_url = "https://coral-workspace.onrender.com"
    print(f"\n🛰️  Step 2: Pinging Render Semantic Engine ({semantic_url})...")
    try:
        response = httpx.get(semantic_url, timeout=15.0)
        if response.status_code == 200:
            print(f"✅ Semantic Engine Online! Response: {response.json()}")
        else:
            print(f"❌ Semantic Engine returned status code {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ Failed to connect to Semantic Engine: {e}")
        
    # 4. Check Colab Ollama Connectivity via Semantic Engine
    print("\n🛰️  Step 3: Checking Google Colab LLM Connection via Semantic Engine health check...")
    try:
        response = httpx.get(f"{semantic_url}/health", timeout=20.0)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health Check Succeeded: {data}")
        else:
            print(f"❌ Health Check returned status code {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ Health Check Connection Failed: {e}")

    # 5. Run Live End-to-End Query
    print_section("⚡ RUNNING LIVE END-TO-END QUERY TEST")
    print("Submitting natural language query: 'Which employees resolved the most incidents?'")
    
    # We use workspace_id 1 for demo purposes
    query_payload = {
        "query": "Which employees resolved the most incidents?",
        "workspace_id": 1
    }
    
    try:
        # Backend query route is POST to /query
        response = httpx.post(f"{backend_url}/query", json=query_payload, timeout=120.0)
        if response.status_code == 200:
            result = response.json()
            print("\n🎉 SUCCESS! E2E QUERY FLOW COMPLETED SUCCESSFULLY!")
            print(f"📝 User Query: {result.get('query')}")
            print(f"⚙️  Generated SQL: {result.get('generated_sql')}")
            print("-" * 50)
            print("🤖 Conversational Response (CEO Conversational grounded answer):")
            coral_response = result.get("coral_response", {})
            print(coral_response.get("answer", "No answer parsed."))
            print("-" * 50)
            print(f"📊 Confidence Score: {coral_response.get('confidence', 'N/A')}")
        else:
            print(f"❌ End-to-End Query Failed with status code {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ End-to-End Query Connection Failed: {e}")
        print("   Verify all dynamic tunnels are active and Colab is listening.")

if __name__ == "__main__":
    main()
