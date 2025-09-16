const { parseCSV, generateFilename, generateHighlightScript, LANGUAGE_MAP, BASE_URL, SCREENSHOTS_DIR } = require('./playwright-mcp-automation');

async function runAutomation() {
  console.log('Starting Playwright MCP automation...');
  
  // Parse CSV data
  const rows = parseCSV();
  console.log(`Found ${rows.length} rows to process`);
  
  // Process each row
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    console.log(`\nProcessing row ${i + 1}:`, row);
    
    try {
      // Determine the page URL
      let pageUrl = BASE_URL;
      const page = row['Screen/Page'].toLowerCase();
      
      if (page === 'landing') {
        pageUrl = `${BASE_URL}/`;
      } else if (page === 'auth') {
        pageUrl = `${BASE_URL}/login`;
      } else if (page === 'dashboard') {
        pageUrl = `${BASE_URL}/dashboard`;
      }
      
      console.log(`Will navigate to: ${pageUrl}`);
      console.log(`Will switch to language: ${row['Language']} (${LANGUAGE_MAP[row['Language']] || 'en'})`);
      console.log(`Will look for "${row['String']}" in section "${row['Section']}"`);
      console.log(`Highlighting mode: ${row['Misc']}`);
      
      // Generate screenshot filename
      const filename = generateFilename(row, i);
      const filepath = `${SCREENSHOTS_DIR}/${filename}`;
      
      console.log(`Will save screenshot as: ${filepath}`);
      
      const highlightScript = generateHighlightScript(row['Section'], row['String'], row['Misc']);
      
      console.log('Generated highlighting script for this row');
      
    } catch (error) {
      console.error(`Error processing row ${i + 1}:`, error.message);
    }
  }
  
  console.log('\nAutomation planning completed! Ready for MCP execution.');
  console.log(`Screenshots will be saved to: ${SCREENSHOTS_DIR}/`);
}

// Run if called directly
if (require.main === module) {
  runAutomation().catch(console.error);
}

module.exports = { runAutomation };
