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
        canvas = createCanvas(500, 500);
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
      console.log('stuff askjsadkjhasd');

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


Heat.prototype.draw2 = function() {
  var that = this;
return new Promise(function(fulfill, reject){
  fs.readFile(__dirname + '/base.png', function(err, data) {
    if (err) reject(err);
      var width = that.canvas.width;
      var height = that.canvas.height;
      var ctx = that.alphaCanvas.getContext('2d');
      var img = new Canvas.Image;
      img.src = data;


      that.canvas.getContext('2d').drawImage(img,0,0,img.width,img.height);
      
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
  });
});
}
