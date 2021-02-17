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
  tag: 'ob-consent-service',
  timeout: 30000,
})



const { tokenHandler, updateTokenByBrandHandler }= require('./handlers/token-handlers')
const { saveClientHandler, getClientHandler } = require('./handlers/client-domain')

async function start() {
  hemera.use(HemeraJoi)
  hemera.use(HemeraJaeger, {
    serviceName: 'consent-service',
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
  });
  hemera.use(require('hemera-mongo-store'), {
    mongo: {
      url: 'mongodb://192.168.86.250:27017/openbanking'
    }
  });

  await hemera.ready()

  let Joi = hemera.joi


  hemera.add(
    {
      topic: 'consent',
      cmd: 'searchTokens',
      brandId: Joi.string().required(),
    }, tokenHandler);

  hemera.add(
      {
          topic: 'consent',
          cmd: 'saveTokens',
          brandId: Joi.string().required(),
      }, updateTokenByBrandHandler);

  hemera.add(
      {
        topic: 'consent',
        cmd :'saveClient',
        brandId: Joi.string().required()
      }, saveClientHandler
  );
  hemera.add(
      {
        topic: 'consent',
        cmd :'getClient',
        brandId: Joi.string().required(),
      }, getClientHandler
  )
}

start()
