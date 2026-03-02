/**
 * Minimal debug version - v0.0.3
 */

// This should be the FIRST thing that runs
console.log('='.repeat(50));
console.log('🌐 AI TRANSLATE - DEBUG VERSION v0.0.3');
console.log('='.repeat(50));
console.log('Current URL:', window.location.href);
console.log('Document ready state:', document.readyState);
console.log('Has body:', !!document.body);

// Test 1: Check if we can access DOM
try {
  const testDiv = document.createElement('div');
  testDiv.id = 'ai-translate-test';
  testDiv.style.cssText = `
    position: fixed;
    top: 50px;
    right: 50px;
    background: red;
    color: white;
    padding: 20px;
    z-index: 999999;
    font-size: 20px;
    font-weight: bold;
  `;
  testDiv.textContent = '🌐 AI Translate v0.0.3 - LOADED!';

  // Wait for body
  function addToBody() {
    if (document.body) {
      document.body.appendChild(testDiv);
      console.log('✅ Test element added to body!');

      // Make it clickable to remove
      testDiv.onclick = () => {
        testDiv.remove();
        console.log('✅ Test element removed');
      };
    } else {
      console.log('⏳ Waiting for body...');
      setTimeout(addToBody, 100);
    }
  }

  addToBody();

} catch (error) {
  console.error('❌ Error creating test element:', error);
}

// Test 2: Check event listeners
console.log('Testing event listeners...');

let shiftPressed = false;
let hoveredElement = null;

document.addEventListener('keydown', (e) => {
  if (e.key === 'Shift' && !shiftPressed) {
    shiftPressed = true;
    console.log('⌨️ SHIFT PRESSED!');

    const testDiv = document.getElementById('ai-translate-test');
    if (testDiv) {
      testDiv.style.background = 'green';
      testDiv.textContent = '✅ SHIFT PRESSED!';
    }
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'Shift') {
    shiftPressed = false;
    console.log('⌨️ Shift released');

    const testDiv = document.getElementById('ai-translate-test');
    if (testDiv) {
      testDiv.style.background = 'red';
      testDiv.textContent = '🌐 AI Translate v0.0.3 - LOADED!';
    }
  }
});

document.addEventListener('mouseover', (e) => {
  const target = e.target;
  const text = target.textContent?.trim();

  if (text && text.length > 5) {
    hoveredElement = target;
    console.log('🎯 Hovering over:', text.substring(0, 30) + '...');

    // Highlight
    target.style.outline = '3px solid blue';
  }
});

document.addEventListener('mouseout', (e) => {
  const target = e.target;
  target.style.outline = '';
  if (target === hoveredElement) {
    hoveredElement = null;
  }
});

console.log('✅ All event listeners registered');
console.log('='.repeat(50));
console.log('INSTRUCTIONS:');
console.log('1. You should see a RED box on the page');
console.log('2. Hover over text - should see BLUE outline');
console.log('3. Press SHIFT - box should turn GREEN');
console.log('4. Click the box to remove it');
console.log('='.repeat(50));
