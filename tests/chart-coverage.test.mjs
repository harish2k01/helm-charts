import test from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync} from 'node:fs';

test('every chart has a dedicated test file included by Lint Charts',()=>{
  const files=readdirSync('tests');
  const charts=readdirSync('charts',{withFileTypes:true}).filter(d=>d.isDirectory()).map(d=>d.name);
  const missing=charts.filter(chart=>!files.some(file=>file===`${chart}.test.mjs`||(file.startsWith(`${chart}-`)&&file.endsWith('.test.mjs'))));
  assert.deepEqual(missing,[],`Add meaningful tests/<chart-name>*.test.mjs coverage for: ${missing.join(', ')}`);
});
