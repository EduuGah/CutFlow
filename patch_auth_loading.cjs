const fs = require('fs');
let code = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

const targetStr = `  const fetchProfile = async (userId: string) => {
    try {`;
const repStr = `  const fetchProfile = async (userId: string) => {
    setIsLoading(true);
    try {`;

code = code.replace(targetStr, repStr);
fs.writeFileSync('src/contexts/AuthContext.tsx', code);
