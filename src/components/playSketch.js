import { Network, Layer } from 'synaptic';
const width = 700;
const height = 500;

const getRadian = angle => (angle * Math.PI) / 180;

class Sensor {
  constructor(angle, long) {
    this.sensorAngle = angle;
    this.maxDistance = long;
  }
  // maxDistance = 100;
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
    this.acc = 0.3;
    this.angle = 0;
    this.sensors = [new Sensor(30, 60), new Sensor(-30, 60), new Sensor(0, 100)];
  }

  speedUp = x => {
    this.speed = Math.min(this.maxSpeed, (this.speed += x / 2));
  };
  speedDown = x => {
    this.speed = Math.max(0.3, (this.speed -= this.acc));
  };
  steerLeft = x => {
    this.angle = (this.angle - x * 10) % 360;
  };
  steerRight = x => {
    this.angle = (this.angle + x * 10) % 360;
  };

  update = worldPixels => {
    this.y += this.speed * Math.sin(getRadian(this.angle));
    this.x += this.speed * Math.cos(getRadian(this.angle));

    const sensorData = this.collectSensorData(worldPixels);

    if (sensorData[0] <= 0.12 || sensorData[1] <= 0.12 || sensorData[2] <= 0.12) {
      this.reset();
    }

    if (sensorData[0] <= 0.8) {
      // console.log(sensorData[0]);
      this.steerLeft(1 - sensorData[0]);
    }
    if (sensorData[1] <= 0.8) {
      this.steerRight(1 - sensorData[1]);
    }
    if (sensorData[2] <= 0.6) {
      this.speedDown();
    } else {
      this.speedUp(sensorData[2]);
    }

    // console.log(sensorData);
  };
  collectSensorData = worldPixels => {
    return this.sensors.map((sensor, index) => sensor.getValue(worldPixels, this.x, this.y, this.angle, index));
  };
}

export default function algoritmSketch(p) {
  let canvas;
  let image;
  let worldPixels;
  const car = new Car('blue');
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
    if (p.keyIsDown(87)) {
      car.speedUp();
    }
    if (p.keyIsDown(83)) {
      car.speedDown();
    }
    if (p.keyIsDown(65)) {
      car.steerLeft();
    }
    if (p.keyIsDown(68)) {
      car.steerRight();
    }

    car.update(worldPixels);
  };
}
