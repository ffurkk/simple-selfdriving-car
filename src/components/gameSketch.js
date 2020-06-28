import furkiNeuralNetwork from '../lib/furkiNeuralNetwork';
const width = 700;
const height = 500;

const getRadian = angle => (angle * Math.PI) / 180;

class Sensor {
  constructor(angle) {
    this.sensorAngle = angle;
  }
  maxDistance = 50;
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
function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
class Car {
  constructor(brain) {
    this.isDead = false;
    this.age = 0;
    this.x = 30;
    this.y = 30;
    this.width = 10;
    this.height = 8;
    this.maxSpeed = 10;
    this.speed = 3;
    this.acc = 0.1;
    this.angle = 0;
    this.sensors = [new Sensor(30), new Sensor(-30), new Sensor(0)];
    this.brain = brain ? brain.copy() : new furkiNeuralNetwork(3, 8, 2);
    this.color = getRandomColor();
  }

  speedUp = () => {
    this.speed = Math.min(this.maxSpeed, (this.speed += this.acc));
  };
  speedDown = () => {
    this.speed = Math.max(1, (this.speed -= this.acc));
  };

  justSteer = x => {
    this.angle = (this.angle + x * 40) % 360;
  };

  mutate = () => {
    this.brain.mutate(x => {
      if (Math.random() < 0.1) {
        let offset = (Math.random() * 2 - 1) / 4;
        return x + offset;
      } else {
        return x;
      }
    });
  };

  drawCar = p => {
    p.rectMode(p.CENTER);
    p.stroke(0);
    p.translate(this.x, this.y);
    p.angleMode(p.DEGREES);
    p.rotate(this.angle);

    //Araba
    p.fill(this.color);
    p.rect(0, 0, this.width, this.height);

    //Farlar
    p.fill(0, 0, 0);
    p.rect(this.width / 2 - 3, this.height / 4, 2, 1);
    p.rect(this.width / 2 - 3, -this.height / 4, 2, 1);

    p.fill('black');
    this.sensors.map((s, index) => {
      index !== 0 && p.rotate(this.angle);

      p.stroke('rgba(255, 0, 0, 0.3)');
      p.line(0, 0, s.maxDistance * Math.cos(getRadian(s.sensorAngle)), s.maxDistance * Math.sin(getRadian(s.sensorAngle)));
      p.fill('yellow');
      p.rotate(-this.angle);

      p.rect(s.foundX - this.x, s.foundY - this.y, 2, 2);
    });
    // p.rotate(-this.angle);

    p.translate(-this.x, -this.y);

    p.angleMode(p.RADIANS);
  };

  update = (brain, worldPixels) => {
    this.y += this.speed * Math.sin(getRadian(this.angle));
    this.x += this.speed * Math.cos(getRadian(this.angle));

    const sensorData = this.collectSensorData(worldPixels);

    if ((sensorData[0] <= 0.1 || sensorData[1] <= 0.1, sensorData[2] <= 0.1)) {
      this.isDead = true;
    }
    this.age += 1;
    let [output1, output2] = brain.feedforward(sensorData);

    this.justSteer(output2 - output1);
  };
  collectSensorData = worldPixels => {
    return this.sensors.map((sensor, index) => sensor.getValue(worldPixels, this.x, this.y, this.angle, index));
  };
}

export default function gameSketch(p) {
  let canvas;
  let image;
  let worldPixels;
  let cars = [];
  let deadCars = [];
  for (let index = 0; index < 100; index++) {
    cars.push(new Car());
  }
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

  function startGame(brain) {
    for (let index = 0; index < 70; index++) {
      cars.push(new Car(brain));
      cars[index].mutate();
    }
  }

  p.draw = () => {
    p.update();
    if (image) {
      p.image(image, 0, 0, width, height);
    }
    deadCars.push(...cars.filter(cars => cars.isDead));
    cars = cars.filter(c => !c.isDead);
    if (cars.length === 0) {
      deadCars.sort((a, b) => b.age - a.age);
      const strongest = deadCars[0];
      startGame(strongest.brain);

      deadCars = [];
      deadCars.push(strongest);
    }
    cars.forEach(car => car.drawCar(p));
  };

  p.update = () => {
    cars.forEach(car => {
      if (p.keyIsDown(65)) {
        car.justSteer(-0.1);
      }
      if (p.keyIsDown(68)) {
        car.justSteer(0.1);
      }
      car.update(car.brain, worldPixels);
    });
  };
}
