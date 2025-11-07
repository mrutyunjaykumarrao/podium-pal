# 🎯 Quick Start for Team Members

## ✅ Current Branch Structure (CORRECTED!)

```
main (production - final code)
  ↑
develop (testing/integration) ← EVERYONE STARTS HERE!
  ↑
├── mrutyunjay (personal)
├── reddi7 (personal)
├── hamees (personal)
└── nischay (personal)
```

## 🚀 How to Get Started

### For New Team Members:

```bash
# 1. Clone the repository
git clone https://github.com/mrutyunjaykumarrao/podium-pal.git
cd podium-pal

# 2. IMPORTANT: Switch to develop branch
git checkout develop

# 3. Verify you're on develop
git branch  # Should show * develop

# 4. Create YOUR personal branch from develop
git checkout -b your-name
# Example: git checkout -b reddi7

# 5. Push your branch to GitHub
git push -u origin your-name

# 6. You're ready to code! 🎉
```

## 📋 Daily Workflow

### Starting Your Day:
```bash
# Get latest from develop
git checkout develop
git pull origin develop

# Go back to your branch
git checkout your-name

# Merge latest develop into your branch
git merge develop
```

### Ending Your Day:
```bash
# Save your work
git add .
git commit -m "What you did today"
git push origin your-name
```

### When Feature is Complete:
```bash
# 1. Make sure develop is merged into your branch
git checkout develop
git pull origin develop
git checkout your-name
git merge develop

# 2. Push your latest changes
git push origin your-name

# 3. Create Pull Request on GitHub:
#    your-name → develop (NOT to main!)
```

## ⚠️ IMPORTANT RULES

1. ✅ **DO:** Always branch from `develop`
2. ✅ **DO:** Merge PRs into `develop` first
3. ✅ **DO:** Test everything on `develop`
4. ❌ **DON'T:** Push directly to `main`
5. ❌ **DON'T:** Create PRs to `main` (only `develop` → `main` at the end)

## 🎪 The Flow

```
Your Work → Your Branch → PR → develop → Test → PR → main → 🎉
```

## 📞 Need Help?

- Check `TEAM_WORKFLOW.md` for detailed task division
- Ask in team chat before making big changes
- Review each other's PRs before merging

---

**Remember:** `develop` is your friend! Always work from there! 🚀
