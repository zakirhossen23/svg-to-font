
let GLOBALS = {
    fontOptions: {
        autoResize: true,
        emSquare: 650
    }
}
function getPath(e, t) {
    if ($(e).is("line"))
        return userModifications(e, new Line(e).convertLineToPath(), t);
    if ($(e).is("path"))
  
        return   convertTransalteToPath(e);
    if ($(e).is("polygon") || $(e).is("polyline"))
        return userModifications(e, convertPolyToPath(e), t);
    if ($(e).is("rect"))
        return userModifications(e, convertRectToPath(e), t);
    if ($(e).is("circle") || $(e).is("ellipse"))
        return userModifications(e, convertCircleToPath(e), t)
}
function Line(e) {
    this.line = e,
        this.strokeWidth = e.getAttribute("stroke-width"),
        this.x1 = parseFloat(e.getAttribute("x1")),
        this.x2 = parseFloat(e.getAttribute("x2")),
        this.y1 = parseFloat(e.getAttribute("y1")),
        this.y2 = parseFloat(e.getAttribute("y2"))
}
function convertPolyToPath(e) {
    var t, i = e.getAttribute("points").split(/\s+|,/), a = "M" + i.shift() + "," + i.shift() + "L" + i.join(" ");
    return "polygon" == e.tagName && (a += "z"),
        a
}
function convertCircleToPath(e) {
    var t = e.getAttribute("cx")
        , i = e.getAttribute("cy")
        , a = e.getAttribute("rx")
        , n = e.getAttribute("ry")
        , o = e.getAttribute("r");
    o > 0 && (a = o,
        n = o);
    var r = "M" + (t - a) + "," + i;
    return r += "a" + a + "," + n + " 0 1,0 " + 2 * a + ",0",
        r += "a" + a + "," + n + " 0 1,0 " + -2 * a + ",0"
}
function convertRectToPath(e) {
    var t = e.ownerSVGElement.namespaceURI
        , i = document.createElementNS(t, "path")
        , a = e.getAttribute("height")
        , n = e.getAttribute("width")
        , o = parseFloat(e.getAttribute("x"))
        , r = parseFloat(e.getAttribute("y"))
        , s = e.getAttribute("rx")
        , l = e.getAttribute("ry")
        , c = a - 2 * (null != l ? l : 0)
        , p = n - 2 * (null != s ? s : 0)
        , i = "M" + o + "," + (r + (null != l ? l : 0)) + "v" + c + (null != s ? "a" + s + "," + l + " 0 0 0 " + s + "," + l : "") + "h" + p + (null != s ? "a" + s + "," + l + " 0 0 0 " + (s - l) : "") + "v" + -c + (null != s ? "a" + s + "," + l + " 0 0 0 " + -s + "," + -l : "") + "h" + -p + (null != s ? "a" + s + "," + l + " 0 0 0 " + -s + "," + l : "");
    return i
}
function roundToDecimal(e, t) {
    var i = Math.pow(10, t);
    return Math.round(e * i) / i
}
function userModifications(e, t, i) {
    var a = e.getAttribute("class") || ""
        , n = parseFloat(e.getAttribute("data-left")) || 0
        , o = parseFloat(e.getAttribute("data-top")) || 0
        , r = parseInt(e.getAttribute("data-rotate")) || 0
        , s = e.getAttribute("data-flip") || ""
        , l = e.getAttribute("data-scaleX") || 1
        , c = e.getAttribute("data-scaleY") || 1
        , p = "";

    return t = Raphael.transformPath(t, p)
}

function convertTransalteToPath(elm) {
    let pathData = elm.getAttribute("d");
    let translate = elm.getAttribute("transform");
    if (translate == null) return pathData;
    var translateValues = translate.replaceAll("translate(","").replaceAll(")","").split(",");

    var tx = parseFloat(translateValues[0]);
    var ty = parseFloat(translateValues[1]);
    var matrixString = "matrix(1 0 0 1 " + tx + " " + ty + ")";

    // Apply the matrix to the path data
    var modifiedPathData = Snap.path.map(pathData, Snap.matrix(1, 0, 0, 1, tx, ty));

    return modifiedPathData.toString();
}

function createPath(e) {
    var t = ""
        , i = 0;
    if ($(e).find("*").each(function (e, a) {
        var n = getPath(a);
        $.trim(n).length > 0 && (t += " " + n,
            i++)
    }),
        "" != (t = $.trim(t))) {
        if (GLOBALS.fontOptions.autoResize) {
            t = Raphael.pathToRelative(t);
            var a = Raphael.pathBBox(t)
                , n = a.x2 - a.x
                , o = a.y2 - a.y
                , r = GLOBALS.fontOptions.emSquare / n
                , s = GLOBALS.fontOptions.emSquare / o
                , l = s < r ? s : r;
            console.log(l),
                t = Raphael.transformPath(t, "s" + l + ",-" + l);
            var c = Raphael.pathBBox(t)
                , p = -c.x + (GLOBALS.fontOptions.emSquare - parseInt(c.width)) / 2
                , d = -c.y + (GLOBALS.fontOptions.emSquare - parseInt(c.height)) / 2;
            t = Raphael.transformPath(t, "T" + p + "," + d)
        } else
            t = Raphael.transformPath(t, "s1,-1");
        (t = userModifications($(e).find("svg")[0], t)).forEach(function (e, i) {
            e.forEach(function (e, a) {
                if (isNaN(e))
                    return !0;
                t[i][a] = parseFloat(e.toFixed(3))
            })
        })
    }
    t = Raphael.transformPath(t, "s1,-1")
    return t
}
if (typeof module != 'undefined'){

    module.exports = {
        Line,
        convertTransalteToPath,
        convertPolyToPath,
        convertCircleToPath,
        convertRectToPath,
        roundToDecimal,
        userModifications,
        getPath,
        createPath
    };
}