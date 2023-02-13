const { createCanvas, registerFont } = require('canvas');
registerFont('Iansui094-Regular.ttf', { family: 'Lansui' })


module.exports = function create_image(text, time, callback) {
    const canvas = createCanvas(1000, 1000)
    var ctx = canvas.getContext('2d');
    
    ctx.fillStyle = "#c5bfe5";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "black";
    ctx.textAlign = 'center';
    
    var fontsize;
    var lineHeight = 60;
    var lines = getWrapText(text, 250)
    
    fontsize = 40 - 3 * (lines.length - 1)
    
    ctx.font = `${fontsize}px "Lansui"`;
    
    let y = 400 - 20 * (lines.length - 1);
    for (let i = 0; i < lines.length; i++) {
      y += lineHeight;
      ctx.fillText(lines[i], 500, y);
    }
    
    ctx.fillStyle = "#525252";
    ctx.font = '40px "Lansui"';
    ctx.textAlign = 'center';
    ctx.fillText('@anony_.dhjh', 500, 900)
    ctx.fillText(time, 500, 100);

    const m = Math.floor(Date.now() / 1000)
    const buffer = canvas.toBuffer("image/jpeg");
    const fs = require("fs");
    fs.writeFileSync(`./assets/${m}.jpeg`, buffer);
    
    function getWrapText(txt = "", maxWidth = 200) {
        let txtList = [];
        let str = "";
        for (let i = 0, len = txt.length; i < len; i++) {
          str += txt.charAt(i);
          if (ctx.measureText(str).width > maxWidth) {
            txtList.push(str.substring(0, str.length - 1))
            str = ""
            i--
          }
        }
        txtList.push(str)
        return txtList;
    }
    return callback(m);
};