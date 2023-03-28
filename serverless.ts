import type { AWS } from '@serverless/typescript'
import type { Lift } from 'serverless-lift'

import type { EsBuildConfig } from './src/types'

const serverlessConfiguration: AWS & Lift = {
  service: 'image-api',
  frameworkVersion: '3',
  configValidationMode: 'error',
  // useDotenv: true,
  custom: {
    esbuild: {
      bundle: true,
      minify: true,
      packagerOptions: {
        scripts: [
          'rm -rf node_modules/sharp',
          'SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm install --arch=x64 --platform=linux --libc=glibc sharp'
        ]
      },
      external: ['sharp']
    } as EsBuildConfig,
  },
  plugins: ['serverless-esbuild', 'serverless-offline', 'serverless-lift'],
  constructs: {
    images: {
      type: 'storage'
    }
  },
  provider: {
    name: 'aws',
    region: 'eu-west-2',
    runtime: 'nodejs16.x',
    // architecture: 'arm64',
    versionFunctions: false,
    endpointType: 'EDGE',
    environment: {
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      BUCKET_NAME: '${construct:images.bucketName}'
    },
    apiGateway: {
      binaryMediaTypes: ['*/*']
    }
  },
  functions: {
    upload: {
      handler: 'src/upload.handler',
      // url: true,
      memorySize: 2048,
      timeout: 29,
      events: [
        {
          http: {
            path: '/images',
            method: 'POST',
            cors: true,
          },
        },
      ],
    },
    // uploadByFetch: {
    //   handler: 'src/upload.handler',
    //   url: true,
    //   memorySize: 2048,
    //   timeout: 29,
    //   events: [
    //     {
    //       http: {
    //         path: '/images/url/{url}',
    //         method: 'POST',
    //         cors: true,
    //       },
    //     },
    //   ],
    // },
    retrieve: {
      handler: 'src/retrieve.handler',
      // url: true,
      memorySize: 2048,
      timeout: 29,
      events: [
        {
          http: {
            path: '/images/{file}',
            method: 'GET',
            cors: true,
          },
        },
      ],
    },
  },
}

module.exports = serverlessConfiguration
