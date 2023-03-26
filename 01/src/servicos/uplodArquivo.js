const aws = require('aws-sdk');
const { path } = require('../rotas');

const endpoint = new aws.Endpoint(process.env.ENDPOINT);

const s3 = new aws.S3({
    endpoint,
    credentials: {
        accessKeyId: process.env.KEY_ID,
        secretAccessKey: process.env.APP_KAY
    }
});

const envioArquivos = async (path, buffer, mimetype) => {

    const arquivo = await s3.upload({
        Bucket: process.env.BACKBLAZE_BUCKET,
        Key: path,
        Body: buffer,
        ContentType: mimetype
    }).promise();

    return {
        url: arquivo.Location,
        path: arquivo.Key
    };
}

const excluirArquivo = async (path) => {

    await s3.deleteObject({
        Bucket: process.env.BACKBLAZE_BUCKET,
        Key: path
    }).promise();

}

module.exports = {
    envioArquivos,
    excluirArquivo
}