const faas = require('./index');

jest.setTimeout(2 * 60 * 1000);

test('random cold start delay', async () => {
  let time = await faas.simulateColdStart();

  expect(time).toBeGreaterThanOrEqual(0);
  expect(time).toBeLessThanOrEqual(2000);
});

test('random cold start delay, max 1000ms', async () => {
  let time = await faas.simulateColdStart(1000);

  expect(time).toBeGreaterThanOrEqual(0);
  expect(time).toBeLessThanOrEqual(1000);
});

test('random cold start delay between 10ms and 20ms', async () => {
  let time = await faas.simulateColdStart(10, 20);

  expect(time).toBeGreaterThanOrEqual(10);
  expect(time).toBeLessThanOrEqual(20);
});

test('cold start delay exactly 234ms', async () => {
  let time = await faas.simulateColdStart(234, 20, true);

  expect(time).toBe(234);
});

test('force timeout for six seconds', async () => {
  let time = await faas.simulateTimeout(0.1);

  expect(time).toBe(6000);
});
