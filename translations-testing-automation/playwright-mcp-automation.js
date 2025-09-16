const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:5173';
const CSV_FILE = 'sample_medtronic_workflow.csv';
const SCREENSHOTS_DIR = 'screenshots-trial2';

// Language mapping for the application
const LANGUAGE_MAP = {
  'Spanish': 'es',
  'French': 'fr', 
  'German': 'de',
  'English': 'en'
};

// Create screenshots directory if it doesn't exist
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Read and parse CSV file manually (without csv-parse dependency)
function parseCSV() {
  try {
    const csvContent = fs.readFileSync(CSV_FILE, 'utf-8');
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',');
    const records = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',');
        const record = {};
        headers.forEach((header, index) => {
          record[header] = values[index] ? values[index].trim() : '';
        });
        records.push(record);
      }
    }
    return records;
  } catch (error) {
    throw new Error(`Failed to read CSV file: ${error.message}`);
  }
}

// Generate screenshot filename
function generateFilename(row, index) {
  const page = row['Screen/Page'].toLowerCase().replace(/\s+/g, '_');
  const section = row['Section'].toLowerCase().replace(/\s+/g, '_');
  const language = row['Language'].toLowerCase();
  const timestamp = Date.now();
  return `${index + 1}_${page}_${section}_${language}_${timestamp}.png`;
}

function generateHighlightScript(section, targetString, misc) {
  return `
    (() => {
      console.log('Looking for "${targetString}" in section "${section}"');
      
      document.querySelectorAll('.devin-highlight').forEach(el => {
        el.classList.remove('devin-highlight');
        el.style.border = '';
        el.style.boxShadow = '';
        el.style.outline = '';
      });
      
      let targetElements = [];
      
      const allElements = document.querySelectorAll('*');
      for (let element of allElements) {
        if (element.children.length === 0) { // Only leaf nodes
          const text = element.textContent.trim();
          if (text === "${targetString}" || text.includes("${targetString}")) {
            targetElements.push(element);
          }
        }
      }
      
      if (targetElements.length === 0) {
        const interactiveElements = document.querySelectorAll('button, a, input, span, div, p, h1, h2, h3, h4, h5, h6');
        for (let element of interactiveElements) {
          const text = element.textContent.trim();
          if (text.toLowerCase().includes("${targetString.toLowerCase()}")) {
            targetElements.push(element);
          }
        }
      }
      
      if (targetElements.length === 0) {
        const elementsWithText = document.querySelectorAll('[title*="${targetString}"], [aria-label*="${targetString}"], [data-*="${targetString}"]');
        targetElements.push(...elementsWithText);
      }
      
      console.log('Found', targetElements.length, 'potential target elements');
      
      let highlightedCount = 0;
      targetElements.forEach((element, index) => {
        const misc = "${misc}";
        
        let elementToHighlight = element;
        
        if (misc.includes('button only') && element.tagName !== 'BUTTON') {
          const parentButton = element.closest('button');
          if (parentButton) {
            elementToHighlight = parentButton;
          }
        } else if (misc.includes('full text') || misc.includes('full section')) {
          const section = element.closest('section, div, article, main');
          if (section) {
            elementToHighlight = section;
          }
        } else if (misc.includes('all instances')) {
          elementToHighlight = element;
        } else if (misc.includes('tooltip')) {
          const tooltipTrigger = element.closest('[title], [data-tooltip], [aria-describedby]');
          if (tooltipTrigger) {
            elementToHighlight = tooltipTrigger;
          }
        }
        
        elementToHighlight.classList.add('devin-highlight');
        elementToHighlight.style.border = '3px solid #ff0000';
        elementToHighlight.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.5)';
        elementToHighlight.style.outline = '2px solid #ff0000';
        elementToHighlight.style.outlineOffset = '2px';
        
        highlightedCount++;
        console.log('Highlighted element', index + 1, ':', elementToHighlight.tagName, elementToHighlight.textContent.substring(0, 50));
      });
      
      return {
        success: highlightedCount > 0,
        targetString: "${targetString}",
        section: "${section}",
        misc: "${misc}",
        elementsFound: targetElements.length,
        elementsHighlighted: highlightedCount,
        elements: targetElements.map(el => ({
          tag: el.tagName,
          text: el.textContent.substring(0, 100),
          className: el.className
        }))
      };
    })();
  `;
}

module.exports = {
  parseCSV,
  generateFilename,
  generateHighlightScript,
  LANGUAGE_MAP,
  BASE_URL,
  SCREENSHOTS_DIR
};

console.log('Playwright MCP automation module loaded');
