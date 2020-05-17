const faas = require('./index');

var counter = 0;

test2();

async function test2() {
  let dir = '/home/lukas/Desktop';

  console.log('Starting');

  let options = {simulateCacheUse: {size: 10, dir: '/home/lukas/Desktop/'}, handlerFunction: handler, params: {}};
  await faas.test(options);

  console.log('Done');
}

async function test() {
  console.log('Starting.');

  let options = {simulateRetries: {retries: 5}, handlerFunction: handler, handlerParams: {test: 'test'}, simulateConcurrencyLimit: {random: true}};

  console.log(await faas.test(options));

  console.log('Done.');
}

async function handler(event){
  console.log(event);
  counter++;
  console.log(`Counter: ${counter}`);
  return 'yay'
}
