import fs from 'fs';
import path from 'path';

function parseCSV(text) {
  const [headerLine, ...lines] = text.trim().split('\n');
  const headers = headerLine.split(',').map(h => h.trim());
  return lines.map(line => {
    const values = line.split(',').map(v => v.trim());
    return Object.fromEntries(headers.map((h, i) => [h, values[i]]));
  });
}

function getHeaders(text) {
  return text.trim().split('\n')[0].split(',').map(h => h.trim());
}

function checkFileExists(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    console.error('Make sure the UI transformation test has been successfully run and files are downloaded. Use command: npm run test');
    process.exit(1);
  }
}

const messyPath = path.resolve('test-data/messy.csv');
const dropFoobarPath = path.resolve('downloads/messy_drop_foobar.csv');
const removedDupesPath = path.resolve('downloads/messy_removed_duplicates_name.csv');

checkFileExists(messyPath);
checkFileExists(dropFoobarPath);
checkFileExists(removedDupesPath);

const messyText = fs.readFileSync(messyPath, 'utf-8');
const dropFoobarText = fs.readFileSync(dropFoobarPath, 'utf-8');
const removedDupesText = fs.readFileSync(removedDupesPath, 'utf-8');


// 1.1 Drop Transformation - Validate Foobar column removed and column count correct
const messyHeaders = getHeaders(messyText);
const dropFoobarHeaders = getHeaders(dropFoobarText);
if (dropFoobarHeaders.includes('Foobar')) {
  console.error('❌ 1.1a Foobar column was NOT removed in messy_drop_foobar.csv');
  process.exit(1);
}
if (dropFoobarHeaders.length !== messyHeaders.length - 1) {
  console.error('❌ 1.1b Column count mismatch after dropping Foobar');
  process.exit(1);
}
console.log('✅ 1.1 Foobar column removed and column count is correct in messy_drop_foobar.csv');


// 1.2 Drop Transformation - Compare column headers to original csv (schema check)
const expectedDropFoobarHeaders = messyHeaders.filter(h => h !== 'Foobar');
if (JSON.stringify(dropFoobarHeaders) !== JSON.stringify(expectedDropFoobarHeaders)) {
  console.error('❌ 1.2 Output schema does not match expected after dropping Foobar');
  process.exit(1);
}
console.log('✅ 1.2 Output schema matches expected after dropping Foobar');


// 1.3 Drop Transformation - Validate row count and data match except for Foobar column
const messyRows = parseCSV(messyText).map(row => {
  const { Foobar, ...rest } = row;
  return rest;
});
const dropFoobarRows = parseCSV(dropFoobarText);

if (dropFoobarRows.length !== messyRows.length) {
  console.error('❌ 1.3b Row count mismatch after dropping Foobar');
  process.exit(1);
}
console.log('✅ 1.3a Row count matches after dropping Foobar column');

if (JSON.stringify(messyRows) !== JSON.stringify(dropFoobarRows)) {
  console.error('❌ 1.3a Row data mismatch after dropping Foobar column');
  process.exit(1);
}
console.log('✅ 1.3b Row data matches after dropping Foobar column');


// 2.1 Duplicates Removed - Validate duplicates removed by Name and Foobar still gone
const removedDupesHeaders = getHeaders(removedDupesText);
if (removedDupesHeaders.includes('Foobar')) {
  console.error('❌ 2.1 Foobar column present in messy_removed_duplicates_name.csv');
  process.exit(1);
}
const removedDupesRows = parseCSV(removedDupesText);
console.log('✅ 2.1 Foobar column not present in messy_removed_duplicates_name.csv');


// 2.2 Duplicates Removed - Check for duplicate names
const seenNames = new Set();
let hasDuplicates = false;
for (const row of removedDupesRows) {
  if (seenNames.has(row.Name)) {
    hasDuplicates = true;
    break;
  }
  seenNames.add(row.Name);
}
if (hasDuplicates) {
  console.error('❌ 2.2 Duplicate names found in messy_removed_duplicates_name.csv');
  process.exit(1);
}
console.log('✅ 2.2 Duplicate names removed in messy_removed_duplicates_name.csv');


// 2.3 Duplicates Removed - After removing duplicates by Name
const uniqueNames = new Set(messyRows.map(row => row.Name));
if (removedDupesRows.length !== uniqueNames.size) {
  console.error('❌ 2.3 Row count mismatch after removing duplicates by Name');
  process.exit(1);
}
console.log('✅ 2.3 Row count matches after removing duplicates by Name');
console.log('All validations passed!');