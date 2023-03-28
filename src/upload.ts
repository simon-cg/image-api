import S3 from 'aws-sdk/clients/s3'
import * as uuid from 'uuid'
import type { APIGatewayProxyHandlerV2, APIGatewayProxyEventV2 } from 'aws-lambda';
import axios from 'axios';
import { fileTypeFromBuffer } from 'file-type'

const s3 = new S3()

type UploadParams = {
    sourceString: string
    encoding?: BufferEncoding
}

export const handler: APIGatewayProxyHandlerV2 = async (event: APIGatewayProxyEventV2) => {
    try {
        console.info("event:", event)
        if (!event.body || !process.env.BUCKET_NAME) {
            throw new Error('critical error')
        }

        const uploadParams: UploadParams = {
            sourceString: event.body,
            encoding: 'base64'
        }
        if (event.body.startsWith('http')) {
            const image = await axios.request({
                method: 'get',
                url: event.body,
            })
            uploadParams.sourceString = image.data
            uploadParams.encoding = 'binary'
        }

        const Body = Buffer.from(uploadParams.sourceString, uploadParams.encoding)
        const id = uuid.v4()
        const fileType = await fileTypeFromBuffer(Body)
        const ContentType = fileType?.mime ?? event.headers['Content-Type'] ?? event.headers['content-type']
        const [_mime, ext] = ContentType?.split('/') ?? [fileType?.mime, fileType?.ext]

        if (!ContentType || !ContentType.includes('/') || !ext || _mime !== 'image') {
            throw new Error('not able to parse uploaded file')
        }

        await s3
            .putObject({
                Bucket: process.env.BUCKET_NAME,
                Key: `images/${id}`,
                Body,
                ContentType,
            })
            .promise()

        return {
            statusCode: 201,
            body: `${id}.${ext}`,
        }
    }
    catch (e) {
        console.info(e)
        return {
            statusCode: 400,
            body: String(e),
        }
    }
}
