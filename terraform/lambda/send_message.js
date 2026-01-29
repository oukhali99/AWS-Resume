const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const sesClient = new SESClient({ region: "us-east-1" });

module.exports.handler = async (event, context) => {
    console.log('Received event body:', JSON.stringify(event.body, null, 2));
    
    try {
        const body = JSON.parse(event.body);
        console.log('Request body:', body);
        
        const params = {
            Source: 'contact@oussamakhalifeh.com',
            Destination: {
                ToAddresses: ['oukhali@hotmail.com']
            },
            Message: {
                Subject: {
                    Data: 'New Contact Form Submission'
                },
                Body: {
                    Text: {
                        Data: `From: ${body.email}\n\nMessage: ${body.message}`
                    }
                }
            }
        };

        const command = new SendEmailCommand(params);
        const result = await sesClient.send(command);
        console.log('Email sent:', result);

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE'
            },
            body: JSON.stringify({
                message: 'Email sent successfully'
            })
        };
    } catch (error) {
        console.error('Error:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE'
            },
            body: JSON.stringify({
                message: `Failed to send email due to ${error.message}`
            })
        };
    }
};