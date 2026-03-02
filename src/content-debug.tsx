/**
 * Content script - Debug version for Shift+Hover translation
 */

console.log('🌐 AI Immersive Translate - Debug Mode Loading...');

// Check if we're on the right page
console.log('Current URL:', window.location.href);
console.log('Page title:', document.title);

// Test: Create a simple test overlay
function createTestOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'ai-translate-debug';
  overlay.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    font-family: Arial, sans-serif;
    font-size: 14px;
    z-index: 999999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    cursor: move;
  `;
  overlay.innerHTML = `
    <strong>🌐 AI Translate Debug</strong><br>
    Shift key: <span id="shift-status">❌ Not pressed</span><br>
    Hovered: <span id="hover-status">None</span>
  `;
  document.body.appendChild(overlay);
  console.log('✅ Debug overlay created');

  return overlay;
}

// Initialize
let debugOverlay = null;
let isShiftPressed = false;
let hoveredElement = null;

// Wait for page to load
function init() {
  console.log('🚀 Initializing...');

  // Wait for body
  if (!document.body) {
    console.log('⏳ Waiting for body...');
    setTimeout(init, 100);
    return;
  }

  console.log('✅ Body found, creating overlay...');
  debugOverlay = createTestOverlay();

  // Add event listeners
  setupEventListeners();

  console.log('✅ Initialization complete!');
  console.log('💡 Try hovering over text and pressing Shift key');
}

// Setup event listeners
function setupEventListeners() {
  // Track Shift key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Shift') {
      isShiftPressed = true;
      updateDebugOverlay();
      console.log('⌨️  Shift key pressed');

      // If hovering over element, try to translate
      if (hoveredElement) {
        console.log('🎯 Attempting to translate hovered element...');
        translateElement(hoveredElement);
      }
    }
  });

  document.addEventListener('keyup', (e) => {
    if (e.key === 'Shift') {
      isShiftPressed = false;
      updateDebugOverlay();
      console.log('⌨️  Shift key released');
    }
  });

  // Track mouse hover
  document.addEventListener('mouseover', (e) => {
    const target = e.target;
    const text = target.textContent?.trim();

    if (text && text.length > 5 && text.length < 1000) {
      hoveredElement = target;
      updateDebugOverlay(target);
      target.style.outline = '2px solid #667eea';
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.style) {
      e.target.style.outline = '';
    }
    if (e.target === hoveredElement) {
      hoveredElement = null;
      updateDebugOverlay();
    }
  });

  console.log('✅ Event listeners added');
}

// Update debug overlay
function updateDebugOverlay(element) {
  const shiftStatus = document.getElementById('shift-status');
  const hoverStatus = document.getElementById('hover-status');

  if (shiftStatus) {
    shiftStatus.textContent = isShiftPressed ? '✅ Pressed' : '❌ Not pressed';
  }

  if (hoverStatus) {
    if (element) {
      const text = element.textContent?.trim().substring(0, 50) || '';
      hoverStatus.textContent = `"${text}..."`;
    } else {
      hoverStatus.textContent = 'None';
    }
  }
}

// Translate element
async function translateElement(element) {
  console.log('🎯 translateElement called');
  console.log('Element:', element);
  console.log('Text:', element.textContent?.trim().substring(0, 100));

  // Get text
  const text = element.textContent?.trim();
  if (!text || text.length < 5) {
    console.log('❌ Text too short:', text?.length);
    return;
  }

  // Show loading
  showLoading(element);

  // Simulate translation (for testing)
  setTimeout(() => {
    hideLoading(element);
    showTranslation(element, `[这是测试翻译]\n原文: ${text.substring(0, 50)}...`);
    console.log('✅ Translation shown');
  }, 1000);
}

// Show loading
function showLoading(element) {
  element.style.backgroundColor = 'rgba(102, 126, 234, 0.2)';
  console.log('⏳ Showing loading...');
}

// Hide loading
function hideLoading(element) {
  element.style.backgroundColor = '';
  console.log('✅ Loading hidden');
}

// Show translation
function showTranslation(element, translation) {
  // Remove existing translation
  const existing = element.nextElementSibling;
  if (existing && existing.classList.contains('ai-translation-result')) {
    existing.remove();
  }

  // Create translation container
  const div = document.createElement('div');
  div.className = 'ai-translation-result';
  div.style.cssText = `
    margin: 10px 0;
    padding: 15px;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    border-left: 4px solid #667eea;
    border-radius: 4px;
    font-family: Arial, sans-serif;
    animation: slideIn 0.3s ease;
  `;
  div.textContent = translation;

  // Insert after element
  if (element.parentNode) {
    element.parentNode.insertBefore(div, element.nextSibling);
  }

  console.log('✅ Translation displayed');
}

// Start
console.log('⏳ Waiting for DOM ready...');
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Add animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);

console.log('🌐 Debug script loaded successfully');
console.log('📝 Instructions:');
console.log('   1. Wait for the purple debug box to appear (top-right)');
console.log('   2. Hover over any text');
console.log('   3. Press Shift key');
console.log('   4. Check console for debug messages');
