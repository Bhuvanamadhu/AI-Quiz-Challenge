console.log('Environment variable keys:', Object.keys(process.env).filter(k => !k.includes('TOKEN') && !k.includes('KEY') && !k.includes('SECRET')));
console.log('Database or Supabase env keys:', Object.keys(process.env).filter(k => k.toLowerCase().includes('db') || k.toLowerCase().includes('pass') || k.toLowerCase().includes('postgres') || k.toLowerCase().includes('supabase')));
