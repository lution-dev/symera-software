# AGENTS.md — Lidtek Engineering OS v2

## ⛔ MANDATORY — READ BEFORE ANY ACTION

This project operates under the **Lidtek Harness Engineering** protocol.

**You MUST complete these steps IN ORDER before writing ANY code:**

### Step 1: Read the protocol
Read file: harness/HARNESS.md (ENTIRE file)

### Step 2: Run the memory hook (Step 0 in HARNESS.md)
```powershell
node "c:\Users\Lucas\OneDrive\Documentos\Projetos\lidtek-memoria\hooks\entrada.js" "[describe the task]" "Symera" | Out-File harness\MEMORY_CONTEXT.md -Encoding utf8
```
Then read harness/MEMORY_CONTEXT.md.

### Step 3: Read project state
Read: harness/CONTEXT.md and harness/BACKLOG.md

### Step 4: Read design system (if UI changes)
Read: harness/DESIGN.md

## Rules
- NEVER skip steps. Even for simple requests.
- NEVER write code before registering the task in BACKLOG.md.
- ALWAYS run sensors after each task.
- ALWAYS update CONTEXT.md at session end.
- ALWAYS run the exit hook at session end.