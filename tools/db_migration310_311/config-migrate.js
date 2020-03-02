'use strict'

const { URL } = require('url')
const request = require('superagent')

const parameter = require('commander')

async function login ({
  baseUrl,
  username,
  password
}) {
  const response = await request
    .post(`${baseUrl}/api/auth/login`)
    .send({
      username,
      password
    })
  if (response.body && !response.body.isError) {
    return response.body.data.sessionToken
  }
}

async function getAcquirerConfigs ({
  baseUrl,
  sessionToken,
  page = 1,
  perPage = 30,
  query = {}
}) {
  const response = await request
    .get(`${baseUrl}/api/back_office/acquirer_configs`)
    .set('x-access-token', sessionToken)
    .query({
      page,
      perPage,
      ...query
    })

  if (response.body && !response.body.isError) {
    return response.body.data
  }
}

async function putAcquirerConfig ({
  baseUrl,
  sessionToken,
  id,
  body
}) {
  const response = await request
    .put(`${baseUrl}/api/back_office/acquirer_configs/${id}`)
    .set('x-access-token', sessionToken)
    .send(body)

  if (response.body && !response.body.isError) {
    return response.body.status
  }
}

parameter
  .requiredOption('-s, --src [url]', 'Source API URL, e.g http://admin:admin@192.168.12.1:12000')
  .requiredOption('-d, --dest [url]', 'Destination API URL, username and password can be omitted')

  .parse(process.argv)

async function begin () {
  const srcUrl = new URL(parameter.src)
  const srcConfig = {
    baseUrl: srcUrl.origin,
    username: srcUrl.username,
    password: srcUrl.password,
    sessionToken: undefined
  }
  const destUrl = new URL(parameter.dest)
  const destConfig = {
    baseUrl: destUrl.origin,
    username: destUrl.username || srcUrl.username,
    password: destUrl.password || srcUrl.password,
    sessionToken: undefined
  }

  console.log('Login to source')
  srcConfig.sessionToken = await login({
    ...srcConfig
  })
  if (!srcConfig.sessionToken) {
    console.log('Cannot Login to source')
    return
  }

  console.log('Login to destination')
  destConfig.sessionToken = await login({
    ...destConfig
  })
  if (!destConfig.sessionToken) {
    console.log('Cannot Login to destination')
    return
  }

  let stillAvailable = true
  let page = 1
  const startTime = (new Date()).toISOString()
  while (stillAvailable) {
    const sources = await getAcquirerConfigs({
      ...srcConfig,
      page,
      query: {
        'f[createdAt]': `lte,${startTime}`
      }
    })
    if (sources.length) {
      for (let i = 0; i < sources.length; i++) {
        const source = sources[i]
        console.log(`Migrating ${source.id}`)
        const status = await putAcquirerConfig({
          ...destConfig,
          id: source.id,
          body: {
            config: source.config
          }
        })
        console.log(status)
      }
    } else {
      stillAvailable = false
    }
    page++
  }
}

begin()
