import fs from 'fs';

// Parse CSV into array of objects
export function parseCSV(text) {
  const [headerLine, ...lines] = text.trim().split('\n');
  const headers = headerLine.split(',').map(h => h.trim());
  return lines.map(line => {
    const values = line.split(',').map(v => v.trim());
    return Object.fromEntries(headers.map((h, i) => [h, values[i]]));
  });
}

// Get headers from CSV text
export function getHeaders(text) {
  return text.trim().split('\n')[0].split(',').map(h => h.trim());
}

export function checkFileExists(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    console.error('Make sure the UI transformation test has been successfully run and files are downloaded. Use command: npm run test');
    process.exit(1);
  }
}

// Remove duplicate rows by Name
export function removeDuplicatesByName(rows) {
  const seen = new Set();
  return rows.filter(row => {
    if (seen.has(row.Name)) return false;
    seen.add(row.Name);
    return true;
  });
}