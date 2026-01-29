const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const ddbClient = new DynamoDBClient({ region: "us-east-1" });

module.exports.handler = async (event, context) => {
    console.log('Received event body:', JSON.stringify(event.body, null, 2));

    try {
        const params = {
            TableName: process.env.TABLE_NAME,
            Item: {
                IpAddress: { S: event.requestContext.identity.sourceIp },
                Timestamp: { N: Math.floor(Date.now() / 1000).toString() }
            }
        };

        const command = new PutItemCommand(params);
        await ddbClient.send(command);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Visitor added successfully' }),
            headers: {
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE'
            }
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: `Failed to add visitor due to ${error.message}` }),
            headers: {
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE'
            }
        };
    }
};