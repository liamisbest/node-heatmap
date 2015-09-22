var convert = require('color-convert');
var fs = require('fs');

if (process.argv) {
    var Canvas = (require)('canvas');
}

function createCanvas (width, height) {
    if (typeof Canvas !== 'undefined') {
        return new Canvas(width, height);
    }
    else {
        var canvas = document.createElement('canvas');
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
        // var ctx = canvas.getContext('2d');

        // fs.readFile(__dirname + '/base.png', function(err, data) {
        //   if (err) throw err;
        //   var img = new Canvas.Image; // Create a new Image
        //   img.src = data;

        //   // Initialiaze a new Canvas with the same dimensions
        //   // as the image, and get a 2D drawing context for it.
        //   var ctx = canvas.getContext('2d');
        //   ctx.drawImage(img, 0, 0, img.width / 4, img.height / 4);
        // });


        return canvas;
    }
}

var exports = module.exports = function (canvas) {
    var opts = {};
    
    if (typeof canvas !== 'object') {
        canvas = createCanvas(arguments[0], arguments[1]);
        opts = arguments[2] || {};
    }
    else if (!canvas) {
        canvas = createCanvas(464, 464);
    }
    else if (Object.getPrototypeOf(canvas) === Object.prototype) {
        opts = canvas;
        if (opts.canvas) {
            canvas = opts.canvas;
        }
        else if (opts.width && opts.height) {
            canvas = createCanvas(opts.width, opts.height);
        }
    }
    return new Heat(canvas, opts)
};

exports.Heat = Heat;

function Heat (canvas, opts) {
    if (!opts) opts = {};
    
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    
    this.alphaCanvas = createCanvas(this.width, this.height);
    this.radius = opts.radius || 20;
    this.threshold = opts.threshold || 0;
    this.scalar = { x : 1, y : 1 };

    var ctx = canvas.getContext('2d');

    fs.readFile(__dirname + '/base.png', function(err, data) {
      if (err) throw err;
      var img = new Canvas.Image; // Create a new Image
      img.src = data;
      // console.log('stuff askjsadkjhasd');

      // Initialiaze a new Canvas with the same dimensions
      // as the image, and get a 2D drawing context for it.
      ctx.drawImage(img, 0, 0, img.width / 4, img.height / 4);
    });

}

Heat.prototype.scale = function (x, y) {
    if (y === undefined) y = x;
    
    this.scalar.x = x;
    this.scalar.y = y;
    
    this.canvas.width = this.width * x;
    this.canvas.height = this.height * y;
    
    this.canvas.getContext('2d').scale(x, y);
    
    return this;
};

Heat.prototype.addPoint = function (x, y, params) {
    var ctx = this.alphaCanvas.getContext('2d');
    if (typeof params === 'number') {
        params = { radius : params };
    }
    if (!params) params = {};
    var radius = params.radius || this.radius;
    
    var g = ctx.createRadialGradient(x, y, 0, x, y, radius);
    var a = params.weight || (1 / 10);
    
    g.addColorStop(0, 'rgba(255,255,255,' + a + ')');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    
    ctx.fillStyle = g;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    
    return this;
};

Heat.prototype.draw = function () {
    var width = this.canvas.width;
    var height = this.canvas.height;
    var ctx = this.alphaCanvas.getContext('2d');
    
    var values = ctx.getImageData(0, 0, this.width, this.height);
    var heat = ctx.createImageData(width, height);
    
    for (var hy = 0; hy < height; hy++) {
        var vy = Math.floor(hy / this.scalar.y);
        
        for (var hx = 0; hx < width; hx++) {
            var vx = Math.floor(hx / this.scalar.x);
            var vi = 4 * (vy * this.width + vx);
            var hi = 4 * (hy * width + hx);
            
            var v = values.data[vi + 3];
            if (v > this.threshold) {
                var theta = (1 - v / 255) * 270;
                var rgb = convert.hsl2rgb(theta, 100, 50);
                heat.data[hi] = rgb[0];
                heat.data[hi+1] = rgb[1];
                heat.data[hi+2] = rgb[2];
                heat.data[hi+3] = v;
            }
        }
    }
    
    this.canvas.getContext('2d').putImageData(heat, 0, 0);
    
    return this;
};

var prodPoints = [{
	diameter: 131,
	midX: 302,
	midY: 292,
	usePoint: {x: 358, y: 350}
},
{
	diameter: 133,
	midX: 320,
	midY: 212,
	usePoint: {x: 395, y: 190}
},
{
	diameter: 129,
	midX: 276,
	midY: 146,
	usePoint: {x: 303, y: 79}
},
{
	diameter: 124,
	midX: 189,
	midY: 146,
	usePoint: {x: 158, y: 80}
},
{
	diameter: 128,
	midX: 138,
	midY: 211,
	usePoint: {x: 66, y: 188}
},
{
	diameter: 127,
	midX: 138,
	midY: 282,
	usePoint: {x: 69, y: 296}
},
{
	diameter: 126,
	midX: 202,
	midY: 338,
	usePoint: {x: 130, y: 376}
}];

var jBounds = {
  top: 133,
  left: 133,
  width: 193,
  height: 193
};

Heat.prototype.draw2 = function(inp) {
  var that = this;
return new Promise(function(fulfill, reject){
  var user = inp.user;
  fs.readFile(__dirname + '/base.png', function(err, data) {
    if (err) reject(err);
      var width = that.canvas.width;
      var height = that.canvas.height;
      var ctx = that.alphaCanvas.getContext('2d');
      var img = new Canvas.Image;
      img.src = data;

      that.canvas.getContext('2d').drawImage(img,0,0,img.width,img.height);

      var startAngle = 0;
      var endAngle = 359;

      var userProds = JSON.parse(inp.data.physicalIndicators);

      for (var i = 0; i < prodPoints.length; i++) {
        var pt = prodPoints[i];

        var radius = pt.diameter/2;

        // DWELL
        // Add random points of data
        var randLen = Math.abs(userProds[i+1].dwell);

        for (var k = 0; k < randLen; k++) {
          var randAngle  = startAngle + Math.random()*( endAngle - startAngle );
          var randRadius = Math.random()*radius;

          var randX = pt.midX + randRadius * Math.cos(randAngle);
          var randY = pt.midY + randRadius * Math.sin(randAngle);

          that.addPoint(randX,randY,{weight:0.15, radius: 40});
        }

        // INTERACTION
        for (var a = 0; a < userProds[i+1].interaction; a++) {
          that.addPoint(pt.usePoint.x, pt.usePoint.y, { weight: 0.125, radius: 60 });
        }

      }

      // JOURNEY
      for (var f = 0; f < inp.user.Journeys.length; f++){
        var j = inp.user.Journeys[f];
        
        var pX = jBounds.left + (jBounds.width * j.x);
        var pY = jBounds.top + (jBounds.height * j.y);

        that.addPoint(pX, pY, { weight: 0.15, radius: 40 });
      }
      

      // Convert points to heat blobs
      var values = ctx.getImageData(0, 0, that.width, that.height);
      var heat = ctx.createImageData(width, height);

      for (var hy = 0; hy < height; hy++) {
          var vy = Math.floor(hy / that.scalar.y);    
          
          for (var hx = 0; hx < width; hx++) {
              var vx = Math.floor(hx / that.scalar.x);
              var vi = 4 * (vy * that.width + vx);
              var hi = 4 * (hy * width + hx);
              
              var v = values.data[vi + 3];
              if (v > that.threshold) {
                  var theta = (1 - v / 255) * 270;
                  var rgb = convert.hsl2rgb(theta, 100, 50);
                  heat.data[hi] = rgb[0];
                  heat.data[hi+1] = rgb[1];
                  heat.data[hi+2] = rgb[2];
                  heat.data[hi+3] = v;
              }
          }
      }
      
      that.canvas.getContext('2d').globalCompositeOperation = 'destination-over';
      that.canvas.getContext('2d').putImageData(heat, 0, 0);
      that.canvas.getContext('2d').drawImage(img,0,0,img.width,img.height);
      fulfill(that);
      that = null;
  });
});
}
