
const opentype = require('opentype.js')
const { JSDOM } = require('jsdom');
const fs = require('fs');

const Path = require('./js/OpenType/Path')
const path = require('path');
const axios = require('axios');
const server = process.env.SERVER || "https://svg-to-font-six.vercel.app";

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



// URLs for external scripts
const opentypeUrl = server+'/js/opentype.js';
const customUrl = server+'/js/custom.js'; // Replace with the actual URL
const snapUrl = server+'/js/snap.svg-min.js';
const raphaelUrl = server+'/js/raphaelv2.1.1.min.js';
const bboxUrl = server+'/js/OpenType/bbox.js'; // Replace with the actual URL
const pathUrl = server+'/js/OpenType/Path.js'; // Replace with the actual URL
const jqueryUrl = server+'/js/jquery-latest.min.js';


    // Function to fetch script content from a URL
    async function fetchScript(url) {
      try {
        const response = await axios.get(url);
        return response.data;
      } catch (error) {
        console.error(`Error fetching script from ${url}:`, error.message);
        return null;
      }
    }

    // Usage
    const opentypeScript = await fetchScript(opentypeUrl);
    const customScript = await fetchScript(customUrl);
    const snapScript = await fetchScript(snapUrl);
    const raphaelScript = await fetchScript(raphaelUrl);
    const bboxScript = await fetchScript(bboxUrl);
    const pathScript = await fetchScript(pathUrl);
    const jqueryScript = await fetchScript(jqueryUrl);


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

   // Set appropriate headers for font file
   res.setHeader('Content-Type', 'application/octet-stream');
   res.setHeader('Content-Disposition', 'attachment; filename='+baseFilename);
 
   // Send the font data directly in the response
   res.send(Buffer.from(font.toArrayBuffer()));

})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})