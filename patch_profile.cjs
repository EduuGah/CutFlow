const fs = require('fs');

let code = fs.readFileSync('src/pages/shared/ProfileSettings.tsx', 'utf8');

// 1. Add phone formatting logic
const target1 = "const [fullName, setFullName] = useState('');";
const rep1 = `const [fullName, setFullName] = useState('');

  const formatPhone = (val: string) => {
    let v = val.replace(/\\D/g, ''); // keep only digits
    if (v.length > 11) v = v.substring(0, 11); // max 11 digits
    if (v.length > 2) v = '(' + v.substring(0, 2) + ') ' + v.substring(2);
    if (v.length > 10) v = v.substring(0, 10) + '-' + v.substring(10);
    return v;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };`;
code = code.replace(target1, rep1);

// 2. Change phone input onChange
const target2 = `onChange={(e) => setPhone(e.target.value)}`;
const rep2 = `onChange={handlePhoneChange}`;
code = code.replace(target2, rep2);

// 3. Print error to console
const target3 = `if (error) {
      setMessage({ type: 'error', text: 'Erro ao atualizar o perfil. Tente novamente.' });
    }`;
const rep3 = `if (error) {
      console.error('Update profile error:', error);
      setMessage({ type: 'error', text: 'Erro ao atualizar o perfil: ' + error.message });
    }`;
code = code.replace(target3, rep3);

fs.writeFileSync('src/pages/shared/ProfileSettings.tsx', code);
