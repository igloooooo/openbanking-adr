const Hapi = require('hapi')
const HapiHemera = require('hapi-hemera')

const server = new Hapi.Server({
  port: process.env.API_PORT,
  host: process.env.API_HOST,
  debug: { request: ['error'] },
  routes: {
    cors: {
      origin: ['*'], // an array of origins or 'ignore'
      credentials: true // boolean - 'Access-Control-Allow-Credentials'
    }
  }

})

const routes =  require('./route/router')

async function start() {
  await server.register({
    plugin: HapiHemera,
    options: {
      hemera: {
        name: 'test',
        logLevel: process.env.HEMERA_LOG_LEVEL,
        childLogger: true,
        tag: 'hemera-1'
      },
      nats: {
        url: process.env.NATS_URL,
        user: process.env.NATS_USER,
        pass: process.env.NATS_PW
      },
      plugins: [
        {
          register: require('hemera-jaeger'),
          options: {
            serviceName: 'api',
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
          }
        }
      ]
    }
  })

  routes.forEach(route => {
    server.route(route);
  });

  await server.start()

  console.log(`Server running at: ${server.info.uri}`)
}

start()
