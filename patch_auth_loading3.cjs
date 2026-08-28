const fs = require('fs');
let code = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

const targetStr = `    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);`;

const repStr = `    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user && !profile) {
        setIsLoading(true);
      }
      if (session?.user) {
        fetchProfile(session.user.id);`;

code = code.replace(targetStr, repStr);
fs.writeFileSync('src/contexts/AuthContext.tsx', code);
