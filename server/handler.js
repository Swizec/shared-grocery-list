const { graphql } = require("graphql");

const { schema } = require("./schema");

module.exports.query = (event, context, callback) => {
    const query =
        event.httpMethod === "GET"
            ? event.queryStringParameters.query
            : JSON.parse(event.body).query;

    graphql(schema, query).then(
        result =>
            callback(null, {
                statusCode: 200,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify(result)
            }),
        err => callback(err)
    );
};
