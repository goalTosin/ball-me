const computerOpp = new Network();
computerOpp.hiddens = [
  new Neuron(),
  new Neuron(),
  new Neuron(),
  new Neuron(),
  new Neuron(),
  new Neuron(),
];
computerOpp.inputs = [
  new Neuron(),
  new Neuron(),
  new Neuron(),
  new Neuron(),
  new Neuron(),
  new Neuron(),
];
computerOpp.outputs = [
  new Neuron(),
  new Neuron(),
];
computerOpp.connectAll();
async function trainComp() {
  const data = await fetch('./train.json')
  const train = await data.json()
  // console.log(train);
  computerOpp.train(500, train);
}
trainComp()