const { graphql } = require("graphql");

const { schema } = require("./schema");

module.exports.query = (event, context, callback) => {
    const body = event.body ? JSON.parse(event.body) : {};
    const query =
        event.httpMethod === "GET"
            ? event.queryStringParameters.query
            : body.query;

    graphql({ schema, source: query, variableValues: body.variables }).then(
        result =>
            callback(null, {
                statusCode: 200,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify(result)
            }),
        err => callback(err)
    );
};
