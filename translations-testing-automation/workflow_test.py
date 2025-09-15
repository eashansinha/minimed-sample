#!/usr/bin/env python3
"""
Proof of concept script to test Medtronic's workflow requirements
This demonstrates CSV parsing and basic workflow orchestration
"""

import csv
import json
from pathlib import Path

def parse_medtronic_csv(csv_path):
    """Parse the CSV file and return structured data for workflow processing"""
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

def generate_workflow_plan(workflow_items):
    """Generate a structured plan for Devin to execute"""
    plan = {
        'total_items': len(workflow_items),
        'languages_needed': list(set(item['language'] for item in workflow_items)),
        'pages_needed': list(set(item['screen_page'] for item in workflow_items)),
        'workflow_steps': []
    }
    
    for i, item in enumerate(workflow_items):
        step = {
            'step_number': i + 1,
            'action': 'navigate_and_highlight',
            'target_page': item['screen_page'],
            'target_section': item['section'],
            'target_string': item['string'],
            'language': item['language'],
            'highlighting_mode': item['misc'],
            'screenshot_filename': f"medtronic_step_{i+1}_{item['screen_page']}_{item['language']}.png"
        }
        plan['workflow_steps'].append(step)
    
    return plan

def main():
    csv_path = Path(__file__).parent / 'sample_medtronic_workflow.csv'
    
    print("=== Medtronic Workflow Proof of Concept ===")
    print(f"Parsing CSV file: {csv_path}")
    
    try:
        workflow_items = parse_medtronic_csv(csv_path)
        print(f"✅ Successfully parsed {len(workflow_items)} workflow items")
        
        plan = generate_workflow_plan(workflow_items)
        
        print(f"\n=== Workflow Analysis ===")
        print(f"Total items to process: {plan['total_items']}")
        print(f"Languages required: {', '.join(plan['languages_needed'])}")
        print(f"Pages to visit: {', '.join(plan['pages_needed'])}")
        
        print(f"\n=== Workflow Steps ===")
        for step in plan['workflow_steps']:
            print(f"Step {step['step_number']}: {step['target_page']} → {step['target_section']} → '{step['target_string']}' ({step['language']})")
        
        plan_path = Path(__file__).parent / 'medtronic_workflow_plan.json'
        with open(plan_path, 'w', encoding='utf-8') as f:
            json.dump(plan, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Workflow plan saved to: {plan_path}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error processing workflow: {e}")
        return False

if __name__ == "__main__":
    main()
