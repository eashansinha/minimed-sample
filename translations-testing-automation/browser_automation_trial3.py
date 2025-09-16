#!/usr/bin/env python3
"""
Browser automation script to create screenshots-trial3 with highlighted UI elements
Based on sample_medtronic_workflow.csv workflow items
"""

import csv
import time
from pathlib import Path

def parse_csv_workflow():
    """Parse the CSV file and return workflow items"""
    csv_path = Path(__file__).parent / 'sample_medtronic_workflow.csv'
    workflow_items = []
    
    with open(csv_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            workflow_items.append({
                'screen_page': row['Screen/Page'],
                'section': row['Section'],
                'string': row['String'],
                'language': row['Language'],
                'misc': row['Misc']
            })
    
    return workflow_items

def get_language_code(language):
    """Convert language name to language code"""
    language_map = {
        'Spanish': 'es',
        'French': 'fr', 
        'German': 'de',
        'English': 'en'
    }
    return language_map.get(language, 'en')

def get_page_url(page, language_code):
    """Get the URL for a specific page with language parameter"""
    base_url = 'http://localhost:5173'
    
    if page.lower() == 'landing':
        url = f"{base_url}/"
    elif page.lower() == 'auth':
        url = f"{base_url}/auth"
    elif page.lower() == 'dashboard':
        url = f"{base_url}/dashboard"
    else:
        url = base_url
    
    if language_code != 'en':
        separator = '?' if '?' not in url else '&'
        url += f"{separator}lang={language_code}"
    
    return url

def generate_screenshot_filename(item, index):
    """Generate screenshot filename based on workflow item"""
    page = item['screen_page'].lower().replace(' ', '-')
    section = item['section'].lower().replace(' ', '-')
    language = item['language'].lower()
    target = item['string'].lower().replace(' ', '-').replace('?', '').replace("'", "")
    
    return f"{index + 1}-{page}-{section}-{language}-{target}.png"

def get_highlighting_javascript(target_string, misc_instruction):
    """Generate JavaScript code to find and highlight target elements"""
    
    highlight_style = """
        border: 3px solid red !important;
        background: rgba(255,0,0,0.1) !important;
        box-shadow: 0 0 10px rgba(255,0,0,0.3) !important;
        position: relative !important;
        z-index: 9999 !important;
    """
    
    if "button" in misc_instruction.lower():
        js_code = f"""
        (function() {{
            const buttons = document.querySelectorAll('button');
            let found = false;
            buttons.forEach(button => {{
                if (button.textContent.trim().includes('{target_string}')) {{
                    button.style.cssText += '{highlight_style}';
                    found = true;
                }}
            }});
            return {{ success: found, type: 'button', target: '{target_string}' }};
        }})();
        """
    elif "all instances" in misc_instruction.lower():
        js_code = f"""
        (function() {{
            const walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );
            let node;
            let count = 0;
            while (node = walker.nextNode()) {{
                if (node.textContent.includes('{target_string}')) {{
                    const parent = node.parentElement;
                    if (parent) {{
                        parent.style.cssText += '{highlight_style}';
                        count++;
                    }}
                }}
            }}
            return {{ success: count > 0, type: 'multiple', target: '{target_string}', count: count }};
        }})();
        """
    elif "tooltip" in misc_instruction.lower():
        js_code = f"""
        (function() {{
            // First try to find existing tooltip
            let tooltipElements = document.querySelectorAll('[role="tooltip"], .tooltip, [data-tooltip]');
            let found = false;
            
            tooltipElements.forEach(el => {{
                if (el.textContent.includes('{target_string}')) {{
                    el.style.cssText += '{highlight_style}';
                    found = true;
                }}
            }});
            
            // If not found, try to trigger tooltip by hovering over chart elements
            if (!found) {{
                const chartElements = document.querySelectorAll('svg, canvas, .recharts-wrapper');
                chartElements.forEach(chart => {{
                    const event = new MouseEvent('mouseover', {{ bubbles: true }});
                    chart.dispatchEvent(event);
                }});
                
                // Wait a bit and check again
                setTimeout(() => {{
                    tooltipElements = document.querySelectorAll('[role="tooltip"], .tooltip, [data-tooltip]');
                    tooltipElements.forEach(el => {{
                        if (el.textContent.includes('{target_string}')) {{
                            el.style.cssText += '{highlight_style}';
                            found = true;
                        }}
                    }});
                }}, 500);
            }}
            
            return {{ success: found, type: 'tooltip', target: '{target_string}' }};
        }})();
        """
    else:
        js_code = f"""
        (function() {{
            const walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );
            let node;
            let found = false;
            while (node = walker.nextNode()) {{
                if (node.textContent.trim().includes('{target_string}')) {{
                    const parent = node.parentElement;
                    if (parent) {{
                        parent.style.cssText += '{highlight_style}';
                        found = true;
                        break;
                    }}
                }}
            }}
            return {{ success: found, type: 'text', target: '{target_string}' }};
        }})();
        """
    
    return js_code

def main():
    """Main automation function"""
    print("=== Browser Automation for Screenshots Trial 3 ===")
    
    workflow_items = parse_csv_workflow()
    print(f"Found {len(workflow_items)} workflow items to process")
    
    screenshots_dir = Path(__file__).parent / 'screenshots-trial3'
    screenshots_dir.mkdir(exist_ok=True)
    
    print(f"\nScreenshots will be saved to: {screenshots_dir}")
    print("\nWorkflow items:")
    for i, item in enumerate(workflow_items):
        print(f"{i+1}. {item['screen_page']} -> {item['section']} -> '{item['string']}' ({item['language']})")
    
    print(f"\nReady to process {len(workflow_items)} items.")
    print("This script provides the automation logic.")
    print("Use Devin's built-in browser commands to execute the workflow:")
    print("1. Navigate to each page URL")
    print("2. Switch language using LanguageDropdown")
    print("3. Execute highlighting JavaScript")
    print("4. Capture screenshot")
    
    print(f"\n=== Generated JavaScript for Highlighting ===")
    for i, item in enumerate(workflow_items):
        filename = generate_screenshot_filename(item, i)
        url = get_page_url(item['screen_page'], get_language_code(item['language']))
        js_code = get_highlighting_javascript(item['string'], item['misc'])
        
        print(f"\n--- Item {i+1}: {filename} ---")
        print(f"URL: {url}")
        print(f"JavaScript:")
        print(js_code)

if __name__ == "__main__":
    main()
