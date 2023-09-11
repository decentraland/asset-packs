const handler = require('serve-handler')
const http = require('http')
const dotenv = require('dotenv')

dotenv.config()

const serverHost = process.env.SERVER_HOST || '0.0.0.0'
const serverPort = process.env.CATALOG_SERVER_PORT || 8002
const awsStorageUrl = process.env.AWS_STORAGE_URL || ''
const s3BucketName = process.env.S3_BUCKET_NAME || 'asset-packs'

const server = http.createServer((request: any, response: any) => {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', '*')

  return handler(request, response, {
    redirects: [
      {
        source: '/contents/:hash',
        destination: `${awsStorageUrl.replace(
          /:(?=\d)/,
          '\\:', // Parse the port dots
        )}/${s3BucketName}/contents/:hash`,
      },
    ],
  })
})

server.listen(serverPort, serverHost, () => {
  console.log(`Catalog server running at http://${serverHost}:${serverPort}`)
})
