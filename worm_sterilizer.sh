#!/bin/bash
# Shai-Hulud 3.0 "Mini" Edition Audit - UNIVERSAL (Mac & Linux) - May 14, 2026

echo "--- STARTING SYSTEM INTEGRITY AUDIT (Mac & Linux) ---"

# Detect Operating System
OS="$(uname)"
if [ "$OS" = "Darwin" ]; then
    echo "Detected OS: macOS"
else
    echo "Detected OS: Linux"
fi

# 1. Process Check (Ignoring 'ubuntu' false positives)
echo "[1/5] Checking for malicious background daemons..."
SUSPICIOUS_PROC=$(ps aux | grep -v grep | grep -wE "gh-token-monitor|bun|tanstack_runner|router_runtime|setup_bun")

if [ -n "$SUSPICIOUS_PROC" ]; then
    echo "!! ALERT: Malicious process detected !!"
    echo "$SUSPICIOUS_PROC"
    echo "ACTION: Run 'pkill -9 -f gh-token-monitor' IMMEDIATELY."
else
    echo "OK: No malicious processes found."
fi

# 2. Filesystem & Background Service Check
echo "[2/5] Searching for persistence services..."
FILES=$(find ~ -maxdepth 3 -name "gh-token-monitor.sh" -o -name "router_init.js" -o -name "setup_bun.js" 2>/dev/null)

if [ "$OS" = "Darwin" ]; then
    # macOS specific check
    PERSISTENCE=$(ls ~/Library/LaunchAgents/com.user.gh-token-monitor.plist ~/Library/LaunchAgents/gh-token-monitor.plist 2>/dev/null)
else
    # Linux specific check
    PERSISTENCE=$(ls ~/.config/systemd/user/gh-token-monitor.service 2>/dev/null)
fi

if [ -n "$FILES" ] || [ -n "$PERSISTENCE" ]; then
    echo "!! ALERT: Persistence files found !!"
    echo "$FILES $PERSISTENCE"
    if [ "$OS" = "Darwin" ]; then
        echo "MAC ACTION: Run 'launchctl unload ~/Library/LaunchAgents/com.user.gh-token-monitor.plist' before deleting."
    fi
else
    echo "OK: No background persistence files found."
fi

# 3. AI Tool Configuration Audit
echo "[3/5] Checking Claude/VSCode for injected hooks..."
CLAUDE_HOOK=$(grep -lE "router_runtime|setup.mjs" ~/.claude/settings.json 2>/dev/null)
VSCODE_HOOK=$(grep -lE "router_runtime|setup.mjs" .vscode/tasks.json 2>/dev/null)

if [ -n "$CLAUDE_HOOK" ] || [ -n "$VSCODE_HOOK" ]; then
    echo "!! ALERT: AI Configuration has been tampered with !!"
else
    echo "OK: AI tool configurations are clean."
fi

# 4. SSH Backdoor Check
echo "[4/5] Auditing authorized SSH keys..."
ROGUE_SSH=$(grep -E "sh-key|pcp-key|tanstack" ~/.ssh/authorized_keys 2>/dev/null)

if [ -n "$ROGUE_SSH" ]; then
    echo "!! ALERT: Unauthorized SSH key found in ~/.ssh/authorized_keys !!"
else
    echo "OK: SSH keys look legitimate."
fi

# 5. Exfiltration Artifact Check
echo "[5/5] Searching for stolen data logs..."
LOGS=$(find /tmp /private/tmp -name "3nvir0nm3nt.json" -o -name "cl0vd.json" -o -name "pigS3cr3ts.json" 2>/dev/null)

if [ -n "$LOGS" ]; then
    echo "!! ALERT: Exfiltration logs found. Your secrets WERE stolen !!"
else
    echo "OK: No exfiltration artifacts found."
fi

echo "--- AUDIT COMPLETE ---"
