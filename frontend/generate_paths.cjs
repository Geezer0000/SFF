const topojson = require('topojson-client');
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('src/data/ch-cantons.json', 'utf8'));
const geo = topojson.feature(data, data.objects.cantons);
const country = topojson.feature(data, data.objects.country);
const lakes = topojson.feature(data, data.objects.lakes);

// WGS84 bounds of Switzerland:
// lon (x): 5.95 to 10.50
// lat (y): 45.81 to 47.81
// In SVG, Y increases downwards, so y = (maxY - lat) * scaleY

const minLon = 5.956;
const maxLon = 10.495;
const minLat = 45.818;
const maxLat = 47.810;

const SVG_WIDTH = 900;
const SVG_HEIGHT = 580;
const PADDING = 20;

const drawWidth = SVG_WIDTH - 2 * PADDING;
const drawHeight = SVG_HEIGHT - 2 * PADDING;

// Aspect ratio correction for Switzerland (latitude ~46.8 deg -> cos(lat) ~ 0.6845)
const lonSpan = (maxLon - minLon) * Math.cos(46.8 * Math.PI / 180);
const latSpan = maxLat - minLat;

const scaleX = drawWidth / (maxLon - minLon);
const scaleY = drawHeight / (maxLat - minLat);
const scale = Math.min(drawWidth / (maxLon - minLon), drawHeight / (maxLat - minLat));

function project(lon, lat) {
  const x = PADDING + (lon - minLon) * scale;
  const y = PADDING + (maxLat - lat) * scale * 1.46; // 1 / cos(46.8 deg) ~ 1.46
  return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
}

function ringToSvgPath(ring) {
  return ring.map((pt, i) => {
    const [px, py] = project(pt[0], pt[1]);
    return `${i === 0 ? 'M' : 'L'} ${px} ${py}`;
  }).join(' ') + ' Z';
}

function geomToSvg(geometry) {
  if (geometry.type === 'Polygon') {
    return geometry.coordinates.map(ringToSvgPath).join(' ');
  } else if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.map(poly => poly.map(ringToSvgPath).join(' ')).join(' ');
  }
  return '';
}

const CANTON_BFS = {
  1: 'ZH', 2: 'BE', 3: 'LU', 4: 'UR', 5: 'SZ', 6: 'OW', 7: 'NW', 8: 'GL',
  9: 'ZG', 10: 'FR', 11: 'SO', 12: 'BS', 13: 'BL', 14: 'SH', 15: 'AR',
  16: 'AI', 17: 'SG', 18: 'GR', 19: 'AG', 20: 'TG', 21: 'TI', 22: 'VD',
  23: 'VS', 24: 'NE', 25: 'GE', 26: 'JU'
};

const CANTON_NAMES = {
  'ZH': 'Zürich', 'BE': 'Bern', 'LU': 'Luzern', 'UR': 'Uri', 'SZ': 'Schwyz',
  'OW': 'Obwalden', 'NW': 'Nidwalden', 'GL': 'Glarus', 'ZG': 'Zug', 'FR': 'Freiburg',
  'SO': 'Solothurn', 'BS': 'Basel-Stadt', 'BL': 'Basel-Landschaft', 'SH': 'Schaffhausen',
  'AR': 'Appenzell Ausserrhoden', 'AI': 'Appenzell Innerrhoden', 'SG': 'St. Gallen',
  'GR': 'Graubünden', 'AG': 'Aargau', 'TG': 'Thurgau', 'TI': 'Tessin', 'VD': 'Waadt',
  'VS': 'Wallis', 'NE': 'Neuenburg', 'GE': 'Genf', 'JU': 'Jura'
};

const cantonPaths = geo.features.map(f => {
  const code = CANTON_BFS[f.id];
  const name = CANTON_NAMES[code] || code;
  const path = geomToSvg(f.geometry);
  
  // Calculate center in projected coordinates
  let cMinX = Infinity, cMaxX = -Infinity, cMinY = Infinity, cMaxY = -Infinity;
  function scanPts(coords) {
    if (typeof coords[0] === 'number') {
      const [px, py] = project(coords[0], coords[1]);
      if (px < cMinX) cMinX = px;
      if (px > cMaxX) cMaxX = px;
      if (py < cMinY) cMinY = py;
      if (py > cMaxY) cMaxY = py;
    } else {
      for (const c of coords) scanPts(c);
    }
  }
  scanPts(f.geometry.coordinates);
  
  return {
    id: f.id,
    code,
    name,
    path,
    centerX: Math.round((cMinX + cMaxX) / 2),
    centerY: Math.round((cMinY + cMaxY) / 2)
  };
});

// Custom adjustments for tiny cantons or complex enclaves for optimal label visibility:
const labelOffsets = {
  'BS': { dx: -12, dy: -8 },
  'BL': { dx: 0, dy: 5 },
  'AI': { dx: 0, dy: 0 },
  'AR': { dx: -8, dy: -6 },
  'ZG': { dx: 0, dy: 0 },
  'SH': { dx: 0, dy: -5 }
};

cantonPaths.forEach(c => {
  if (labelOffsets[c.code]) {
    c.centerX += labelOffsets[c.code].dx;
    c.centerY += labelOffsets[c.code].dy;
  }
});

const lakePaths = (lakes.features || []).map(f => geomToSvg(f.geometry));
const countryPath = country.features ? geomToSvg(country.features[0].geometry) : geomToSvg(country.geometry);

const finalSvgData = {
  viewBox: `0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`,
  countryPath,
  cantons: cantonPaths,
  lakes: lakePaths
};

fs.writeFileSync('src/data/canton_paths.json', JSON.stringify(finalSvgData, null, 2));
console.log('Projected Swiss map written successfully to src/data/canton_paths.json!');
