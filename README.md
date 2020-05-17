# FaaS-Test
FaaS-Test is a collection of functions to test FaaS code for resource usage issues. It can be used during unit or integration testing and may be included when deploying a function to a FaaS provider.

## Using FaaS-Test
To use FaaS-Test, follow the instructions below.

### Import
Import the module at the beginning of your code.

```javascript
const faas = require('faas');
```

### Available Functions
#### async test(options)
This function bundles all possible tests into one function invocation. You can use an object to configure all options. This function will also invoke your handler function and return its value. As this is an asynchronous function, you will have to *await* its return value.

Parameters:
* *options* (object): Used to configure each test (default: undefined) Include the following parameters (only handlerFunction and handlerParams are **required**).
  * simulateConcurrencyLimit: {random: false}
  * simulateColdStart: {max: 2000, min: 0, exact: false}
  * simulateTimeout: {timeoutInMinutes: 20}
  * simulateCacheUse: {size: 0, dir: '/tmp'}
  * simulateMemoryUse: {size: 0}
  * simulateRetries: {retries: 3}
  * handlerFunction: oldHandler
  * handlerParams: {}

Example options:
```javascript
let options = {
  simulateConcurrencyLimit: {random: true},
  simulateColdStart: {max: 2000, min: 1000, exact: false},
  simulateTimeout: {timeoutInMinutes: 5},
  simulateCacheUse: {size: 512, dir: '/tmp'},
  simulateMemoryUse: {size: 512},
  simulateRetries: {retries: 3},
  handlerFunction: oldHandler,
  handlerParams: {event: event}
};

return await test(options);
```

#### async simulateColdStart(max, min, exact)
This function can simulate different cold start behavior. By default, the cold start time will be randomly selected between 0 and 2000ms. To use this function, you will have to *await* its return.

Parameters:
* *max* (int): Maximum cold start time in milliseconds (default: 2000)
* *min* (int): Minimum cold start time in milliseconds (default: 0)
* *exact* (boolean): If set to **true**, the simulated cold start time will always be exactly *max* ms. (default: false)

#### async simulateTimeout(timeoutInMinutes, random)
This function can test timeout behavior by blocking the function for a few minutes to force the FaaS platform to time out. By default, the timeout is set to 20 minutes. To use this function, you will have to *await* its return.

Parameters:
* *timeoutInMinutes* (int): Time to block the function for, in minutes (default: 20)
* *random* (boolean): If set to **true** the function will time out about half the time (default: false)

#### async simulateRetries(retryCount, handlerFunction, handlerParams)
This function can force retries to test code idempotency. By default, the handler will be called three times, only the last result will be returned. To use this function, you will need to *await* its return.

Parameters:
* *retryCount* (int): Retry count for the function (default: 3)
* *handlerFunction* (function): Reference to JavaScript function to run (default: undefined)
* *handlerParams* (object): All parameters for the handler function need to be encapsulated in an JavaScript object. Please make sure to modify your handler function to accept this object as an input parameter (default: undefined)

#### async simulateConcurrencyLimit(random)
This function will simply have the function fail randomly (about 50% of all invocations) to simulate a concurrency limit.

Parameters:
* *random* (boolean): If **true**, the invocation will randomly fail about 50% of the time. If **false**, the invocation will always fail.

#### async simulateCacheUse(size, dir)
This function will write random data to the cache directory to test how the FaaS function behaves if the cache is full. NOTE: Writing large amounts of data to storage may take some time. Please *await* this function's return.

Parameters:
* *size* (int): File size to write to the cache directory in megabytes (default: 0)
* *dir* (string): Path to cache directory (default: '/tmp')

#### async simulateMemoryUse(size = 0)
This function will write random data to the memory to test how the FaaS function behaves in low-memory situations. NOTE: Writing large amounts of data to memory may take some time. Please *await* this function's return.

Parameters:
* *size* (int): Data to write to memory in megabytes. (default: 0)
