
const opentype = require('opentype.js')
var fs = require('fs');
const Path = require('./js/OpenType/Path')
const puppeteer = require('puppeteer');


const express = require('express')
const app = express()
const port = 3000
app.set('view engine', 'ejs'); // Set EJS as the view engine

const fontOptions = {
  "familyName":'YourCustomFontFamily',
  "styleName": 'Regular',
}
app.use('/generated',express.static('generated'))
app.use('/js',express.static('js'))
app.get('/', (req, res) => {
  res.render('index'); // Renders 'views/index.ejs'
});

app.get('/generate', async (req, res) => {
  
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'] });
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

  let allSVGs = [{
    "code": `<svg xmlns="http://www.w3.org/2000/svg" id="svg" version="1.1" style="display: block; background: rgb(0, 0, 0);" viewBox="0 0 339 301"><path d="M0 0 C0 0.99 0 1.98 0 3 C0.07206421 5.73843999 0.39079192 7.38193716 2.34375 9.36328125 C6.60176892 12.64389128 10.70751885 14.24672634 16 15 C16.76957031 15.13019531 17.53914063 15.26039063 18.33203125 15.39453125 C20.81486113 15.63746154 22.60048481 15.70251966 25 15 C27.25936091 12.59351792 28.66561965 10.00403214 30 7 C30.99 7.66 31.98 8.32 33 9 C33.08582834 14.1497006 33.08582834 14.1497006 32 17 C27.95987445 20.42492461 23.24663427 21.31990702 18.0625 21 C9.88640836 19.72844609 2.93290973 16.78458699 -3 11 C-5 8 -5 8 -4.875 4.9375 C-4 2 -4 2 -1.9375 0.625 C-1.298125 0.41875 -0.65875 0.2125 0 0 Z " transform="translate(123,169)" style="fill: #FFFFFF;"/><path d="M0 0 C5.23053512 3.06271747 8.99590768 5.9056918 10.9609375 11.80078125 C11.50280116 21.37370584 8.15292257 26.85133005 1.9609375 33.80078125 C-5.15444712 40.80078125 -5.15444712 40.80078125 -8.0390625 40.80078125 C-8.2659375 41.37828125 -8.4928125 41.95578125 -8.7265625 42.55078125 C-10.38754472 45.39817934 -12.35430811 46.92145318 -15.0390625 48.80078125 C-15.6990625 48.80078125 -16.3590625 48.80078125 -17.0390625 48.80078125 C-17.3690625 49.79078125 -17.6990625 50.78078125 -18.0390625 51.80078125 C-18.6784375 52.25453125 -19.3178125 52.70828125 -19.9765625 53.17578125 C-22.21265248 54.65708793 -22.21265248 54.65708793 -22.9765625 57.17578125 C-24.36006917 60.59385654 -26.25601259 62.4153099 -29.0390625 64.80078125 C-31.2265625 65.67578125 -31.2265625 65.67578125 -33.0390625 65.80078125 C-33.6990625 65.47078125 -34.3590625 65.14078125 -35.0390625 64.80078125 C-34.58800184 59.93640162 -32.5225134 57.67448735 -29.2265625 54.17578125 C-28.73808838 53.65725586 -28.24961426 53.13873047 -27.74633789 52.60449219 C-20.1360135 44.63234764 -11.98715906 37.30484098 -3.1953125 30.65234375 C1.47238667 26.64421077 4.71300451 22.52804412 5.2734375 16.36328125 C4.85126843 11.55055384 3.71673597 9.48442362 0.25 6.16015625 C-6.42213983 0.85220858 -12.80186438 1.16805195 -21.0390625 1.80078125 C-18.08898171 -4.09938033 -5.05277855 -1.99383421 0 0 Z " transform="translate(190.0390625,139.19921875)" style="fill: #FFFFFF;"/><path d="M0 0 C3.5839392 1.27997828 6.20409407 2.7608158 9.125 5.1875 C12.27844549 7.70716478 15.44873218 9.99156305 18.875 12.125 C24.3293277 15.52328668 29.63627125 19.11799202 34.9375 22.75 C35.76685059 23.31734863 36.59620117 23.88469727 37.45068359 24.46923828 C41.90990801 27.53045529 41.90990801 27.53045529 44 29 C44.74580322 29.51336914 45.49160645 30.02673828 46.26000977 30.55566406 C46.83420654 31.03229492 47.40840332 31.50892578 48 32 C48 32.66 48 33.32 48 34 C48.66 34 49.32 34 50 34 C50 34.99 50 35.98 50 37 C44.73405765 36.55333525 42.05699864 34.87951037 38 31.5625 C36.85862567 30.64612244 35.71533034 29.73213339 34.5703125 28.8203125 C33.98411133 28.35141602 33.39791016 27.88251953 32.79394531 27.39941406 C29.89597259 25.13877448 26.88586357 23.04394392 23.875 20.9375 C17.6768973 16.56831754 11.80985815 11.87527068 6 7 C5.33613281 6.47148437 4.67226562 5.94296875 3.98828125 5.3984375 C2.62254777 4.30967095 1.3034858 3.16256841 0 2 C0 1.34 0 0.68 0 0 Z " transform="translate(120,134)" style="fill: #FFFFFF;"/></svg>`,
    "name": "T"
  }]
  let allFiles = [];

  for (let i = 0; i < allSVGs.length; i++) {
    const element = allSVGs[i];
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
    familyName: fontOptions.familyName,
    styleName: fontOptions.styleName,
    unitsPerEm: 1000,
    ascender: 800,
    descender: -800,
    glyphs: glyphs
  });
  const timestamp = Date.now();
  const baseFilename = fontOptions.familyName+"-"+fontOptions.styleName+"_"+timestamp+".otf";

  font.download("./generated/"+baseFilename);
  res.json({
    "file_name":"/generated/"+baseFilename
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})