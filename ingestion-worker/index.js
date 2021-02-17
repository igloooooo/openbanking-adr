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
  tag: 'ob-ingestion-worker',
  timeout: 30000,
})

const productWorker = require('./workers/product-worker')
const onDemandWorker = require('./workers/ondemand-worker')
const schedulerWorker = require('./workers/scheduler-worker')

async function start() {
  hemera.use(HemeraJoi)
  hemera.use(HemeraJaeger, {
    serviceName: 'ingestion-worker',
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
      topic: 'ingestion',
      cmd: 'getProduct',
      resourceURL: Joi.string().required(),
      version: Joi.number().required(),
    }, productWorker
  );
  hemera.add(
      {
        topic: 'ingestion',
        cmd: 'onDemand',
        type: Joi.string().required(),
      }, onDemandWorker
  );
  hemera.add(
      {
          topic: 'ingestion',
          cmd: 'scheduler',
          type: Joi.string().required(),
      }, schedulerWorker
    );
}

start()
