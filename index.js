// FaaS-Test can help to test FaaS functions for errors that occur when using
// resources use like memory and cache.

'use strict';

// uses fs to write to cache directory
const fs = require('fs');

// persists allocations to memory
const allocated = [];

// export interal functions
exports.test = test;
exports.simulateColdStart = simulateColdStart;
exports.simulateTimeout = simulateTimeout;
exports.simulateRetries = simulateRetries;
exports.simulateConcurrencyLimit = simulateConcurrencyLimit;
exports.simulateCacheUse = simulateCacheUse;
exports.simulateMemoryUse = simulateMemoryUse;

// main function, sets up and runs tests based on user-selected options
async function test(options = {}) {
  if (options.simulateConcurrencyLimit != undefined) {
    await simulateConcurrencyLimit(
      options.simulateConcurrencyLimit.random
    );
  }

  if (options.simulateColdStart != undefined) {
    await simulateColdStart(
      options.simulateColdStart.max,
      options.simulateColdStart.min,
      options.simulateColdStart.exact
    );
  }

  if (options.simulateTimeout != undefined) {
    await simulateTimeout(
      options.simulateTimeout.timeoutInMinutes,
      options.simulateTimeout.random
    );
  }

  if (options.simulateCacheUse != undefined) {
    simulateCacheUse(
      options.simulateCacheUse.size,
      options.simulateCacheUse.dir
    );
  }

  if (options.simulateMemoryUse != undefined) {
    simulateMemoryUse(
      options.simulateMemoryUse.size
    );
  }

  if (options.simulateRetries != undefined) {
    return await simulateRetries(
      options.simulateRetries.retries,
      options.handlerFunction,
      options.handlerParams
    )
  } else {
    return await runFunction(
      options.handlerFunction,
      options.handlerParams
    );
  }
}

// Function helps to set up a configurable cold start test.
// Parameters:
// max -> maximum cold start time in ms
// min -> minimum cold start time in ms
// exact -> boolean, if true cold start time will be max time exactly, if false
//          cold start time will be chosen randomly between min and max
async function simulateColdStart(max = 2000, min = 0, exact = false) {
  let time = exact ? max : randomInt(min, max);

  console.log(`Delaying function start by ${time}ms.`);

  return sleep(time);
}

// Function tests function timeout by delaying code execution.
// Parameters:
// timeoutInMinutes -> configurable delay in minutes
// random -> boolean, if true the function will time out half of the time, if
//           false function will always time out
async function simulateTimeout(timeoutInMinutes = 20, random = false) {
  console.log(`Forcing function to time out. Timeout in minutes: ${timeoutInMinutes}.`);

  if (random) {
    if (Math.random() > 0.5) { return; }
  }

  return sleep(timeoutInMinutes * 60 * 1000);
}

// Function simulates automatic retries by executing the handler function
// multiple times before returning the final result.
// Parameters:
// retryCount -> number of retries
// handlerFunction -> reference to handler function in code
// handlerParams -> parameters for handler function as one object
async function simulateRetries(retryCount = 3, handlerFunction, handlerParams) {
  console.log(`Running handler ${retryCount} times before returning data.`);

  for (let i = 0; i < (retryCount - 1); i++) {
    await runFunction(handlerFunction, handlerParams);
  }

  return await runFunction(handlerFunction, handlerParams);
}

// Function simulates limited concurrency by throwing an exception which
// stops the function before returning any data.
// Parameters:
// random -> boolean, if true the function will fail half of the time, if
//           false function will always fail
async function simulateConcurrencyLimit(random = false) {
  console.log(`Concurrency limit forces function to fail${random ? ' randomly.' : '.'}`);

  if (random) {
    if (Math.random() > 0.5) { return; }
  }

  throw new Error('Concurrency limit');
}

// Function writes data to cache directory.
// NOTE: Filling the cache may take some time, which is added to any simulated
// cold start time and the time the function needs itself. This will also remove
// any file called "tempfile" in the given directory.
// Parameters:
// size -> file size in megabyte
// dir -> directory to write file to (no trailing /)
async function simulateCacheUse(size = 0, dir = '/tmp') {
  // generates 1 meg of data
  let data = generateData(1000000);

  console.log(`Writing ${size} megabyte file to directory ${dir}.`);

  // remove file if it already exists.
  if (fs.existsSync(`${dir}/tempfile`)) {
    fs.unlinkSync(`${dir}/tempfile`);
  }

  for (let i = 0; i < size; i++) {
    // appends data to existing file (creates new file if necessary)
    fs.appendFileSync(`${dir}/tempfile`, data);
  }
}

// Function writes random data to memory.
// NOTE: Filling memory may take some time, which is added to any simulated
// cold start time and the time the function needs itself.
// Parameters:
// size -> amount of memory to use in megabyte
async function simulateMemoryUse(size = 0) {
  console.log(`Ẁriting ${size} megabyte to memory.`);

  for (let i = 0; i < size; i++) {
    // allocates 1 meg of memory
    let allocation = allocateMemory(1000000);
    allocated.push(allocation);
  }
}

// helper function to run another functions with parameters
// Parameters:
// fun -> reference to function to run
// params -> parameters to run function with
async function runFunction(fun, params) {
  let result = await fun(params);
  return result;
}

// helper function returns a promise that will resolve after a set amount
// of time
// Parameters:
// ms -> sleep time in ms
function sleep(ms) {
  if (ms > 0) {
    return new Promise(resolve => setTimeout(() => { resolve(ms) }, ms));
  } else {
    // promise resolves immediately if ms <= 0
    return new Promise(resolve => resolve(ms));
  }
}

// helper function to return a random integer
// Parameters:
// min -> minimum integer value
// max -> maximum integer value
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

// helper function that generates random data
// Parameters:
// size -> data size in bytes
function generateData(size) {
  var chars = 'abcdefghijklmnopqrstuvwxyz'.split('');
  var len = chars.length;
  var random_data = [];

  while (size--) {
    random_data.push(chars[Math.random() * len | 0]);
  }

  return random_data.join('');
}

// helper function used to allocate memory
// Parameters:
// size -> memory to allocate in bytes
function allocateMemory(size) {
  const numbers = size / 8;
  const arr = []

  arr.length = numbers;

  for (let i = 0; i < numbers; i++) {
    arr[i] = i;
  }

  return arr;
};
