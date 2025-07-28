/**
 * Popup JavaScript for SSH to HTTPS Converter
 * Handles settings interface and URL testing
 */

document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const enabledToggle = document.getElementById('enabledToggle');
  const statusIndicator = document.getElementById('statusIndicator');
  const statusText = document.getElementById('statusText');
  const testInput = document.getElementById('testInput');
  const testButton = document.getElementById('testButton');
  const testResult = document.getElementById('testResult');
  const conversionsCount = document.getElementById('conversionsCount');
  const totalConversions = document.getElementById('totalConversions');
  const helpLink = document.getElementById('helpLink');
  const feedbackLink = document.getElementById('feedbackLink');

  // Initialize popup
  loadSettings();
  loadStatistics();

  /**
   * Load settings from Chrome storage
   */
  function loadSettings() {
    chrome.storage.sync.get(['enabled'], (result) => {
      const enabled = result.enabled !== false;
      enabledToggle.checked = enabled;
      updateStatus(enabled);
    });
  }

  /**
   * Load statistics from Chrome storage
   */
  function loadStatistics() {
    chrome.storage.local.get(['conversionsToday', 'totalConversions', 'lastResetDate'], (result) => {
      const today = new Date().toDateString();
      const lastReset = result.lastResetDate;
      
      // Reset daily count if it's a new day
      let todayCount = result.conversionsToday || 0;
      if (lastReset !== today) {
        todayCount = 0;
        chrome.storage.local.set({
          conversionsToday: 0,
          lastResetDate: today
        });
      }
      
      conversionsCount.textContent = todayCount;
      totalConversions.textContent = result.totalConversions || 0;
    });
  }

  /**
   * Update status indicator and text
   */
  function updateStatus(enabled) {
    if (enabled) {
      statusIndicator.classList.remove('disabled');
      statusText.textContent = 'Enabled';
    } else {
      statusIndicator.classList.add('disabled');
      statusText.textContent = 'Disabled';
    }
  }

  /**
   * Save settings to Chrome storage
   */
  function saveSettings(settings) {
    chrome.storage.sync.set(settings, () => {
      if (chrome.runtime.lastError) {
        console.error('Error saving settings:', chrome.runtime.lastError);
      }
    });
  }

  /**
   * Test URL conversion
   */
  function testConversion(url) {
    if (!url.trim()) {
      showTestResult('Please enter a URL to test', 'error');
      return;
    }

    chrome.runtime.sendMessage({
      action: 'testConversion',
      testUrl: url.trim()
    }, (response) => {
      if (response.success && response.convertedUrl) {
        showTestResult(`✓ Converted: ${response.convertedUrl}`, 'success');
      } else if (response.isSSH === false) {
        showTestResult('This is not a valid SSH URL', 'error');
      } else {
        showTestResult('Unable to convert this URL', 'error');
      }
    });
  }

  /**
   * Show test result
   */
  function showTestResult(message, type) {
    testResult.textContent = message;
    testResult.className = `test-result ${type}`;
    testResult.classList.remove('hidden');
    
    // Hide after 5 seconds
    setTimeout(() => {
      testResult.classList.add('hidden');
    }, 5000);
  }

  // Event listeners
  enabledToggle.addEventListener('change', function() {
    const enabled = this.checked;
    saveSettings({ enabled });
    updateStatus(enabled);
  });

  testButton.addEventListener('click', function() {
    testConversion(testInput.value);
  });

  testInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      testConversion(this.value);
    }
  });

  // Auto-test as user types (debounced)
  let testTimeout;
  testInput.addEventListener('input', function() {
    clearTimeout(testTimeout);
    const value = this.value.trim();
    
    if (value) {
      testTimeout = setTimeout(() => {
        testConversion(value);
      }, 1000);
    } else {
      testResult.classList.add('hidden');
    }
  });

  // Help and feedback links
  helpLink.addEventListener('click', function(e) {
    e.preventDefault();
    chrome.tabs.create({
      url: 'https://github.com/NoSugarCoffee/chrome-ssh-converter#readme'
    });
  });

  feedbackLink.addEventListener('click', function(e) {
    e.preventDefault();
    chrome.tabs.create({
      url: 'https://github.com/NoSugarCoffee/chrome-ssh-converter/issues'
    });
  });

  // Listen for storage changes to update UI
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && changes.enabled) {
      enabledToggle.checked = changes.enabled.newValue;
      updateStatus(changes.enabled.newValue);
    }
    
    if (namespace === 'local') {
      if (changes.conversionsToday) {
        conversionsCount.textContent = changes.conversionsToday.newValue || 0;
      }
      if (changes.totalConversions) {
        totalConversions.textContent = changes.totalConversions.newValue || 0;
      }
    }
  });
});
