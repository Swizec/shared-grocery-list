const {
    graphql,
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLNonNull,
    GraphQLString
} = require("graphql");

const AWS = require("aws-sdk");
const dynamoDb = new AWS.DynamoDB.DocumentClient();

// These are here because I couldn't get aws-sdk Promise support to work
// Neither did node's promisify work
const updateItem = params =>
    new Promise((resolve, reject) => {
        dynamoDb.update(params, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });

const getItem = params =>
    new Promise((resolve, reject) => {
        dynamoDb.get(params, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });

const getGreeting = async firstName => {
    const result = await getItem({
        TableName: process.env.DYNAMODB_TABLE,
        Key: { firstName }
    });

    console.log("ITEM", result);

    let name = firstName;
    if (result.Item) {
        name = result.Item.nickname;
    }

    return `Hello, ${name}`;
};

const changeNickname = (firstName, nickname) => {
    return updateItem({
        TableName: process.env.DYNAMODB_TABLE,
        Key: { firstName },
        UpdateExpression: "SET nickname = :nickname",
        ExpressionAttributeValues: {
            ":nickname": nickname
        }
    }).then(result => nickname);
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
