# Security Guidelines 🔐

> **Hackathon Project — Banking LOS Demo**
> 
> This app handles simulated financial data. Treat credential safety seriously even for demos.

---

## ⚠️ CRITICAL: Files That Must NEVER Be Committed

| File/Pattern | Contains | Leak Impact |
|---|---|---|
| `dashboard/.env` | Anthropic API key, Gemini API key | **$$$ stolen API credits**, account takeover |
| `*.db` | SQLite database with all loan data | **Simulated PII exposure** |
| `*.log` | Server logs with paths, errors | **System info leakage** |
| `*.pem`, `*.key` | SSL certificates, SSH keys | **Server compromise** |

---

## ✅ Pre-Commit Safety Checklist

Before every `git push`, run this mental checklist:

```bash
# 1. See exactly what you're about to commit
git status

# 2. Check NO .env files are staged
git diff --cached --name-only | grep -E "\.env$|\.key$|\.pem$|\.p12$"
# EXPECT: No output (= safe)

# 3. Scan staged code for API key patterns
git diff --cached | grep -iE "sk-ant-|sk-proj-|AIza[\w-]{20,}"
# EXPECT: No output (= safe)

# 4. Only then push
git push
```

**If any of the checks show output — STOP and fix before pushing.**

---

## 🔑 Credential Management

### Where secrets live

```
Dashboard/
├── .env              ← REAL keys (gitignored ✅)
├── .env.example      ← Template (safe to commit ✅)
└── ...
```

### Setting up your local environment

1. Copy the template:
   ```bash
   cd dashboard
   cp .env.example .env
   ```

2. Fill in real values in `.env`:
   ```bash
   ANTHROPIC_API_KEY=sk-ant-api03-your-real-key-here
   GEMINI_API_KEY=AIza-your-real-key-here
   ```

3. **Never** edit `.env.example` to put real keys in it.

---

## 🚨 If You Accidentally Commit Secrets

### Scenario A: Not pushed yet (local only)

```bash
# Unstage the file
git rm --cached dashboard/.env

# Verify it's gone from staging
git status
# Should show: "deleted: dashboard/.env" in staged + "Untracked: dashboard/.env"

# Commit the removal
git commit -m "Remove accidentally committed .env"
```

### Scenario B: Already pushed to GitHub

```bash
# 1. IMMEDIATELY rotate (revoke) the leaked API key in:
#    - Anthropic Console: https://console.anthropic.com/
#    - Google AI Studio: https://aistudio.google.com/

# 2. Remove from history (destructive — coordinate with team)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch dashboard/.env" \
  HEAD

# 3. Force push (everyone must re-clone)
git push origin --force --all
```

> ⚠️ **Force-push rewrites history.** Everyone on the team must delete their local repo and re-clone after this.

---

## 🛡️ Hardcoded Demo Credentials

This project has intentionally hardcoded demo credentials for hackathon judging:

| Username | Password | Role |
|---|---|---|
| `analyst01` | `bms2025` | Analyst |
| `analyst02` | `bms2025` | Analyst |
| `supervisor` | `bms2025` | Supervisor |

**These are acceptable for a demo/hackathon** because:
- Judges need to log in without setup
- No real customer data is involved
- The system is not production-facing

**If adapting for real use:** Replace with hashed passwords + JWT sessions.

---

## 📋 What .gitignore Protects

See `.gitignore` for the full list. Key patterns:

```gitignore
.env              # All env files (except .env.example)
*.db              # SQLite databases
*.log             # Log files
node_modules/     # Dependencies
.venv/            # Python virtual env
```

If you add a new file that might contain secrets, **add it to .gitignore first** before creating it.

---

## 🔍 How to Audit for Leaks

```bash
# Search entire repo history for API key patterns
git log --all --full-history -- . | grep -iE "sk-ant-|sk-proj-|AIza[\w-]{20,}"

# Search current working tree
grep -r "sk-ant-" . --include="*.ts" --include="*.tsx" --include="*.py" --include="*.env"
```

---

## 🆘 Emergency Contacts

If you discover a leaked secret:

1. **Revoke the key immediately** (don't wait for approval)
2. **Notify the team lead** in your group chat
3. **Document what was leaked** (which key, what permissions it had)
4. **Check usage logs** in the provider console for unauthorized usage

---

## 📚 Provider Console Links

| Service | Console | Key Rotation |
|---|---|---|
| Anthropic | https://console.anthropic.com/ | Settings → API Keys → Revoke |
| Google AI (Gemini) | https://aistudio.google.com/ | API Keys → Delete |

---

*Last updated: April 2025 — Banking Hackfest 2025*
