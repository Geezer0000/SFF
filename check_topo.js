const topojson = require('topojson-client');
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('frontend/src/data/ch-cantons.json', 'utf8'));
const geo = topojson.feature(data, data.objects.cantons);
const country = topojson.feature(data, data.objects.country);
const lakes = topojson.feature(data, data.objects.lakes);

console.log('Cantons count:', geo.features.length);
console.log('Country geometry type:', country.geometry ? country.geometry.type : country.features[0].geometry.type);
console.log('Lakes features:', lakes.features ? lakes.features.length : 1);

// Find bounding box across all cantons coordinates
let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
function scanCoords(coords) {
  if (typeof coords[0] === 'number') {
    if (coords[0] < minX) minX = coords[0];
    if (coords[0] > maxX) maxX = coords[0];
    if (coords[1] < minY) minY = coords[1];
    if (coords[1] > maxY) maxY = coords[1];
  } else {
    for (const c of coords) scanCoords(c);
  }
}
for (const f of geo.features) {
  scanCoords(f.geometry.coordinates);
}

console.log('Bounds:', { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY });
