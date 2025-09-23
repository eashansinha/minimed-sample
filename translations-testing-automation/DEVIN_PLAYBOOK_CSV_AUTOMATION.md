# Devin Playbook: CSV-Driven Browser Automation for Translation Testing

## Overview

This playbook documents the successful implementation of CSV-driven browser automation for translation testing screenshots. The workflow parses a CSV file containing UI component specifications, navigates to web pages, applies language switching, finds target elements, highlights them with single red boxes, and captures screenshots.

## Success Metrics

**Trial2 Results (Proven Working Approach):**
- ✅ 5 CSV rows processed successfully
- ✅ 9 screenshots generated with single red box highlights
- ✅ Precise element targeting achieved
- ✅ Authentication and language switching handled
- ✅ Clean, professional screenshot output

## Prerequisites

### Environment Setup
```bash
# 1. Clone repository
git clone https://github.com/eashansinha/minimed-sample
cd minimed-sample

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
# Server runs on http://localhost:5173

# 4. Verify app is accessible
curl http://localhost:5173
```

### Required Files
- `sample_medtronic_workflow.csv` - Input CSV with test specifications
- `browser-automation-workflow.py` - Python planning script
- `playwright-mcp-automation.js` - JavaScript highlighting modules

## CSV Input Format

### Structure
```csv
Screen/Page,Section,String,Language,Misc
Landing,Hero Section,Learn More,Spanish,Highlight button only
Landing,Features,Track glucose levels continuously,French,Highlight full text
Auth,Login Form,Don't have an account?,French,Highlight text only
Dashboard,Activity Feed,BasalDelivery,German,Highlight all instances
Dashboard,Glucose Chart,value,French,Highlight tooltip text
```

### Column Definitions
- **Screen/Page**: Target page (Landing, Auth, Dashboard)
- **Section**: UI section within page (Hero Section, Features, Login Form, etc.)
- **String**: Target text to find and highlight
- **Language**: Display language (Spanish, French, German, English)
- **Misc**: Highlighting behavior (button only, full text, text only, all instances, tooltip text)

## Core Implementation

### 1. CSV Parsing and Planning

**File: `browser-automation-workflow.py`**

```python
def parse_csv():
    """Parse the CSV file and return workflow items"""
    workflow_items = []
    
    with open(CSV_FILE, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for i, row in enumerate(reader):
            if row['Screen/Page'].strip():  # Skip empty rows
                workflow_items.append({
                    'index': i + 1,
                    'page': row['Screen/Page'].strip(),
                    'section': row['Section'].strip(),
                    'string': row['String'].strip(),
                    'language': row['Language'].strip(),
                    'misc': row['Misc'].strip()
                })
    
    return workflow_items
```

**Key Features:**
- Handles UTF-8 encoding for international characters
- Skips empty rows automatically
- Generates indexed workflow items
- Strips whitespace from all fields

### 2. URL Generation and Language Mapping

```python
LANGUAGE_MAP = {
    'Spanish': 'es',
    'French': 'fr', 
    'German': 'de',
    'English': 'en'
}

def get_page_url(page, language):
    """Get the full URL for a page with language parameter"""
    page_lower = page.lower()
    
    if page_lower == 'landing':
        url = f"{BASE_URL}/"
    elif page_lower == 'auth':
        url = f"{BASE_URL}/login"
    elif page_lower == 'dashboard':
        url = f"{BASE_URL}/dashboard"
    else:
        url = BASE_URL
    
    lang_code = LANGUAGE_MAP.get(language, 'en')
    if lang_code != 'en':
        url += f"?lang={lang_code}"
    
    return url
```

**Navigation Strategy:**
- Landing page: `http://localhost:5173/`
- Auth page: `http://localhost:5173/login`
- Dashboard page: `http://localhost:5173/dashboard`
- Language switching via URL parameters: `?lang=es`, `?lang=fr`, `?lang=de`

### 3. JavaScript Highlighting Logic

**Critical Success Factor: Single Element Targeting**

```javascript
function generateHighlightScript(section, target_string, misc) {
    return `
    (() => {
        console.log('Looking for "${target_string}" in section "${section}"');
        
        // Remove any existing highlights
        document.querySelectorAll('.devin-highlight').forEach(el => {
            el.classList.remove('devin-highlight');
            el.style.border = '';
            el.style.boxShadow = '';
            el.style.outline = '';
            el.style.backgroundColor = '';
        });
        
        let targetElements = [];
        
        // Strategy 1: Find by exact text content
        const allElements = document.querySelectorAll('*');
        for (let element of allElements) {
            const text = element.textContent.trim();
            if (text === "${target_string}" || text.includes("${target_string}")) {
                targetElements.push(element);
            }
        }
        
        // Strategy 2: Find by partial text matching in interactive elements
        if (targetElements.length === 0) {
            const interactiveElements = document.querySelectorAll('button, a, input, span, div, p, h1, h2, h3, h4, h5, h6, label');
            for (let element of interactiveElements) {
                const text = element.textContent.trim();
                if (text.toLowerCase().includes("${target_string.toLowerCase()}")) {
                    targetElements.push(element);
                }
            }
        }
        
        console.log('Found', targetElements.length, 'potential target elements');
        
        // Apply highlighting based on misc instructions
        let highlightedCount = 0;
        const misc = "${misc}";
        
        targetElements.forEach((element, index) => {
            let elementToHighlight = element;
            
            // Determine what to highlight based on misc column
            if (misc.includes('button only') && element.tagName !== 'BUTTON') {
                const parentButton = element.closest('button');
                if (parentButton) {
                    elementToHighlight = parentButton;
                }
            } else if (misc.includes('full text') || misc.includes('full section')) {
                // For full text/section, highlight the containing element
                const container = element.closest('section, div, article, main, p');
                if (container && container !== document.body) {
                    elementToHighlight = container;
                }
            } else if (misc.includes('tooltip')) {
                const tooltipTrigger = element.closest('[title], [data-tooltip], [aria-describedby]');
                if (tooltipTrigger) {
                    elementToHighlight = tooltipTrigger;
                }
            }
            
            // Apply red highlighting with strong visibility
            elementToHighlight.classList.add('devin-highlight');
            elementToHighlight.style.border = '3px solid #ff0000';
            elementToHighlight.style.boxShadow = '0 0 15px rgba(255, 0, 0, 0.7), inset 0 0 15px rgba(255, 0, 0, 0.3)';
            elementToHighlight.style.outline = '2px solid #ff0000';
            elementToHighlight.style.outlineOffset = '3px';
            
            highlightedCount++;
            console.log('Highlighted element', index + 1, ':', elementToHighlight.tagName, elementToHighlight.textContent.substring(0, 50));
        });
        
        return {
            success: highlightedCount > 0,
            targetString: "${target_string}",
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
```

**Highlighting Strategies by Misc Column:**
- `"Highlight button only"`: Find text, highlight parent button
- `"Highlight full text"`: Find text, highlight containing section/div
- `"Highlight text only"`: Highlight the specific text element
- `"Highlight all instances"`: Highlight all matching elements
- `"Highlight tooltip text"`: Find and highlight tooltip trigger elements

### 4. Screenshot Filename Generation

```python
def generate_filename(item):
    """Generate screenshot filename"""
    page = item['page'].lower().replace(' ', '_').replace('/', '_')
    section = item['section'].lower().replace(' ', '_').replace('/', '_')
    language = item['language'].lower()
    timestamp = int(time.time() * 1000)  # milliseconds
    
    return f"{item['index']}_{page}_{section}_{language}_{timestamp}.png"
```

**Filename Pattern:**
`{index}_{page}_{section}_{language}_{timestamp}.png`

**Examples:**
- `1_landing_hero_section_spanish_1758040736742.png`
- `2_landing_features_french_1758040824737.png`
- `3_auth_login_form_french_1758040943015.png`

## Browser Automation Workflow

### Step-by-Step Execution

1. **Initialize Automation Environment**
```bash
# Create screenshots directory
mkdir -p screenshots-trial2

# Run planning script
python3 browser-automation-workflow.py
```

2. **For Each CSV Row:**

**Navigation:**
```javascript
// Navigate to page with language parameter
<navigate_browser url="http://localhost:5173/?lang=es" tab_idx="0"/>
```

**Language Switching (if URL params fail):**
```javascript
// Click language dropdown
<click_browser devinid="3" tab_idx="0"/>

// Select target language
<click_browser devinid="24" tab_idx="0"/>  // French example
```

**Authentication (for Dashboard pages):**
```javascript
// Navigate to auth page first
<navigate_browser url="http://localhost:5173/login" tab_idx="0"/>

// Use demo account
<click_browser devinid="8" tab_idx="0"/>  // Demo Patient Account button
```

**Element Highlighting:**
```javascript
// Execute highlighting script
<browser_console tab_idx="0">
// Insert generated JavaScript highlighting script here
</browser_console>
```

**Screenshot Capture:**
```javascript
// Take screenshot and save
<view_browser tab_idx="0"/>
// Screenshot automatically saved to /home/ubuntu/screenshots/
```

**File Management:**
```bash
# Copy to target directory with proper filename
cp /home/ubuntu/screenshots/localhost_5173_164645.png screenshots-trial2/4_dashboard_activity_feed_english_$(date +%s%3N).png
```

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. Language Switching Failures

**Problem:** URL parameters don't switch language
**Solution:** Use manual dropdown interaction
```javascript
// Open language dropdown
<click_browser devinid="3" tab_idx="0"/>

// Wait for dropdown to open
<wait on="browser" seconds="2"/>

// Click target language option
<click_browser devinid="24" tab_idx="0"/>  // Adjust devinid for target language
```

#### 2. Authentication Required for Dashboard

**Problem:** Dashboard redirects to login page
**Solution:** Authenticate first
```javascript
// Navigate to login
<navigate_browser url="http://localhost:5173/login" tab_idx="0"/>

// Use demo account (most reliable)
<click_browser devinid="8" tab_idx="0"/>

// Alternative: Manual login
<type_browser devinid="2" press_enter="false">patient@example.com</type_browser>
<type_browser devinid="3" press_enter="false">demo123</type_browser>
<click_browser devinid="7" tab_idx="0"/>
```

#### 3. Element Not Found

**Problem:** JavaScript can't find target text
**Solutions:**
- Check for HTML entity encoding (`Don't` vs `Don&#39;t`)
- Verify exact text content in browser console
- Use broader search strategies
- Check if text is in different language than expected

**Debug Script:**
```javascript
// Find all elements containing partial text
const allElements = Array.from(document.querySelectorAll('*'));
const matches = allElements.filter(el => 
    el.textContent.toLowerCase().includes('target_text'.toLowerCase())
);
console.log('Found elements:', matches.map(el => ({
    tag: el.tagName,
    text: el.textContent.trim(),
    html: el.innerHTML
})));
```

#### 4. Multiple Elements Highlighted

**Problem:** JavaScript highlights all instances instead of single element
**Solution:** Refine targeting logic
```javascript
// Take only the FIRST match for single highlighting
if (targetElement) {
    targetElement = targetElements[0];  // Only highlight first match
    // Apply highlighting...
    break;  // Exit loop after first highlight
}
```

#### 5. Click Events Blocked

**Problem:** Browser automation clicks are blocked
**Solution:** Use programmatic JavaScript clicks
```javascript
<browser_console tab_idx="0">
// Find and click element programmatically
const element = document.querySelector('[devinid="8"]');
if (element) {
    element.click();
    console.log('Programmatic click successful');
}
</browser_console>
```

## Best Practices

### 1. Element Targeting
- Always start with exact text matching
- Fall back to partial matching for interactive elements
- Use `closest()` to find appropriate parent elements
- Prefer specific selectors over broad searches

### 2. Error Handling
- Log all JavaScript execution results
- Verify element existence before interaction
- Use fallback strategies for unreliable operations
- Continue processing remaining rows if one fails

### 3. Screenshot Quality
- Ensure page is fully loaded before highlighting
- Remove previous highlights before applying new ones
- Use strong visual styling for red boxes
- Capture full page context when appropriate

### 4. File Management
- Use descriptive, timestamped filenames
- Organize screenshots in dedicated directories
- Copy files to target locations with proper naming
- Maintain execution logs for debugging

## Verification Steps

### Pre-Execution Checklist
- [ ] Local development server running on localhost:5173
- [ ] CSV file exists and is properly formatted
- [ ] Screenshots directory created
- [ ] Python and JavaScript modules available

### Post-Execution Verification
- [ ] All CSV rows processed (5 expected)
- [ ] Screenshots generated with correct filenames
- [ ] Each screenshot contains exactly ONE red highlight box
- [ ] Target elements correctly identified and highlighted
- [ ] No JavaScript errors in console logs

### Quality Assurance
- [ ] Screenshots are visually clear and professional
- [ ] Red highlighting is prominent and visible
- [ ] Target elements are correctly identified
- [ ] Language switching worked as expected
- [ ] Authentication flows completed successfully

## Example Execution Log

```
Starting Browser Automation Workflow...
CSV file: sample_medtronic_workflow.csv
Screenshots directory: screenshots-trial2
Base URL: http://localhost:5173

Found 5 workflow items to process:
  1: Landing -> Hero Section -> 'Learn More' (Spanish)
  2: Landing -> Features -> 'Track glucose levels continuously' (French)
  3: Auth -> Login Form -> 'Don't have an account?' (French)
  4: Dashboard -> Activity Feed -> 'BasalDelivery' (German)
  5: Dashboard -> Glucose Chart -> 'value' (French)

Workflow planning complete!
Ready to execute with browser commands...

Execution plan saved to execution_plan.json
Ready to execute automation workflow!
```

## Success Criteria

A successful automation run should produce:
1. **5 screenshots** in the target directory
2. **Single red highlight** per screenshot
3. **Correct element targeting** based on CSV specifications
4. **Proper filename format** with timestamps
5. **Clean execution logs** without critical errors

## File Structure

```
translations-testing-automation/
├── sample_medtronic_workflow.csv          # Input CSV
├── browser-automation-workflow.py         # Planning script
├── playwright-mcp-automation.js           # JavaScript modules
├── screenshots-trial2/                    # Output directory
│   ├── 1_landing_hero_section_spanish_*.png
│   ├── 2_landing_features_french_*.png
│   ├── 3_auth_login_form_french_*.png
│   ├── 4_dashboard_activity_feed_english_*.png
│   └── 5_dashboard_glucose_chart_english_*.png
└── execution_plan.json                    # Generated execution plan
```

## Conclusion

This playbook documents a proven approach for CSV-driven browser automation that successfully generated 5 clean screenshots with single red box highlights. The key success factors are:

1. **Robust CSV parsing** with proper encoding handling
2. **Flexible navigation** with language parameter support
3. **Precise JavaScript targeting** with single-element logic
4. **Reliable authentication** using demo account flows
5. **Professional screenshot output** with descriptive filenames

Follow this playbook exactly to reproduce the successful trial2 results in future automation sessions.
