const fs = require('fs');
const path = require('path');

const fr = JSON.parse(fs.readFileSync(path.join(__dirname, 'fr.json'), 'utf8'));
const vf = JSON.parse(fs.readFileSync(path.join(__dirname, 'rc.json'), 'utf8'));

function findMissingKeys(base, test, prefix = '') {
  let missing = [];
  for (const key in base) {
    const fullKey = prefix ? prefix + '.' + key : key;
    if (!(key in test)) {
      missing.push(fullKey);
    } else if (typeof base[key] === 'object' && base[key] && !Array.isArray(base[key])) {
      missing = missing.concat(findMissingKeys(base[key], test[key], fullKey));
    }
  }
  return missing;
}

const missingInVf = findMissingKeys(fr, vf);

if (missingInVf.length === 0) {
  console.log('Aucune clé manquante dans vf.json !');
} else {
  console.log('Clés manquantes ou différentes dans vf.json :');
  missingInVf.forEach(k => console.log(' - ' + k));
} 