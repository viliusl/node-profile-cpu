const v8Profiler = require('v8-profiler'),
  fetch = require('node-fetch'),
  Promise = require('bluebird'),
  fs = require('fs');

describe('cpu profiles', function () {
  this.timeout(20000);
  const reqBursts = Array.from(new Array(200)).map(() => asPromiseAllWith20);

  it('should send some requests and profile cpu', () => {
    v8Profiler.startProfiling('express', true);

    startExpressApp()
      .then(() => Promise.map(reqBursts, burst => burst()))
      .then(() => writeToFile(v8Profiler.stopProfiling('express')));
  });
});

function writeToFile(profile) {
  return new Promise((resolve, reject) => {
    profile.export((error, result) => {
      if (error) {
        reject(error);
      } else {
        fs.writeFileSync(`cpu-profile-${Date.now()}.cpuprofile`, result);
        profile.delete();
        resolve();
      }
    });
  });
}

function asPromiseAllWith20() {
  Promise.all(Array.from(new Array(20)).map(() => fetch('http://localhost:3000')));
}

function startExpressApp() {
  return new Promise(resolve => {
    require('express')()
      .get('/', (req, res) => setTimeout(() => res.send('ok'), 20))
      .listen(3000, resolve);
  });
}