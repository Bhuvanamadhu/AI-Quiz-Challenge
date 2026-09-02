const { execSync } = require('child_process');

try {
  console.log('Scanning git log for potential password assignments...');
  const output = execSync('git log -p -G"(password|key|secret|db)" --all', { maxBuffer: 10 * 1024 * 1024 }).toString();
  const lines = output.split('\n');
  const matchedLines = [];
  lines.forEach((line) => {
    const l = line.toLowerCase();
    if ((l.includes('pass') || l.includes('secret') || l.includes('key')) && (line.startsWith('+') || line.startsWith('-'))) {
      if (!l.includes('token') && !l.includes('authorization') && !l.includes('passwordhash') && line.length < 150) {
        matchedLines.push(line);
      }
    }
  });
  console.log(`Found ${matchedLines.length} potential matches:`);
  matchedLines.slice(0, 100).forEach(l => console.log(l));
} catch (e) {
  console.error('Git log scan failed:', e.message);
}
