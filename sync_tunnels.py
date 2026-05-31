import os
import sys
import re
import subprocess

def run_git(cmd):
    try:
        subprocess.run(cmd, check=True, shell=True)
    except subprocess.CalledProcessError as e:
        print(f"Git command failed: {e}")

def main():
    print("============================================================")
    print("        CORALTEAMS HYBRID TUNNEL SYNCHRONIZER               ")
    print("============================================================\n")

    # 1. Ask for URLs
    colab_url = input("🔗 Enter your NEW Colab Ollama Ngrok URL (or press Enter to keep current): ").strip()
    backend_url = input("🚀 Enter your NEW Codespace Backend Ngrok URL (or press Enter to keep current): ").strip()

    modified_files = []

    # 2. Update Semantic Engine Config
    if colab_url:
        colab_url = colab_url.rstrip('/')
        config_path = "semantic-engine/app/config.py"
        if os.path.exists(config_path):
            with open(config_path, "r", encoding="utf-8") as f:
                content = f.read()
            
            # Replace the ollama_host value
            new_content = re.sub(
                r'ollama_host:\s*str\s*=\s*["\'][^"\']+["\']',
                f'ollama_host: str = "{colab_url}"',
                content
            )
            
            with open(config_path, "w", encoding="utf-8") as f:
                f.write(new_content)
            
            print(f"✓ Updated Colab LLM tunnel in {config_path}")
            modified_files.append(config_path)

    # 3. Update Frontend Config
    if backend_url:
        backend_url = backend_url.rstrip('/')
        frontend_env = "frontend/.env"
        with open(frontend_env, "w", encoding="utf-8") as f:
            f.write(f"NEXT_PUBLIC_API_URL={backend_url}\n")
        print(f"✓ Updated Backend tunnel in {frontend_env}")
        modified_files.append(frontend_env)

        # Update root .env as well
        root_env = ".env"
        if os.path.exists(root_env):
            with open(root_env, "r", encoding="utf-8") as f:
                lines = f.readlines()
            
            new_lines = []
            for line in lines:
                if line.startswith("NEXT_PUBLIC_API_URL="):
                    new_lines.append(f"NEXT_PUBLIC_API_URL={backend_url}\n")
                else:
                    new_lines.append(line)
            
            with open(root_env, "w", encoding="utf-8") as f:
                f.write("".join(new_lines))
            print(f"✓ Updated Backend tunnel in root {root_env}")

    # 4. Automate Commit & Push if any file was changed
    if modified_files:
        print("\n⚡ Synchronizing changes with GitHub...")
        run_git("git add -f " + " ".join(modified_files))
        run_git('git commit -m "chore: update dynamic hybrid tunnel endpoints"')
        
        print("\n📥 Pulling latest changes to avoid conflicts...")
        run_git("git pull --rebase origin main")
        
        print("\n📤 Pushing to GitHub main branch...")
        run_git("git push origin main")
        
        print("\n🎉 TUNNELS FULLY SYNCHRONIZED AND PUSHED SUCCESSFULLY!")
        print("Vercel and Render are now rebuilding with your new active runtimes!")
    else:
        print("\nℹ No URL updates provided. Active configurations unchanged.")

if __name__ == "__main__":
    main()
