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
  tag: 'ob-persistent-service',
  timeout: 30000,
})

const domainHandler = require('./domain/product-domain')

async function start() {
  hemera.use(HemeraJoi)
  hemera.use(HemeraJaeger, {
    serviceName: 'persistent-service',
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

  hemera.use(require('hemera-mongo-store'), {
    mongo: {
      url: 'mongodb://192.168.86.250:27017/openbanking'
    },
    store: {
      update: {
        upsert: true,
      },
    }
  });

  await hemera.ready()

  let Joi = hemera.joi

  hemera.add(
    {
      topic: 'persistent',
      cmd :'saveProduct',
      type: Joi.string().required(),
    }, domainHandler
  );

  hemera.add(
      {
          topic: 'persistent',
          cmd :'saveResource',
          type: Joi.string().required(),
      }, domainHandler
    );

  hemera.add(
      {
        topic: 'persistent',
        cmd :'getAccountList',
        brandId: Joi.string().required(),
      }, domainHandler
  );

  hemera.add(
      {
        topic: 'persistent',
        cmd :'getAccountBalance',
        accountId: Joi.string().required(),
      }, domainHandler
  );

}

start()
