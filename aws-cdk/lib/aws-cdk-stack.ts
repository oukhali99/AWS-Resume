import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';

export class AWSResumeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Parameters
    const githubConnectionArn = new cdk.CfnParameter(this, 'GitHubConnectionArn', {
      type: 'String',
      description: 'GitHub Connection ARN'
    });

    const s3BucketWebsite = new cdk.CfnParameter(this, 'S3BucketWebsite', {
      type: 'String',
      description: 'S3 Bucket Website Name'
    });

    // DynamoDB Table
    const visitorTable = new dynamodb.Table(this, 'DynamoDBVisitorTable', {
      tableName: `${this.stackName}-visitor`,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: 'IpAddress', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'Timestamp', type: dynamodb.AttributeType.NUMBER }
    });

    // Lambda Functions
    const sendMessageLambda = new lambda.Function(this, 'LambdaSendMessage', {
      functionName: `${this.stackName}-lambda-send-message`,
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
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
                                Data: \`From: \${body.email}\\n\\nMessage: \${body.message}\`
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
                        message: \`Failed to send email due to \${error.message}\`
                    })
                };
            }
        };
      `),
    });

    // Add SES permissions to Lambda
    sendMessageLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['ses:SendEmail', 'ses:SendRawEmail'],
      resources: ['*']
    }));

    // API Gateway
    const api = new apigateway.RestApi(this, 'APIGateway', {
      restApiName: `${this.stackName}-api-gateway`,
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token'
        ]
      }
    });

    // API Gateway Resources and Methods
    const sendMessageResource = api.root.addResource('send-message');
    sendMessageResource.addMethod('POST', new apigateway.LambdaIntegration(sendMessageLambda));

    // Add visitor Lambda
    const addVisitorLambda = new lambda.Function(this, 'LambdaAddVisitor', {
      functionName: `${this.stackName}-lambda-add-visitor`,
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      environment: {
        TABLE_NAME: visitorTable.tableName
      },
      code: lambda.Code.fromInline(`
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
                    body: JSON.stringify({ message: \`Failed to add visitor due to \${error.message}\` }),
                    headers: {
                        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE'
                    }
                };
            }
        };
      `)
    });

    // Grant DynamoDB permissions to addVisitor Lambda
    visitorTable.grantWriteData(addVisitorLambda);

    // Add visitor API endpoint
    const addVisitorResource = api.root.addResource('add-visitor');
    addVisitorResource.addMethod('POST', new apigateway.LambdaIntegration(addVisitorLambda));

    // Get visitor count Lambda
    const getVisitorCountLambda = new lambda.Function(this, 'LambdaGetVisitorCount', {
      functionName: `${this.stackName}-lambda-get-visitor-count`,
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      environment: {
        TABLE_NAME: visitorTable.tableName
      },
      code: lambda.Code.fromInline(`
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
                    body: JSON.stringify({ message: \`Failed to get visitor count due to \${error.message}\` }),
                    headers: {
                        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE'
                    }
                };
            }
        };
      `)
    });

    // Grant DynamoDB permissions to getVisitorCount Lambda
    visitorTable.grantReadData(getVisitorCountLambda);

    // Get visitor count API endpoint
    const getVisitorCountResource = api.root.addResource('get-visitor-count');
    getVisitorCountResource.addMethod('GET', new apigateway.LambdaIntegration(getVisitorCountLambda));

    // Pipeline Artifacts Bucket
    const pipelineArtifactsBucket = new s3.Bucket(this, 'S3BucketPipelineArtifacts', {
      bucketName: `${this.stackName.toLowerCase()}-pipeline-artifacts`
    });

    // CodeBuild Project
    const codeBuildProject = new codebuild.PipelineProject(this, 'CodeBuildProject', {
      projectName: `${this.stackName}-codebuild-project`,
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
        computeType: codebuild.ComputeType.SMALL,
        environmentVariables: {
          VITE_API_URL: {
            value: `https://api.resume.oussamakhalifeh.com/prod`
          }
        }
      },
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            'runtime-versions': {
              nodejs: '22'
            },
            commands: [
              'npm install -g yarn',
              'yarn install'
            ]
          },
          build: {
            commands: [
              'yarn build'
            ]
          }
        },
        artifacts: {
          'base-directory': 'dist',
          files: ['**/*']
        }
      })
    });

    // Pipeline
    const pipeline = new codepipeline.Pipeline(this, 'Pipeline', {
      pipelineName: `${this.stackName}-pipeline`,
      artifactBucket: pipelineArtifactsBucket,
      stages: [
        {
          stageName: 'Source',
          actions: [
            new codepipeline_actions.CodeStarConnectionsSourceAction({
              actionName: 'GitHubSource',
              connectionArn: githubConnectionArn.valueAsString,
              owner: 'oukhali99',
              repo: 'AWS-Resume',
              branch: 'main',
              output: new codepipeline.Artifact('SourceOutput')
            })
          ]
        },
        {
          stageName: 'Build',
          actions: [
            new codepipeline_actions.CodeBuildAction({
              actionName: 'BuildWithYarn',
              project: codeBuildProject,
              input: new codepipeline.Artifact('SourceOutput'),
              outputs: [new codepipeline.Artifact('BuildOutput')]
            })
          ]
        },
        {
          stageName: 'Deploy',
          actions: [
            new codepipeline_actions.S3DeployAction({
              actionName: 'DeployToS3',
              bucket: s3.Bucket.fromBucketName(this, 'WebsiteBucket', s3BucketWebsite.valueAsString),
              input: new codepipeline.Artifact('BuildOutput'),
              extract: true
            })
          ]
        }
      ]
    });

    // Outputs
    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: api.url,
      description: 'API Gateway endpoint URL'
    });
  }
}
