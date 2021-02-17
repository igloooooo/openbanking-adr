const Hemera = require('nats-hemera')
const HemeraJoi = require('hemera-joi')
const HemeraJaeger = require('hemera-jaeger')
const nats = require('nats').connect({
  url: process.env.NATS_URL,
  user: process.env.NATS_USER,
  pass: process.env.NATS_PW
})
const hemera = new Hemera(nats, {
  logLevel: process.env.HEMERA_LOG_LEVEL,
  childLogger: true,
  tag: 'ob-scheduler-service',
  timeout: 30000,
})

let flag = true

const updateProductTask = require('./tasks/update-products-task');

async function start() {
  hemera.use(HemeraJoi)
  hemera.use(HemeraJaeger, {
    serviceName: 'scheduler-service',
    jaeger: {
      sampler: {
        type: 'Const',
        options: true
      },
      options: {
        tags: {
          'nodejs.version': process.versions.node
        }
      },
      reporter: {
        host: process.env.JAEGER_URL
      }
    }
  })

  await hemera.ready()

  let Joi = hemera.joi

  hemera.add(
    {
      topic: 'scheduler',
      cmd: 'stop',
    }, (ret) => {
      flag = false;
    }
  );
  hemera.add(
      {
        topic: 'scheduler',
        cmd: 'start',
      }, (ret) => {
        flag = true;
      }
  );
}

start()

const CronJob = require('cron').CronJob;
new CronJob('0 */20 * * * *', function() {
  if (flag) {
    updateProductTask(hemera);
  }
}, null, true);
