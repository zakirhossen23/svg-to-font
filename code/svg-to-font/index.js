
const opentype = require('opentype.js')
var fs = require('fs');
const Path = require('./js/OpenType/Path')
const chrome = require('chrome-aws-lambda');

const puppeteer = require('puppeteer-core');
const path = require('path');


const express = require('express')
const app = express()
const port = 3000
app.set('view engine', 'ejs'); // Set EJS as the view engine
app.use(express.json());
app.set('views', path.join(__dirname, 'views'));

app.use('/generated',express.static('generated'))
app.use('/js',express.static('js'))
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

  const browser = await puppeteer.launch({
    executablePath: await chrome.executablePath,
    args: chrome.args,
    defaultViewport: chrome.defaultViewport,
    headless: chrome.headless,
  });
  const page = await browser.newPage();

  const notdefGlyph = new opentype.Glyph({
    name: '.notdef',
    unicode: 0,
    advanceWidth: 650,
    path: new opentype.Path()
  });

  await page.goto('about:blank');
  await page.addScriptTag({ path: './js/custom.js' });
  await page.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/opentype.js' });
  await page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/snap.svg/0.5.1/snap.svg-min.js' });
  await page.addScriptTag({ path: './js/raphaelv2.1.1.min.js' });
  await page.addScriptTag({ path: './js/OpenType/bbox.js' });
  await page.addScriptTag({ path: './js/OpenType/Path.js' });
  await page.addScriptTag({ url: 'https://code.jquery.com/jquery-latest.min.js' });

  let allFiles = [];

  for (let i = 0; i < svgs.length; i++) {
    const element = svgs[i];
    let output = await page.evaluate((element) => {
      var newElm = document.createElement("svg")
      newElm.innerHTML = element.code;

      let path = createPath(newElm).toString();
      return (path)

    }, element);
 
    allFiles.push({
      name: element.name,
      path: output
    })
  }



  await browser.close();

 
  const glyphs = [notdefGlyph];
  for (let i = 0; i < allFiles.length; i++) {
    const Alphabet = allFiles[i];
    const elmPath = new Path();
    elmPath.fromSVG(Alphabet.path)
    // more drawing instructions...
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
  const baseFilename = font_name+"-"+font_style+"_"+timestamp+".otf";

  font.download("./generated/"+baseFilename);
  res.json({
    "file_name":"/generated/"+baseFilename
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})