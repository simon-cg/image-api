import S3 from 'aws-sdk/clients/s3'
import type { APIGatewayProxyHandlerV2, APIGatewayProxyEventV2 } from 'aws-lambda';
import sharp, { FormatEnum } from 'sharp';

const s3 = new S3()

export const handler: APIGatewayProxyHandlerV2 = async (event: APIGatewayProxyEventV2) => {
    try {
        console.info(event)
        const file = (event.pathParameters as { file: string })?.file ?? event.rawPath.replace('/', '')
        if (!file || !process.env.BUCKET_NAME) {
            throw new Error('critical error')
        }

        const [id, format] = file.split('.')

        const s3Object = await s3
            .getObject({
                Bucket: process.env.BUCKET_NAME,
                Key: `images/${id}`,
            })
            .promise();

        if (format && !s3Object.ContentType?.includes(format)) {
            const convertedImage = await sharp(s3Object.Body as Buffer).toFormat(format as keyof FormatEnum).toBuffer()
            const fileTypeLib = await import('file-type')
            const fileType = await fileTypeLib.fileTypeFromBuffer(convertedImage)
            // await s3
            //     .putObject({
            //         Bucket: process.env.BUCKET_NAME,
            //         Key: `images/${id}`,
            //         Body: convertedImage,
            //         ContentType: fileType?.mime,
            //     })
            //     .promise()
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': String(fileType?.mime),
                },
                body: convertedImage.toString('base64'),
                isBase64Encoded: true,
            };
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': String(s3Object.ContentType),
            },
            body: (s3Object.Body as Buffer).toString('base64'),
            isBase64Encoded: true,
        };
    } catch (e) {
        console.info(e)
        return {
            statusCode: 400,
            body: String(e),
        }
    }
};