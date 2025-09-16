#!/usr/bin/env python3

import csv
import json
import time
from datetime import datetime

BASE_URL = 'http://localhost:5173'
CSV_FILE = 'sample_medtronic_workflow.csv'
SCREENSHOTS_DIR = 'screenshots-trial2'

LANGUAGE_MAP = {
    'Spanish': 'es',
    'French': 'fr', 
    'German': 'de',
    'English': 'en'
}

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

def generate_filename(item):
    """Generate screenshot filename"""
    page = item['page'].lower().replace(' ', '_').replace('/', '_')
    section = item['section'].lower().replace(' ', '_').replace('/', '_')
    language = item['language'].lower()
    timestamp = int(time.time() * 1000)  # milliseconds
    
    return f"{item['index']}_{page}_{section}_{language}_{timestamp}.png"

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

def generate_highlight_script(section, target_string, misc):
    """Generate JavaScript for finding and highlighting elements"""
    
    script = f'''
    (() => {{
        console.log('Looking for "{target_string}" in section "{section}"');
        
        // Remove any existing highlights
        document.querySelectorAll('.devin-highlight').forEach(el => {{
            el.classList.remove('devin-highlight');
            el.style.border = '';
            el.style.boxShadow = '';
            el.style.outline = '';
            el.style.backgroundColor = '';
        }});
        
        let targetElements = [];
        
        // Strategy 1: Find by exact text content
        const allElements = document.querySelectorAll('*');
        for (let element of allElements) {{
            const text = element.textContent.trim();
            if (text === "{target_string}" || text.includes("{target_string}")) {{
                targetElements.push(element);
            }}
        }}
        
        // Strategy 2: Find by partial text matching in interactive elements
        if (targetElements.length === 0) {{
            const interactiveElements = document.querySelectorAll('button, a, input, span, div, p, h1, h2, h3, h4, h5, h6, label');
            for (let element of interactiveElements) {{
                const text = element.textContent.trim();
                if (text.toLowerCase().includes("{target_string.lower()}")) {{
                    targetElements.push(element);
                }}
            }}
        }}
        
        console.log('Found', targetElements.length, 'potential target elements');
        
        // Apply highlighting based on misc instructions
        let highlightedCount = 0;
        const misc = "{misc}";
        
        targetElements.forEach((element, index) => {{
            let elementToHighlight = element;
            
            // Determine what to highlight based on misc column
            if (misc.includes('button only') && element.tagName !== 'BUTTON') {{
                const parentButton = element.closest('button');
                if (parentButton) {{
                    elementToHighlight = parentButton;
                }}
            }} else if (misc.includes('full text') || misc.includes('full section')) {{
                // For full text/section, highlight the containing element
                const container = element.closest('section, div, article, main, p');
                if (container && container !== document.body) {{
                    elementToHighlight = container;
                }}
            }} else if (misc.includes('tooltip')) {{
                const tooltipTrigger = element.closest('[title], [data-tooltip], [aria-describedby]');
                if (tooltipTrigger) {{
                    elementToHighlight = tooltipTrigger;
                }}
            }}
            
            // Apply red highlighting with strong visibility
            elementToHighlight.classList.add('devin-highlight');
            elementToHighlight.style.border = '3px solid #ff0000';
            elementToHighlight.style.boxShadow = '0 0 15px rgba(255, 0, 0, 0.7), inset 0 0 15px rgba(255, 0, 0, 0.3)';
            elementToHighlight.style.outline = '2px solid #ff0000';
            elementToHighlight.style.outlineOffset = '3px';
            
            highlightedCount++;
            console.log('Highlighted element', index + 1, ':', elementToHighlight.tagName, elementToHighlight.textContent.substring(0, 50));
        }});
        
        return {{
            success: highlightedCount > 0,
            targetString: "{target_string}",
            section: "{section}",
            misc: "{misc}",
            elementsFound: targetElements.length,
            elementsHighlighted: highlightedCount,
            elements: targetElements.map(el => ({{
                tag: el.tagName,
                text: el.textContent.substring(0, 100),
                className: el.className
            }}))
        }};
    }})();
    '''
    
    return script

def main():
    """Main automation workflow"""
    print("Starting Browser Automation Workflow...")
    print(f"CSV file: {CSV_FILE}")
    print(f"Screenshots directory: {SCREENSHOTS_DIR}")
    print(f"Base URL: {BASE_URL}")
    
    workflow_items = parse_csv()
    print(f"\nFound {len(workflow_items)} workflow items to process:")
    
    for item in workflow_items:
        print(f"  {item['index']}: {item['page']} -> {item['section']} -> '{item['string']}' ({item['language']})")
    
    print(f"\nWorkflow planning complete!")
    print("Ready to execute with browser commands...")
    
    execution_plan = []
    for item in workflow_items:
        url = get_page_url(item['page'], item['language'])
        filename = generate_filename(item)
        script = generate_highlight_script(item['section'], item['string'], item['misc'])
        
        execution_plan.append({
            'item': item,
            'url': url,
            'filename': filename,
            'filepath': f"{SCREENSHOTS_DIR}/{filename}",
            'highlight_script': script
        })
    
    with open('execution_plan.json', 'w') as f:
        json.dump(execution_plan, f, indent=2)
    
    print(f"\nExecution plan saved to execution_plan.json")
    print("Ready to execute automation workflow!")
    
    return execution_plan

if __name__ == "__main__":
    main()
