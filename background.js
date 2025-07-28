/**
 * Background Service Worker for SSH to HTTPS Converter
 * Handles omnibox functionality for converting SSH URLs to HTTPS
 */

// Global state
let isEnabled = true;

// Initialize extension state
async function initializeExtension() {
  try {
    const result = await chrome.storage.sync.get(['enabled']);
    isEnabled = result.enabled !== false;
    updateBadge(isEnabled);
    updateOmniboxState(isEnabled);
  } catch (error) {
    console.error('SSH Converter: Error loading settings:', error);
    isEnabled = true;
    updateBadge(isEnabled);
    updateOmniboxState(isEnabled);
  }
}

// Set up extension on install
chrome.runtime.onInstalled.addListener(async (details) => {
  // Set default settings if not exist
  const result = await chrome.storage.sync.get(['enabled']);
  if (result.enabled === undefined) {
    await chrome.storage.sync.set({ enabled: true });
  }
  
  await initializeExtension();
  
  // Show welcome notification for new installs
  if (details.reason === 'install' && chrome.notifications?.create) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'SSH to HTTPS Converter',
      message: 'Extension installed! Use "ssh" keyword in address bar to convert SSH URLs.'
    });
  }
});

// Initialize on startup
chrome.runtime.onStartup.addListener(initializeExtension);
initializeExtension();

/**
 * Update conversion statistics
 */
function updateConversionStats() {
  const today = new Date().toDateString();
  
  chrome.storage.local.get(['conversionsToday', 'totalConversions', 'lastResetDate'], (result) => {
    let todayCount = result.conversionsToday || 0;
    let totalCount = result.totalConversions || 0;
    const lastReset = result.lastResetDate;
    
    // Reset daily count if it's a new day
    if (lastReset !== today) {
      todayCount = 0;
    }
    
    todayCount++;
    totalCount++;
    
    chrome.storage.local.set({
      conversionsToday: todayCount,
      totalConversions: totalCount,
      lastResetDate: today
    });
  });
}

/**
 * Update omnibox state based on enabled status
 */
function updateOmniboxState(enabled) {
  if (enabled) {
    chrome.omnibox.setDefaultSuggestion({
      description: 'SSH to HTTPS Converter - Type SSH URL to convert (e.g., git@github.com:user/repo.git)'
    });
  } else {
    chrome.omnibox.setDefaultSuggestion({
      description: 'SSH Converter DISABLED - Click extension icon to enable'
    });
  }
}

/**
 * Update extension badge based on enabled state
 */
function updateBadge(enabled) {
  if (enabled) {
    chrome.action.setBadgeText({ text: '' });
    chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
  } else {
    chrome.action.setBadgeText({ text: 'OFF' });
    chrome.action.setBadgeBackgroundColor({ color: '#f44336' });
  }
}

// Omnibox functionality
chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  const suggestions = [];
  
  if (!isEnabled) {
    suggestions.push({
      content: 'https://github.com',
      description: 'SSH Converter is DISABLED - Enable in popup to convert SSH URLs'
    });
    suggest(suggestions);
    return;
  }
  
  if (text.trim()) {
    const httpsUrl = convertSSHToHTTPS(text.trim());
    
    if (httpsUrl) {
      suggestions.push({
        content: httpsUrl,
        description: `Convert SSH to HTTPS: <match>${httpsUrl}</match>`
      });
    } else if (text.includes('@') && text.includes(':')) {
      suggestions.push({
        content: `https://github.com/search?q=${encodeURIComponent(text)}`,
        description: `Not a valid SSH URL - searching GitHub: <dim>${text}</dim>`
      });
    } else {
      suggestions.push({
        content: `https://github.com/search?q=${encodeURIComponent(text)}`,
        description: `Search GitHub for: <dim>${text}</dim>`
      });
    }
  } else {
    suggestions.push({
      content: 'https://github.com',
      description: 'SSH to HTTPS Converter - Type SSH URL to convert'
    });
  }
  
  suggest(suggestions);
});

chrome.omnibox.onInputEntered.addListener((text, disposition) => {
  let targetUrl;
  
  if (!isEnabled) {
    targetUrl = 'https://github.com';
  } else {
    const httpsUrl = convertSSHToHTTPS(text.trim());
    
    if (httpsUrl) {
      targetUrl = httpsUrl;
      updateConversionStats();
    } else {
      targetUrl = `https://github.com/search?q=${encodeURIComponent(text)}`;
    }
  }
  
  // Navigate to the URL
  if (disposition === 'currentTab') {
    chrome.tabs.update({ url: targetUrl });
  } else {
    chrome.tabs.create({ url: targetUrl });
  }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'getSettings':
      chrome.storage.sync.get(['enabled'], (result) => {
        sendResponse({ enabled: result.enabled !== false });
      });
      return true;
      
    case 'updateSettings':
      chrome.storage.sync.set(request.settings, () => {
        sendResponse({ success: true });
        
        if (request.settings.enabled !== undefined) {
          isEnabled = request.settings.enabled;
          updateBadge(isEnabled);
          updateOmniboxState(isEnabled);
        }
      });
      return true;
      
    case 'testConversion':
      const testResult = testURLConversion(request.testUrl);
      sendResponse(testResult);
      break;
      
    default:
      sendResponse({ error: 'Unknown action' });
  }
});

/**
 * Convert SSH URL to HTTPS URL
 * Works with any hostname - no configuration needed
 */
function convertSSHToHTTPS(sshUrl) {
  if (!sshUrl || typeof sshUrl !== 'string') return null;
  
  const trimmedUrl = sshUrl.trim();
  
  // Standard SSH format: git@hostname:username/repo.git
  const standardMatch = trimmedUrl.match(/^git@([^:]+):([^\/]+\/[^\/]+?)(?:\.git)?$/);
  if (standardMatch) {
    const hostname = standardMatch[1];
    const path = standardMatch[2];
    
    // Special handling for Azure DevOps
    if (hostname.includes('vs-ssh.visualstudio.com')) {
      return `https://dev.azure.com/${path}`;
    }
    
    return `https://${hostname}/${path}`;
  }
  
  // SSH with protocol: ssh://git@hostname:port/username/repo.git
  const protocolMatch = trimmedUrl.match(/^ssh:\/\/git@([^:\/]+)(?::(\d+))?\/(.+?)(?:\.git)?$/);
  if (protocolMatch) {
    const hostname = protocolMatch[1];
    const path = protocolMatch[3];
    
    // Special handling for Azure DevOps
    if (hostname.includes('ssh.dev.azure.com')) {
      const cleanPath = path.replace(/^v3\//, '');
      return `https://dev.azure.com/${cleanPath}`;
    }
    
    return `https://${hostname}/${path}`;
  }
  
  return null;
}

/**
 * Test URL conversion for popup interface
 */
function testURLConversion(testUrl) {
  const httpsUrl = convertSSHToHTTPS(testUrl);
  return {
    isSSH: httpsUrl !== null,
    originalUrl: testUrl,
    convertedUrl: httpsUrl,
    success: httpsUrl !== null
  };
}

// Handle storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.enabled) {
    isEnabled = changes.enabled.newValue;
    updateBadge(isEnabled);
    updateOmniboxState(isEnabled);
  }
});
