const axios = require('axios');
const crypto = require('crypto');

class ObjectStorageClient {
    constructor(config) {
        this.baseURL = config.endpoint || 'https://api.objectstorage.com';
        this.credentials = {
            accessKeyId: config.credentials.accessKeyId,
            secretAccessKey: config.credentials.secretAccessKey
        };
    }

    _getAuthHeaders(method, path) {
        const timestamp = Date.now().toString();
        const signature = crypto
            .createHmac('sha256', this.credentials.secretAccessKey)
            .update(`${method}${path}${timestamp}`)
            .digest('hex');

        return {
            'X-Access-ID': this.credentials.accessKeyId,
            'X-Signature': signature,
            'X-Timestamp': timestamp
        };
    }

    async send(command) {
        const { method, path, data, params } = command;
        const url = `${this.baseURL}${path}`;
        const headers = this._getAuthHeaders(method, path);

        try {
            const response = await axios({
                method,
                url,
                data,
                params,
                headers: {
                    ...headers,
                    ...(command.headers || {})
                },
                responseType: command.responseType || 'json'
            });
            return response.data;
        } catch (error) {
            throw new Error(`Request failed: ${error.message}`);
        }
    }
}

class ListBucketsCommand {
    constructor() {
        this.method = 'GET';
        this.path = '/buckets';
    }
}

class PutObjectCommand {
    constructor(params) {
        this.method = 'POST';
        this.path = `/buckets/${params.Bucket}/objects`;
        this.data = params.Body;
        this.headers = {
            'Content-Type': params.ContentType || 'application/octet-stream',
            'X-File-Name': params.Key
        };
    }
}

class GetObjectCommand {
    constructor(params) {
        this.method = 'GET';
        this.path = `/buckets/${params.Bucket}/objects/${params.Key}`;
        this.responseType = 'arraybuffer';
    }
}

class DeleteObjectCommand {
    constructor(params) {
        this.method = 'DELETE';
        this.path = `/buckets/${params.Bucket}/objects/${params.Key}`;
    }
}

module.exports = {
    ObjectStorageClient,
    ListBucketsCommand,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand
};