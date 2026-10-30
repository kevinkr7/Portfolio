import fs from 'fs';
import path from 'path';

function fixTChunksInFile(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');
  let originalHtml = html;

  // Extract all chunks from self.__next_f.push([1, ("...")])
  // We want to find each T-chunk header like (\d+:T)([0-9a-fA-F]+), and fix it in raw html
  
  // Reconstruct stream
  const re = /self\.__next_f\.push\(\[1,\s*("[\s\S]*?")\s*\]\)/g;
  let chunks = [];
  let m;
  while ((m = re.exec(html)) !== null) chunks.push(eval(m[1]));
  const stream = chunks.join('');

  // Find all T chunks in stream
  const tMatches = [...stream.matchAll(/(?:^|\n)([0-9a-f]+):T([0-9a-fA-F]+),/g)];
  for (const tm of tMatches) {
    const id = tm[1];
    const hex = tm[2];
    const headerEnd = tm.index + tm[0].length;
    
    // Look for next chunk like \d+:["$
    const remaining = stream.slice(headerEnd);
    const nextChunk = remaining.match(/([0-9a-f]+:\[\"\$)/);
    if (!nextChunk) continue;

    const payload = remaining.slice(0, nextChunk.index);
    const actualByteLen = Buffer.byteLength(payload, 'utf8');
    const actualHex = actualByteLen.toString(16);

    if (hex !== actualHex) {
      console.log(`${filePath} -> Updating ${id}:T${hex} to ${id}:T${actualHex} (${actualByteLen} bytes)`);
      // Replace in html
      const targetHeader = `${id}:T${hex},`;
      const replacementHeader = `${id}:T${actualHex},`;
      if (html.includes(targetHeader)) {
        html = html.replace(targetHeader, replacementHeader);
      } else {
        console.error(`Target header ${targetHeader} not found directly in ${filePath}`);
      }
    }
  }

  if (html !== originalHtml) {
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`Saved fixes for ${filePath}`);
  }
}

function scanAndFix(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name);
    if (f.isDirectory() && f.name !== 'node_modules' && f.name !== '.git') scanAndFix(full);
    else if (f.isFile() && f.name.endsWith('.html')) fixTChunksInFile(full);
  }
}

scanAndFix('dist');
if (fs.existsSync('.studio-dist')) scanAndFix('.studio-dist');
