function uid() {
  var uuidTemplate = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
  return uuidTemplate.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      var v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
  });
}

class Neuron {
  id;
  bias;
  squash;
  cost;
  incoming;
  outgoing;
  _output;
  output;
  error;
  _error;
  constructor(bias) {
      this.id = uid();
      this.bias = bias == undefined ? Math.random() * 2 - 1 : bias;
      this.squash;
      this.cost;
      this.incoming = {
          targets: {},
          weights: {},
      };
      this.outgoing = {
          targets: {},
          weights: {},
      };
      this._output;
      this.output;
      this.error;
      this._error;
  }
  connect(neuron, weight) {
      this.outgoing.targets[neuron.id] = neuron;
      neuron.incoming.targets[this.id] = this;
      this.outgoing.weights[neuron.id] = neuron.incoming.weights[this.id] =
          weight == undefined ? Math.random() * 2 - 1 : weight;
  }
  activate(input) {
      const self = this;
      function sigmoid(x) {
          return 1 / (1 + Math.exp(-x));
      }
      function _sigmoid(x) {
          return sigmoid(x) * (1 - sigmoid(x));
      }
      if (input != undefined) {
          this._output = 1;
          this.output = input;
      }
      else {
          const sum = Object.keys(this.incoming.targets).reduce(function (total, target, index) {
              return (total +=
                  self.incoming.targets[target].output * self.incoming.weights[target]);
          }, this.bias);
          this._output = _sigmoid(sum);
          this.output = sigmoid(sum);
      }
      return this.output;
  }
  propagate(target, rate = 0.3) {
      const self = this;
      const sum = target == undefined
          ? Object.keys(this.outgoing.targets).reduce(function (total, target, index) {
              self.outgoing.targets[target].incoming.weights[self.id] =
                  self.outgoing.weights[target] -=
                      rate * self.outgoing.targets[target].error * self.output;
              return (total +=
                  self.outgoing.targets[target].error *
                      self.outgoing.weights[target]);
          }, 0)
          : this.output - target;
      this.error = sum * this._output;
      this.bias -= rate * this.error;
      return this.error;
  }
}
class Network {
  inputs;
  hiddens;
  outputs;
  constructor(inputs = [], hiddens = [], outputs = []) {
      this.inputs = inputs;
      this.hiddens = hiddens;
      this.outputs = outputs;
  }
  connectAll() {
      this.inputs.forEach((input, i) => {
          this.hiddens.forEach((hidden, j) => {
              this.inputs[i].connect(this.hiddens[j]);
          });
      });
      this.hiddens.forEach((hidden, i) => {
          this.outputs.forEach((output, j) => {
              this.hiddens[i].connect(this.outputs[j]);
          });
      });
  }
  activate(input) {
      this.inputs.forEach((neuron, i) => neuron.activate(input[i]));
      this.hiddens.forEach((neuron) => neuron.activate());
      return this.outputs.map((neuron) => neuron.activate());
  }
  propagate(target) {
      this.outputs.forEach((neuron, t) => neuron.propagate(target[t]));
      this.hiddens.forEach((neuron) => neuron.propagate());
      return this.inputs.forEach((neuron) => neuron.propagate());
  }
  train(iterations = 1, dataset) {
      while (iterations > 0) {
          dataset.map((datum) => {
              this.activate(datum.inputs);
              this.propagate(datum.outputs);
          });
          iterations--;
      }
  }
}
