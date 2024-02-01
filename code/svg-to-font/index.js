
const opentype = require('opentype.js')
const { JSDOM } = require('jsdom');
const fs = require('fs');

const Path = require('./js/OpenType/Path')
const path = require('path');


const express = require('express')
const app = express()
const port = 3000
app.set('view engine', 'ejs'); // Set EJS as the view engine
app.use(express.json());
app.set('views', path.join(__dirname, 'views'));

app.use('/generated', express.static('generated'))
app.use('/js', express.static('js'))
app.get('/', (req, res) => {
  res.render('index'); // Renders 'views/index.ejs'
});

app.post('/generate', async (req, res) => {
  const { font_name, font_style, svgs } = req.body;

  // Check if font_name, font_style, and svgs are provided
  if (!font_name || !font_style || !svgs || !Array.isArray(svgs) || svgs.length === 0) {
    return res.status(400).json({ error: 'font_name, font_style, and svgs are required.' });
  }

  // Validate each SVG object in the svgs array
  for (const svg of svgs) {
    const { name, code } = svg;
    if (!name || !code) {
      return res.status(400).json({ error: 'All svgs must have a name and code.' });
    }
  }


  const notdefGlyph = new opentype.Glyph({
    name: '.notdef',
    unicode: 0,
    advanceWidth: 650,
    path: new opentype.Path()
  });

  // Load external scripts
  const opentypeScript = fs.readFileSync('./js/opentype.js', 'utf-8');
  const customScript = fs.readFileSync('./js/custom.js', 'utf-8');
  const snapScript = fs.readFileSync('./js/snap.svg-min.js', 'utf-8');
  const raphaelScript = fs.readFileSync('./js/raphaelv2.1.1.min.js', 'utf-8');
  const bboxScript = fs.readFileSync('./js/OpenType/bbox.js', 'utf-8');
  const pathScript = fs.readFileSync('./js/OpenType/Path.js', 'utf-8');
  const jqueryScript = fs.readFileSync('./js/jquery-latest.min.js', 'utf-8');


  let allFiles = [];

  for (let i = 0; i < svgs.length; i++) {
    const element = svgs[i];
    const dom = new JSDOM(`<!DOCTYPE html><svg>${element.code}</svg>`, { runScripts: 'outside-only' });
    dom.window.eval(opentypeScript);
    dom.window.eval(customScript);
    dom.window.eval(snapScript);
    dom.window.eval(raphaelScript);
    dom.window.eval(bboxScript);
    dom.window.eval(pathScript);
    dom.window.eval(jqueryScript);
    const newElm = dom.window.document.querySelector('svg');
    const output = dom.window.createPath(newElm).toString();

    allFiles.push({
      name: element.name,
      path: output
    })
  }





  const glyphs = [notdefGlyph];
  for (let i = 0; i < allFiles.length; i++) {
    const Alphabet = allFiles[i];
    const elmPath = new Path();
    elmPath.fromSVG(Alphabet.path)
    const elmGlyph = new opentype.Glyph({
      name: Alphabet.name,
      unicode: Alphabet.name.charCodeAt(),
      advanceWidth: 650,
      path: elmPath
    });
    glyphs.push(elmGlyph)
  }

  const font = new opentype.Font({
    familyName: font_name,
    styleName: font_style,
    unitsPerEm: 1000,
    ascender: 800,
    descender: -800,
    glyphs: glyphs
  });
  const timestamp = Date.now();
  const baseFilename = font_name + "-" + font_style + "_" + timestamp + ".otf";

  font.download("./generated/" + baseFilename);
  res.json({
    "file_name": "/generated/" + baseFilename
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})