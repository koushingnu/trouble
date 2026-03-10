const fs = require('fs');
const iconv = require('iconv-lite');
const { parse } = require('csv-parse/sync');

const filePath = '/Users/koushin/Downloads/contract20260305135318.csv';

// ファイルを読み込み
const buffer = fs.readFileSync(filePath);

// Shift-JIS → UTF-8変換
const decoded = iconv.decode(buffer, 'Shift_JIS');

// CSV解析
const records = parse(decoded, {
  columns: true,
  skip_empty_lines: true,
  trim: true,
  bom: true,
});

console.log('📋 CSVカラム名:');
console.log(Object.keys(records[0]));
console.log('\n📊 サンプルレコード:');
console.log(records[0]);
