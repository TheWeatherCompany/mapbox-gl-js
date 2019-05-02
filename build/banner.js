import fs from 'fs';

const description = JSON.parse(fs.readFileSync('package.json')).description;
const version = description.split(" ").pop(); // assume description ends like "v0.54.0"
export default `/* Mapbox GL JS is licensed under the 3-Clause BSD License. Full text of license: https://github.com/mapbox/mapbox-gl-js/blob/${version}/LICENSE.txt */`;
