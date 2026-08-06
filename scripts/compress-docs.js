import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

const docsDir = path.resolve(process.cwd(), 'public', 'documents');
const outPath = path.join(docsDir, 'documents.zip');

async function run() {
  if (!fs.existsSync(docsDir)) {
    console.error('Documents directory not found:', docsDir);
    process.exit(1);
  }

  const output = fs.createWriteStream(outPath);
  const archive = archiver('zip', {
    zlib: { level: 9 }, // maximum compression
  });

  output.on('close', () => {
    console.log(`Created ${outPath} — ${archive.pointer()} total bytes`);
  });

  archive.on('warning', (err) => {
    if (err.code === 'ENOENT') console.warn(err.message);
    else throw err;
  });

  archive.on('error', (err) => { throw err; });

  archive.pipe(output);

  // Add all files in the documents directory (non-recursive)
  const files = fs.readdirSync(docsDir).filter(f => !f.endsWith('.zip'));
  if (files.length === 0) {
    console.error('No files found to compress in', docsDir);
    process.exit(1);
  }

  for (const file of files) {
    const filePath = path.join(docsDir, file);
    const stats = fs.statSync(filePath);
    if (stats.isFile()) {
      archive.file(filePath, { name: file });
      console.log('Adding', file);
    }
  }

  await archive.finalize();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
