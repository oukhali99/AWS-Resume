const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");
const ddbClient = new DynamoDBClient({ region: "us-east-1" });

module.exports.handler = async (event, context) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    try {
        const params = {
            TableName: process.env.TABLE_NAME
        };

        const command = new ScanCommand(params);
        const result = await ddbClient.send(command);

        const visitorCount = result.Items ? result.Items.length : 0;

        return {
            statusCode: 200,
            body: JSON.stringify({ visitorCount }),
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
            body: JSON.stringify({ message: `Failed to get visitor count due to ${error.message}` }),
            headers: {
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE'
            }
        };
    }
};
