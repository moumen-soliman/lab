// Regenerates src/blurs.json: a map of /lab/<n>.mov and /crafted/<n>.mov ->
// tiny base64 PNG data URL (40px wide, sampled 1.5s in so the component is
// actually on screen - frame 0 of most clips is a near-blank white stage that
// blurs to nothing). The lab grid, crafted page/marquee, and the home feature
// cards inline these as instant blur-up placeholders - they paint on the
// first frame with zero network requests. Run after adding or replacing
// clips:  npm run blurs
import { execSync } from 'node:child_process';
import { readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outFile = join(root, 'src', 'blurs.json');

const blurs = {};
for (const dir of ['lab', 'crafted']) {
  const videoDir = join(root, 'public', dir);
  const clips = readdirSync(videoDir)
    .filter((name) => name.endsWith('.mov'))
    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  for (const name of clips) {
    const grab = (seek) => execSync(
      `ffmpeg ${seek} -i "${join(videoDir, name)}" -vf "scale=40:-1" -frames:v 1 -f image2pipe -vcodec png - 2>/dev/null`,
      { maxBuffer: 10 * 1024 * 1024 }
    );
    // Clips shorter than 1.5s produce nothing at the seek - fall back to frame 0.
    let png = grab('-ss 1.5');
    if (png.length === 0) png = grab('');
    const dataUrl = `data:image/png;base64,${png.toString('base64')}`;
    blurs[`/${dir}/${name}`] = dataUrl;
    console.log(`✓ /${dir}/${name} → ${dataUrl.length} chars`);
  }
}

writeFileSync(outFile, `${JSON.stringify(blurs, null, 2)}\n`);
const total = Object.values(blurs).reduce((sum, v) => sum + v.length, 0);
console.log(`wrote ${outFile} (${Object.keys(blurs).length} clips, ${(total / 1024).toFixed(1)}KB total)`);
