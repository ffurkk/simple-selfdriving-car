import Matrix from './matrixHelper';

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}
function deSigmoid(y) {
  return y * (1 - y);
}

export default class furkiNeuralNetwork {
  constructor(inputs, hiddens, outputs) {
    if (inputs instanceof furkiNeuralNetwork) {
      this.input_nodes = inputs.input_nodes;
      this.hidden_nodes = inputs.hidden_nodes;
      this.output_nodes = inputs.output_nodes;

      this.weights_ih = inputs.weights_ih.copy();
      this.weights_ho = inputs.weights_ho.copy();

      this.bias_h = inputs.bias_h.copy();
      this.bias_O = inputs.bias_O.copy();
    } else {
      this.input_nodes = inputs;
      this.hidden_nodes = hiddens;
      this.output_nodes = outputs;

      this.weights_ih = new Matrix(this.hidden_nodes, this.input_nodes);
      this.weights_ho = new Matrix(this.output_nodes, this.hidden_nodes);
      this.weights_ih.randomize();
      this.weights_ho.randomize();

      this.bias_h = new Matrix(this.hidden_nodes, 1);
      this.bias_O = new Matrix(this.output_nodes, 1);
      this.bias_h.randomize();
      this.bias_O.randomize();
      this.learningRate = 0.1;
    }
  }

  feedforward(input_array) {
    //Generate Hidden Outputs
    let inputs = Matrix.fromArray(input_array);
    let hidden = Matrix.multiply(this.weights_ih, inputs);
    hidden.add(this.bias_h);

    //activation function
    hidden.change(sigmoid);

    //Generate output's output
    let output = Matrix.multiply(this.weights_ho, hidden);
    output.add(this.bias_O);
    output.change(sigmoid);

    // send back
    return this.softMax(output.toArray());
  }

  softMax(data) {
    let total = 0;
    for (let i = 0; i < data.length; i++) {
      total += data[i];
    }

    for (let t = 0; t < data.length; t++) {
      data[t] = data[t] / total;
    }

    return data;
  }

  train(input_array, target_array) {
    console.log('girdim');

    //Generate Hidden Outputs
    let inputs = Matrix.fromArray(input_array);
    let hidden = Matrix.multiply(this.weights_ih, inputs);
    hidden.add(this.bias_h);

    //activation function
    hidden.change(sigmoid);

    //Generate output's output
    let outputs = Matrix.multiply(this.weights_ho, hidden);
    outputs.add(this.bias_O);
    outputs.change(sigmoid);

    // Convert array 2 matrix
    let targets = Matrix.fromArray(target_array);

    //Calculate error
    let output_errors = Matrix.subtract(targets, outputs);
    // let gradient = outputs * (1 - outputs);

    let gradients = Matrix.change(outputs, deSigmoid);

    gradients.multiply(output_errors);
    gradients.multiply(this.learningRate);

    //Calc deltas
    let hiddden_trans = Matrix.transpose(hidden);
    let weight_ho_deltas = Matrix.multiply(gradients, hiddden_trans);

    // add weight deltas 2 weight
    this.weights_ho.add(weight_ho_deltas);
    //add gradient 2 bias
    this.bias_O.add(gradients);

    //Calcualte hidden layer errorws
    let weight_ho_trans = Matrix.transpose(this.weights_ho);
    let hidden_errors = Matrix.multiply(weight_ho_trans, output_errors);

    //calculate hidden gradient
    let hidden_gradient = Matrix.change(hidden, deSigmoid);
    hidden_gradient.multiply(hidden_errors);
    hidden_gradient.multiply(this.learningRate);

    // calculate input 2 hidden deltas
    let input_trans = Matrix.transpose(inputs);
    let weight_ih_deltas = Matrix.multiply(hidden_gradient, input_trans);

    this.weights_ih.add(weight_ih_deltas);

    //add gradient 2 bias
    this.bias_h.add(hidden_gradient);
  }

  // neuro evulation

  copy() {
    return new furkiNeuralNetwork(this);
  }

  mutate(func) {
    this.weights_ih.change(func);
    this.weights_ho.change(func);
    this.bias_O.change(func);
    this.bias_h.change(func);
  }
}
