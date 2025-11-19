const fs = require('node:fs');
const path = require('node:path');

try {
  const repoRoot = path.join(__dirname, '..');
  const mdDir = path.join(repoRoot, 'public', 'md');
  const outFile = path.join(repoRoot, 'public/md', 'md_files.json');

  if (!fs.existsSync(mdDir)) {
    console.warn('md dir not found:', mdDir);
    fs.writeFileSync(outFile, '[]');
    process.exit(0);
  }

  const files = fs.readdirSync(mdDir).filter((f) => f.endsWith('.md'));
  const entries = files.map((fn) => {
    const full = path.join(mdDir, fn);
    const content = fs.readFileSync(full, 'utf8');
    const m = content.match(/^\s*#\s+(.+)$/m);
    const title = m ? m[1].trim() : fn.replace(/\.md$/, '');
    const fileName = fn.replace(/\.md$/, '');
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    return {
      name: fn,
      title,
      path: `md/${fn}`,
      fileName,
      id: slug,
    };
  });

  fs.writeFileSync(outFile, JSON.stringify(entries, null, 2), 'utf8');
  console.log('Generated md index:', outFile);
} catch (err) {
  console.error(err);
  process.exit(1);
}
