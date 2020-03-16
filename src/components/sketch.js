const width = 700;
const height = 500;
let RADIUS = 20;
let Save = false;
export default function sketch(p) {
  let canvas;

  p.myCustomRedrawAccordingToNewPropsHandler = function(newProps) {
    if (newProps.fillRadius) {
      RADIUS = newProps.fillRadius;
    }
    if (newProps.Save) {
      window.localStorage.clear('map');
      const image1 = p.get(0, 0, width, height);
      image1.loadPixels();
      const px = [];
      for (var i = 0; i < image1.pixels.length; i += 4) {
        const R = image1.pixels[i];
        const G = image1.pixels[i + 1];
        const B = image1.pixels[i + 2];
        px.push([R, G, B]);
      }
      console.log('Saved');
      window.localStorage.setItem('map', JSON.stringify({ value: px }));
    }
  };

  p.setup = () => {
    canvas = p.createCanvas(width, height);
    p.noStroke();
    p.background(255);
  };

  p.draw = () => {
    p.noStroke();
    if (p.mouseIsPressed) {
      p.ellipse(p.mouseX, p.mouseY, RADIUS, RADIUS);
      p.fill('black');
    }
  };
}
