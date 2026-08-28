const fs = require('fs');
let code = fs.readFileSync('src/pages/shared/ProfileSettings.tsx', 'utf8');

const targetStr = `  const formatPhone = (val: string) => {
    let v = val.replace(/\\D/g, ''); // keep only digits
    if (v.length > 11) v = v.substring(0, 11); // max 11 digits
    if (v.length > 2) v = '(' + v.substring(0, 2) + ') ' + v.substring(2);
    if (v.length > 10) v = v.substring(0, 10) + '-' + v.substring(10);
    return v;
  };`;

const repStr = `  const formatPhone = (val: string) => {
    let v = val.replace(/\\D/g, '');
    if (v.length > 11) v = v.substring(0, 11);
    
    if (v.length <= 10) {
      // Landline: (XX) XXXX-XXXX
      v = v.replace(/(\\d{2})(\\d)/, '($1) $2');
      v = v.replace(/(\\d{4})(\\d)/, '$1-$2');
    } else {
      // Mobile: (XX) XXXXX-XXXX
      v = v.replace(/(\\d{2})(\\d)/, '($1) $2');
      v = v.replace(/(\\d{5})(\\d)/, '$1-$2');
    }
    return v;
  };`;

code = code.replace(targetStr, repStr);
fs.writeFileSync('src/pages/shared/ProfileSettings.tsx', code);
