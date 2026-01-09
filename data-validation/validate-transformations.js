import fs from 'fs';
import path from 'path';
import { parseCSV, getHeaders, checkFileExists, removeDuplicatesByName } from '../utils/csvUtils.js';

const messyPath = path.resolve('test-data/messy.csv');
const dropFoobarPath = path.resolve('downloads/messy_drop_foobar.csv');
const removedDupesPath = path.resolve('downloads/messy_removed_duplicates_name.csv');

checkFileExists(messyPath);
checkFileExists(dropFoobarPath);
checkFileExists(removedDupesPath);

const messyText = fs.readFileSync(messyPath, 'utf-8');
const dropFoobarText = fs.readFileSync(dropFoobarPath, 'utf-8');
const removedDupesText = fs.readFileSync(removedDupesPath, 'utf-8');


// 1. Drop Column Transformation
const messyHeaders = getHeaders(messyText);
const dropFoobarHeaders = getHeaders(dropFoobarText);
if (dropFoobarHeaders.includes('Foobar')) {
  console.error('❌ 1.1 Foobar column was NOT removed in messy_drop_foobar.csv');
  process.exit(1);
}
console.log('✅ 1.1 Foobar column removed in messy_drop_foobar.csv');

if (dropFoobarHeaders.length !== messyHeaders.length - 1) {
  console.error('❌ 1.2 Column count mismatch after dropping Foobar');
  process.exit(1);
}
console.log('✅ 1.2 Column count is correct in messy_drop_foobar.csv');

const expectedDropFoobarHeaders = messyHeaders.filter(h => h !== 'Foobar');
if (JSON.stringify(dropFoobarHeaders) !== JSON.stringify(expectedDropFoobarHeaders)) {
  console.error('❌ 1.3 Output schema does not match expected after dropping Foobar');
  process.exit(1);
}
console.log('✅ 1.3 Output schema matches expected after dropping Foobar');

const messyRows = parseCSV(messyText).map(row => {
  const { Foobar, ...rest } = row;
  return rest;
});
const dropFoobarRows = parseCSV(dropFoobarText);

if (dropFoobarRows.length !== messyRows.length) {
  console.error('❌ 1.4 Row count mismatch after dropping Foobar');
  process.exit(1);
}
console.log('✅ 1.4 Row count matches after dropping Foobar column');

if (JSON.stringify(messyRows) !== JSON.stringify(dropFoobarRows)) {
  console.error('❌ 1.5 Row data mismatch after dropping Foobar column');
  process.exit(1);
}
console.log('✅ 1.5 Row data matches after dropping Foobar column');


// 2. Duplicates Removed Transformation
const removedDupesHeaders = getHeaders(removedDupesText);
if (removedDupesHeaders.includes('Foobar')) {
  console.error('❌ 2.1 Foobar column present in messy_removed_duplicates_name.csv');
  process.exit(1);
}
console.log('✅ 2.1 Foobar column removed in messy_removed_duplicates_name.csv');
if (removedDupesHeaders.length !== messyHeaders.length - 1) {
  console.error('❌ 2.2 Column count mismatch after dropping Foobar');
  process.exit(1);
}
const removedDupesRows = parseCSV(removedDupesText);
console.log('✅ 2.2 Column count matches after dropping Foobar');

const expectedRemovedDupesHeaders = messyHeaders.filter(h => h !== 'Foobar');
if (JSON.stringify(removedDupesHeaders) !== JSON.stringify(expectedRemovedDupesHeaders)) {
  console.error('❌ 2.3 Output schema does not match expected after removing duplicates by Name');
  process.exit(1);
}
console.log('✅ 2.3 Output schema matches expected after removing duplicates by Name');

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
  console.error('❌ 2.4 Duplicate names found in messy_removed_duplicates_name.csv');
  process.exit(1);
}
console.log('✅ 2.4 Duplicate names removed in messy_removed_duplicates_name.csv');

const uniqueNames = new Set(messyRows.map(row => row.Name));
if (removedDupesRows.length !== uniqueNames.size) {
  console.error('❌ 2.5 Row count mismatch after removing duplicates by Name');
  process.exit(1);
}
console.log('✅ 2.5 Row count matches after removing duplicates by Name');

const expectedRemovedDupesRows = removeDuplicatesByName(messyRows);
if (JSON.stringify(removedDupesRows) !== JSON.stringify(expectedRemovedDupesRows)) {
  console.error('❌ 2.6 Row data mismatch after removing duplicates by Name');
  process.exit(1);
}
console.log('✅ 2.6 Row data matches after dropping Foobar and removing duplicates by Name');

console.log('All validations passed!');