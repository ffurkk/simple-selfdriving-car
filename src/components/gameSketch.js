import { Network, Layer } from 'synaptic';
const width = 700;
const height = 500;

const getRadian = angle => (angle * Math.PI) / 180;

class NeuralNetwork {
  constructor() {
    var inputLayer = new Layer(3);
    var hiddenLayer = new Layer(10);
    var hiddenLayer2 = new Layer(10);
    var outputLayer = new Layer(3);
    inputLayer.project(hiddenLayer);
    hiddenLayer.project(hiddenLayer2);
    hiddenLayer2.project(outputLayer);

    this.nn = new Network({
      input: inputLayer,
      hidden: [hiddenLayer, hiddenLayer2],
      output: outputLayer,
    });
  }
}
class Sensor {
  constructor(angle) {
    this.sensorAngle = angle;
  }
  maxDistance = 60;
  targetX;
  targetY;
  foundX = 0;
  foundY = 0;

  findIntersection = (counter, worldPixels, carX, carY, targetX, targetY, carAngle) => {
    const pixel = worldPixels[Math.floor(carY) * width + Math.floor(carX)];
    if (counter > this.maxDistance) {
      return false;
    }

    if (pixel && pixel[0] !== 0) {
      return this.findIntersection(
        counter + 1,
        worldPixels,
        carX + 1 * Math.cos(getRadian(carAngle + this.sensorAngle)),
        carY + 1 * Math.sin(getRadian(carAngle + this.sensorAngle)),
        targetX,
        targetY,
        carAngle,
      );
    }

    return [carX, carY];
  };

  getValue = (worldPixels, carX, carY, carAngle) => {
    this.targetX = carX + this.maxDistance * Math.cos(getRadian(carAngle + this.sensorAngle));
    this.targetY = carY + this.maxDistance * Math.sin(getRadian(carAngle + this.sensorAngle));

    if (worldPixels) {
      const result = this.findIntersection(0, worldPixels, carX, carY, this.targetX, this.targetY, carAngle);

      const [foundX, foundY] = result ? result : [this.targetX, this.targetY];
      this.foundX = foundX;
      this.foundY = foundY;

      return Math.min(1, Math.sqrt(Math.pow(carX - foundX, 2) + Math.pow(carY - foundY, 2)) / this.maxDistance);
    }
    return 0;
  };
}
class Car {
  constructor(params) {
    this.reset();
    this.glassColor = params;
  }
  reset() {
    this.x = 50;
    this.y = 100;
    this.width = 40;
    this.height = 26;
    this.maxSpeed = 3;
    this.speed = 1;
    this.acc = 0.1;
    this.angle = 0;
    this.sensors = [new Sensor(30), new Sensor(-30), new Sensor(0)];
  }

  speedUp = () => {
    this.speed = Math.min(this.maxSpeed, (this.speed += this.acc));
  };
  speedDown = () => {
    this.speed = Math.max(0.3, (this.speed -= this.acc));
  };
  steerLeft = () => {
    this.angle = (this.angle - 4) % 360;
  };
  steerRight = () => {
    this.angle = (this.angle + 4) % 360;
  };

  update = (myNetwork, worldPixels) => {
    this.y += this.speed * Math.sin(getRadian(this.angle));
    this.x += this.speed * Math.cos(getRadian(this.angle));

    const sensorData = this.collectSensorData(worldPixels);
    // console.log(sensorData);

    if (sensorData[0] <= 0.12 || sensorData[1] <= 0.12 || sensorData[2] <= 0.12) {
      this.reset();
    }
    let [output1, output2, output3] = myNetwork.nn.activate(sensorData);
    // console.log([output1, output2, output3]);

    const turn = output1 - output3;

    if (Math.abs(turn) >= 0.00005) {
      if (turn > 0) {
        this.steerRight();
      } else {
        this.steerLeft();
      }
    }

    if (output2 <= 0.8) {
      this.speedDown();
    } else {
      this.speedUp();
    }

    if (sensorData[0] >= 0.8) {
      myNetwork.nn.propagate(0.2, [sensorData[0], 0.8, sensorData[2] - 0.1]);
    }
    if (sensorData[2] == 1) {
      myNetwork.nn.propagate(0.3, [0.5, sensorData[2], 0.5]);
    }
    if (sensorData[1] >= 0.8) {
      myNetwork.nn.propagate(0.2, [sensorData[0] - 0.1, 0.8, sensorData[1]]);
    }
  };
  collectSensorData = worldPixels => {
    return this.sensors.map((sensor, index) => sensor.getValue(worldPixels, this.x, this.y, this.angle, index));
  };
}

export default function gameSketch(p) {
  let canvas;
  let image;
  let worldPixels;
  const car = new Car('blue');
  const myNetwork = new NeuralNetwork();
  p.setup = () => {
    canvas = p.createCanvas(width, height);
    p.noStroke();
    p.background(255);
    worldPixels = JSON.parse(window.localStorage.getItem('map')).value;
    const image1 = p.get(0, 0, width, height);
    image1.loadPixels();

    for (let i = 0; i < image1.pixels.length; i += 4) {
      const startIndex = Math.floor(i / 4);
      image1.pixels[i] = worldPixels[startIndex][0];
      image1.pixels[i + 1] = worldPixels[startIndex][1];
      image1.pixels[i + 2] = worldPixels[startIndex][2];
      image1.pixels[i + 3] = 255;
    }
    image1.updatePixels();
    image = image1;
  };

  function drawCar(car) {
    p.rectMode(p.CENTER);
    p.stroke(0);
    p.translate(car.x, car.y);
    p.angleMode(p.DEGREES);
    p.rotate(car.angle);

    //Araba
    p.fill(200, 200, 200);
    p.rect(0, 0, car.width, car.height);

    //Farlar
    p.fill(0, 0, 0);
    p.rect(car.width / 2 - 3, car.height / 4, 5, 8);
    p.rect(car.width / 2 - 3, -car.height / 4, 5, 8);

    //Cam
    p.fill(car.glassColor);
    p.rect(5, 0, 10, 20);

    p.fill('black');
    car.sensors.map((s, index) => {
      index !== 0 && p.rotate(car.angle);

      p.stroke('red');
      p.line(0, 0, s.maxDistance * Math.cos(getRadian(s.sensorAngle)), s.maxDistance * Math.sin(getRadian(s.sensorAngle)));
      p.fill('yellow');
      p.rotate(-car.angle);

      p.rect(s.foundX - car.x, s.foundY - car.y, 6, 6);
    });
  }
  p.draw = () => {
    p.update();
    if (image) {
      p.image(image, 0, 0, width, height);
    }
    drawCar(car);
  };

  p.update = () => {
    // if (p.keyIsDown(87)) {
    //   car.speedUp();
    // }
    // if (p.keyIsDown(83)) {
    //   car.speedDown();
    // }
    // if (p.keyIsDown(65)) {
    //   car.steerLeft();
    // }
    // if (p.keyIsDown(68)) {
    //   car.steerRight();
    // }

    car.update(myNetwork, worldPixels);
  };
}
