# Preferences Troubleshooting Guide

## Issue: Preferences Not Persisting

If your extension preferences (Jira Domain, Email, API Token) are not being saved and appear blank every time you reopen the configuration page, this is likely a **Raycast for Windows** issue.

## What We've Done

1. ✅ Removed the "Configure Extension" workaround command
2. ✅ Added default values to all preference fields
3. ✅ Verified preference definitions are correct
4. ✅ Extension validates successfully

## Potential Causes

### 1. Raycast for Windows Beta Issues
Raycast for Windows is currently in beta and may have issues with preference persistence. This is a known limitation.

### 2. File Permissions
The preferences file may not have write permissions on your system.

### 3. OneDrive Sync Conflicts
Since your project is in OneDrive, there may be file sync conflicts preventing writes.

## Troubleshooting Steps

### Step 1: Check Raycast Version
```powershell
# Open Raycast Settings
# Check: Settings → About → Version
# Ensure you have the latest Raycast for Windows version
```

### Step 2: Find Raycast Preferences Location

Raycast for Windows typically stores preferences in:
```
%APPDATA%\Raycast\
or
%LOCALAPPDATA%\Raycast\
```

Look for a file related to:
- `extensions/jira-for-windows/preferences.json`
- `com.raycast.macos.plist` (or similar)

### Step 3: Check File Permissions

1. Navigate to the Raycast folder
2. Right-click on the folder → Properties → Security
3. Ensure your user account has "Full Control"
4. If not, click Edit → Add → Enter your username → Check "Full Control"

### Step 4: Temporarily Disable OneDrive Sync

Since the extension is in a OneDrive folder:

1. Right-click OneDrive icon in system tray
2. Settings → Account → Choose folders
3. Temporarily pause sync
4. Try setting preferences again
5. Re-enable sync

### Step 5: Rebuild Extension from Scratch

```powershell
cd "c:\Users\owen.price\OneDrive - Modulr Finance\4. Code\jira"

# Clean install
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install

# Rebuild
npm run build
```

### Step 6: Install Extension Manually

Instead of running in dev mode:

```powershell
# Build the extension
npm run build

# In Raycast:
# 1. Open Raycast Settings
# 2. Go to Extensions
# 3. Click "+" → "Add Extension"
# 4. Browse to the built extension folder
```

### Step 7: Use Environment Variables (Temporary Workaround)

If preferences still won't save, you can use environment variables as a temporary solution:

1. **Set Environment Variables:**
```powershell
# Open PowerShell as Administrator
[Environment]::SetEnvironmentVariable("JIRA_DOMAIN", "yourcompany.atlassian.net", "User")
[Environment]::SetEnvironmentVariable("JIRA_EMAIL", "your.email@company.com", "User")
[Environment]::SetEnvironmentVariable("JIRA_API_TOKEN", "your-api-token-here", "User")
[Environment]::SetEnvironmentVariable("JIRA_DEFAULT_PROJECT", "PROJ", "User")

# Restart your terminal/Raycast
```

2. **Modify the extension to use environment variables:**

I can modify `src/jira-api.ts` to fall back to environment variables if preferences are empty. Would you like me to implement this fallback?

### Step 8: Check Raycast Logs

1. Open Raycast
2. Type: "View Extension Logs"
3. Look for any errors related to preferences
4. Check for permission denied errors

### Step 9: Try a Different Location

Move the extension folder outside of OneDrive:

```powershell
# Copy to a local folder
Copy-Item -Recurse "c:\Users\owen.price\OneDrive - Modulr Finance\4. Code\jira" "C:\Dev\jira"
cd "C:\Dev\jira"
npm install
npm run dev
```

### Step 10: Manual Preferences File Creation

If Raycast creates a preferences file, you can try editing it directly:

1. Find the file (see Step 2)
2. Create/edit with this structure:
```json
{
  "jiraDomain": "yourcompany.atlassian.net",
  "email": "your.email@company.com",
  "apiToken": "your-api-token-here",
  "defaultProject": "PROJ"
}
```
3. Save and restart Raycast

## Alternative Solution: Environment Variables Fallback

I can add code to automatically fall back to environment variables when preferences are empty. This would work as follows:

### Implementation

**Modified `jira-api.ts`:**
```typescript
constructor() {
  const preferences = getPreferenceValues<Preferences>();
  
  // Fallback to environment variables if preferences are empty
  this.domain = (preferences.jiraDomain || process.env.JIRA_DOMAIN || "").replace(/^https?:\/\//, "").replace(/\/$/, "");
  const email = preferences.email || process.env.JIRA_EMAIL || "";
  const apiToken = preferences.apiToken || process.env.JIRA_API_TOKEN || "";
  
  if (!this.domain || !email || !apiToken) {
    throw new Error("Jira credentials not configured. Set preferences or environment variables.");
  }
  
  const auth = Buffer.from(`${email}:${apiToken}`).toString("base64");
  this.authHeader = `Basic ${auth}`;
}
```

**Advantages:**
- ✅ Works around Raycast Windows preferences issue
- ✅ Secure (environment variables are user-specific)
- ✅ No UI workaround needed
- ✅ Falls back gracefully
- ✅ Standard practice for development

**Would you like me to implement this?**

## Report to Raycast

If none of the above works, this is likely a Raycast for Windows bug. Please report it:

1. **GitHub Issues:**
   https://github.com/raycast/extensions/issues

2. **Include:**
   - Raycast version
   - Windows version
   - Extension name: "Jira for Windows"
   - Description: "Extension preferences not persisting - values are not saved and appear blank when reopening configuration page"
   - Steps to reproduce
   - Mention that paste works but values don't persist

## Current Status

- ✅ Extension configuration is valid
- ✅ Preferences are correctly defined
- ✅ No code errors
- ❌ Raycast for Windows may not be saving preferences correctly

## Next Steps

1. Try the troubleshooting steps above
2. Let me know if you'd like me to implement the environment variables fallback
3. Consider reporting the issue to Raycast if none of the solutions work

## Questions?

Let me know:
- Which troubleshooting steps you've tried
- Any error messages you see in Raycast logs
- Whether you'd like the environment variables fallback implemented
- If you can access the Raycast preferences file location

