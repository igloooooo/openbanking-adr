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
  tag: 'ob-registration-management-service',
  timeout: 30000,
})

const dataHolderResourceHandler = require('./handlers/data-holder-handler');
const registerClientHandler = require('./handlers/register-client-handler');
const generateConsentHandler = require('./handlers/generate-consent-handler');
const generateConsentRequestHandler = require('./handlers/generate-consent-request-handler');
const swapCodeHandler = require('./handlers/swap-code-handler');
const refreshTokenHandler = require('./handlers/refresh-token-handler');
const { revokeConsentHandler, revokeTokenHandler} = require('./handlers/remove-consent');

async function start() {
  hemera.use(HemeraJoi)
  hemera.use(HemeraJaeger, {
    serviceName: 'registration-management-service',
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
      topic: 'register',
      cmd: 'getDataHolderList',
    }, dataHolderResourceHandler
  );

  hemera.add(
      {
        topic: 'register',
        cmd: 'getClient',
      }, registerClientHandler
  );

  hemera.add(
      {
        topic: 'register',
        cmd: 'generateConsent',
      }, generateConsentHandler
  );
  hemera.add(
      {
        topic: 'register',
        cmd: 'generateConsentRequest',
      }, generateConsentRequestHandler
  );

  hemera.add(
      {
          topic: 'register',
          cmd: 'swapCode',
          clientId:Joi.string().required(),
          softwareId: Joi.string().required(),
          code: Joi.string().required(),
      }, swapCodeHandler
  );

  hemera.add(
      {
          topic: 'register',
          cmd: 'refreshToken',
          clientId:Joi.string().required(),
          softwareId: Joi.string().required(),
          refreshToken: Joi.string().required(),
      }, refreshTokenHandler
  );

    hemera.add(
        {
            topic: 'register',
            cmd: 'revokeToken',
            clientId:Joi.string().required(),
            softwareId: Joi.string().required(),
            refreshToken: Joi.string().required(),
        }, revokeTokenHandler
    );

    hemera.add(
        {
            topic: 'register',
            cmd: 'revokeConsent',
            clientId:Joi.string().required(),
            softwareId: Joi.string().required(),
            consent_cdr_arrangement_id: Joi.string().required(),
        }, revokeConsentHandler
    );
}

start()
