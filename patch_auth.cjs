const fs = require('fs');
let code = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

code = code.replace(
  "isLoading: boolean;\n}",
  "isLoading: boolean;\n  refreshProfile: () => Promise<void>;\n}"
);

const fetchProfileStr = `  const fetchProfile = async (userId: string) => {`;
const repStr = `  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const fetchProfile = async (userId: string) => {`;
code = code.replace(fetchProfileStr, repStr);

const valueStr = `value={{ session, user, profile, isLoading }}`;
const repValueStr = `value={{ session, user, profile, isLoading, refreshProfile }}`;
code = code.replace(valueStr, repValueStr);

fs.writeFileSync('src/contexts/AuthContext.tsx', code);
