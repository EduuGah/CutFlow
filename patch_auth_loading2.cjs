const fs = require('fs');
let code = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

const targetStr = `      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);`;

const repStr = `      setUser(session?.user ?? null);
      if (session?.user && !profile) {
        setIsLoading(true);
      }
      if (session?.user) {
        fetchProfile(session.user.id);`;

code = code.replace(targetStr, repStr);
fs.writeFileSync('src/contexts/AuthContext.tsx', code);
