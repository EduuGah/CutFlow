const fs = require('fs');
let code = fs.readFileSync('src/pages/shared/ProfileSettings.tsx', 'utf8');

const targetStr = `const { profile } = useAuth();`;
const repStr = `const { profile, refreshProfile } = useAuth();`;
code = code.replace(targetStr, repStr);

const targetStr2 = `setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });`;
const repStr2 = `setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      await refreshProfile();`;
code = code.replace(targetStr2, repStr2);

fs.writeFileSync('src/pages/shared/ProfileSettings.tsx', code);
