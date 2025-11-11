# Preferences Fix Summary

## Problem
Raycast for Windows extension preferences were not persisting - values would disappear every time the configuration page was reopened.

## Root Cause
This is a **Raycast for Windows beta issue** where preferences are not being saved to disk properly. This is not a problem with our extension code, but with how Raycast for Windows handles preference persistence.

## Solution Implemented

### 1. ✅ Removed Workaround Command
- Deleted `src/configure.tsx` (Configure Extension command)
- Deleted `CONFIGURATION_WORKAROUND.md`
- Removed command from `package.json`

### 2. ✅ Added Environment Variables Fallback
Modified `src/jira-api.ts` to automatically fall back to environment variables when preferences are empty:

```typescript
// Tries preferences first, then environment variables
const jiraDomain = preferences.jiraDomain || process.env.JIRA_DOMAIN || "";
const email = preferences.email || process.env.JIRA_EMAIL || "";
const apiToken = preferences.apiToken || process.env.JIRA_API_TOKEN || "";
```

**Benefits:**
- ✅ Standard solution (not a workaround)
- ✅ Secure (user-specific environment variables)
- ✅ Automatic fallback
- ✅ No UI changes needed
- ✅ Works until Raycast fixes the issue

### 3. ✅ Created Setup Script
Created `setup-credentials.ps1` - an interactive PowerShell script that:
- Prompts for your Jira credentials
- Sets environment variables securely
- Provides clear instructions
- Optionally restarts Raycast

### 4. ✅ Added Comprehensive Documentation
- `PREFERENCES_TROUBLESHOOTING.md` - Detailed troubleshooting guide
- Updated `README.md` with both configuration options
- `PREFERENCES_FIX_SUMMARY.md` - This document

## How to Use

### Quick Setup (Recommended)

1. **Run the setup script:**
   ```powershell
   cd "c:\Users\owen.price\OneDrive - Modulr Finance\4. Code\jira"
   .\setup-credentials.ps1
   ```

2. **Follow the prompts:**
   - Enter Jira Domain (e.g., `modulrfinance.atlassian.net`)
   - Enter Email
   - Enter API Token (hidden)
   - Enter Default Project (optional)

3. **Restart Raycast:**
   - The script will offer to close Raycast for you
   - Reopen Raycast manually
   - Try running a Jira command

### Manual Setup

If you prefer to set environment variables manually:

```powershell
# Open PowerShell
[Environment]::SetEnvironmentVariable("JIRA_DOMAIN", "modulrfinance.atlassian.net", "User")
[Environment]::SetEnvironmentVariable("JIRA_EMAIL", "owen.price@modulrfinance.com", "User")
[Environment]::SetEnvironmentVariable("JIRA_API_TOKEN", "your-api-token-here", "User")

# Restart Raycast
```

### Verify Setup

```powershell
# Check environment variables
$env:JIRA_DOMAIN
$env:JIRA_EMAIL
$env:JIRA_API_TOKEN

# Should show your configured values
```

## How It Works

1. **Extension starts** → Tries to read Raycast preferences
2. **Preferences empty?** → Falls back to environment variables
3. **Both empty?** → Shows error message with instructions
4. **Values found?** → Extension works normally

## Preference Hierarchy

The extension checks in this order:
1. **Raycast Preferences** (if they're working)
2. **Environment Variables** (fallback)
3. **Error** (if neither available)

## Still Want to Use Raycast Preferences?

If Raycast preferences start working:
1. Set your values in Raycast preferences
2. The extension will use those automatically
3. Environment variables will be ignored (since preferences take precedence)
4. No code changes needed

## Troubleshooting

### Environment Variables Not Working?

```powershell
# Verify they're set
[Environment]::GetEnvironmentVariable("JIRA_DOMAIN", "User")

# If null, run setup script again
.\setup-credentials.ps1
```

### Still Getting "Not Configured" Error?

1. Verify environment variables are set (see above)
2. **Restart Raycast** (close completely and reopen)
3. Check extension logs in Raycast for errors
4. See `PREFERENCES_TROUBLESHOOTING.md` for more steps

### Want to Remove Environment Variables?

```powershell
[Environment]::SetEnvironmentVariable("JIRA_DOMAIN", $null, "User")
[Environment]::SetEnvironmentVariable("JIRA_EMAIL", $null, "User")
[Environment]::SetEnvironmentVariable("JIRA_API_TOKEN", $null, "User")
```

## Security Notes

### Are Environment Variables Secure?

✅ **Yes, for this use case:**
- Set at User level (not system-wide)
- Only accessible by your Windows user account
- Same security model as Raycast preferences
- Standard practice for development tools
- Not exposed to other users

### Best Practices

1. **Never commit** `.env` files to git
2. **Don't share** your environment variable values
3. **Rotate tokens** regularly
4. **Use User-level** variables (not System)

## Files Changed

### Modified
- `src/jira-api.ts` - Added environment variable fallback
- `package.json` - Removed configure command, added default values
- `README.md` - Added environment variables documentation

### Created
- `setup-credentials.ps1` - Setup script
- `PREFERENCES_TROUBLESHOOTING.md` - Troubleshooting guide
- `PREFERENCES_FIX_SUMMARY.md` - This summary

### Deleted
- `src/configure.tsx` - Workaround command
- `CONFIGURATION_WORKAROUND.md` - Workaround documentation

## Next Steps

1. **Run the setup script** to configure your credentials
2. **Restart Raycast** completely
3. **Test a command** (e.g., Review Tasks or Project Overview)
4. **Verify it works** - you should see your Jira data

## If Issues Persist

1. Check `PREFERENCES_TROUBLESHOOTING.md` for detailed steps
2. Verify environment variables are set correctly
3. Check Raycast logs for errors
4. Consider reporting to Raycast if it's a persistent bug

## Future

When Raycast for Windows fixes the preferences issue:
- ✅ Your environment variables will still work
- ✅ Or just use Raycast preferences
- ✅ No code changes needed
- ✅ Seamless transition

---

**Status:** ✅ Ready to use  
**Build:** Successful  
**Testing:** Run setup script and test commands  

## Quick Start

```powershell
# 1. Setup credentials
.\setup-credentials.ps1

# 2. Restart Raycast
# Close and reopen Raycast

# 3. Test
# Open Raycast → Type "Review Tasks" → Should work!
```

🎉 **Your Jira extension should now work properly!**

