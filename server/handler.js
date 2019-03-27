const {
    graphql,
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLNonNull,
    GraphQLString
} = require("graphql");
const { promisify } = require("util");

const AWS = require("asw-sdk");
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const getGreeting = async firstName => {
    const result = await promisify(callback =>
        dynamoDb.get(
            {
                TableName: process.env.DYNAMODB_TABLE,
                Key: { firstName }
            },
            callback
        )
    );

    let name = firstName;
    if (result.Item) {
        name = result.Item.nickname;
    }

    return `Hello, ${name}`;
};

const changeNickname = async (firstName, nickname) => {
    await promisify(callback =>
        dynamoDb.update(
            {
                TableName: process.env.DYNAMODB_TABLE,
                Key: { firstName },
                UpdateExpression: "SET nickname = :nickname",
                ExpressionAttributeValues: {
                    ":nickname": nickname
                }
            },
            callback
        )
    );

    return nickname;
};

const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: "RootQueryType",
        fields: {
            greeting: {
                args: {
                    firstName: {
                        name: "firstName",
                        type: new GraphQLNonNull(GraphQLString)
                    }
                },
                type: GraphQLString,
                resolve: (parent, args) => getGreeting(args.firstName)
            }
        }
    }),
    mutation: new GraphQLObjectType({
        name: "RootMutationType",
        fields: {
            changeNickname: {
                args: {
                    firstName: {
                        name: "firstName",
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    nickname: {
                        name: "nickname",
                        type: new GraphQLNonNull(GraphQLString)
                    }
                },
                type: GraphQLString,
                resolve: (parent, args) =>
                    changeNickname(args.firstName, args.nickname)
            }
        }
    })
});

module.exports.query = (event, context, callback) =>
    graphql(schema, event.queryStringParameters.query).then(
        result =>
            callback(null, { statusCode: 200, body: JSON.stringify(result) }),
        err => callback(err)
    );
