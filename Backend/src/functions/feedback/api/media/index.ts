const aws = require('aws-sdk');
const cors = require('cors');
cors({
    origin: true,
  });

exports.handler = async (event: any) => {
    console.log('feedback-api-media-handler: Received event:', JSON.stringify(event, undefined, 2));
    // console.log('Received event:', JSON.stringify(event, null, 2));
    let body;
    let statusCode = '200';
    // const headers = {
    //     'Access-Control-Allow-Origin':'*',
    //     'Content-Type': 'application/json'
    // };
    const headers = {
        'Access-Control-Allow-Headers':'*',
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Methods':'HEAD, POST',//'HEAD, GET, POST, PUT, DELETE',
        'Content-Type': 'application/json'
    };
    try {
        switch (event.httpMethod) {
            case 'POST':
                const jsonBody = JSON.parse(event.body);
                const s3 = new aws.S3();
                const fileBody = jsonBody;
                // const base64String = fileBody.file;
                const fileName = fileBody.fileName;
                const fileType = fileBody.fileType;
                // const buff = Buffer.from (base64String, 'base64');
                try {
                    const params = {
                        Bucket: getBucketName(),
                        ContentType: fileType,
                        Expires: 60*24,
                        Key: fileName,
                    };
                    body = await  s3.getSignedUrlPromise('putObject', params);
                    headers['Access-Control-Allow-Credentials']= true;
                    // headers['Access-Control-Allow-Origin']= '*';
                } catch (err) {
                    console.log(err, 'Internal Server Error');
                }
            case 'OPTIONS':
                statusCode = '200';
                // headers['Access-Control-Allow-Headers'] = '*';
                // headers['Access-Control-Allow-Origin'] = '*';
                // headers['Access-Control-Allow-Methods'] = 'HEAD, GET, POST, PUT, DELETE';
                break;
            default:
                throw new Error(`Unsupported method "${event.httpMethod}"`);
        }
    } catch (err) {
        statusCode = '400';
        console.error('feedback-api-media-handler: Failed.', err);
        // body = err.message;
    } finally {
        body = JSON.stringify(body);
    }
    return {
        body,
        headers,
        statusCode,
    };
};

function getBucketName(): string {
    return (process.env.DB_ENV === 'development') ? 'dev-gigatester-manage-feedback' : 'beta-gigatester-manage-feedback';
}
