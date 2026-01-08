const posthtml = require('posthtml');
const include = require('posthtml-include');
const fs = require('fs');
const { resolve } = require('path');

async function build(options = {}) {
  const inputPath = options.inputPath || 'src/index.html';
  const outputPath = options.outputPath || 'index.html';

  const html = fs.readFileSync(inputPath, 'utf8');
  const result = await posthtml([
    include({
      root: resolve(process.cwd()),
      encoding: 'utf8'
    })
  ]).process(html, {
    from: inputPath,
    to: outputPath
  });
  fs.writeFileSync(outputPath, result.html);
}

module.exports = build;

if (require.main === module) {
  build().catch((error) => {
    process.stderr.write(`${error && error.stack ? error.stack : String(error)}\n`);
    process.exit(1);
  });
}
