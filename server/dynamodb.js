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

const scanItems = params =>
    new Promise((resolve, reject) => {
        dynamoDb.scan(params, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });

const getGroceryList = async listId => {
    const result = await getItem({
        TableName: process.env.DYNAMODB_TABLE,
        Key: { listId }
    });

    return result.Item;
};

const getAllGroceryList = async () => {
    const result = await scanItems({
        TableName: process.env.DYNAMODB_TABLE
    });

    console.log(result);

    return result.Items;
};

const changeGroceryList = ({ listId, listName, groceries }) => {
    return updateItem({
        TableName: process.env.DYNAMODB_TABLE,
        Key: { listId },
        UpdateExpression: "SET groceries = :groceries, listName = :listName",
        ExpressionAttributeValues: {
            ":groceries": groceries,
            ":listName": listName
        }
    })
        .then(result => "Saved")
        .catch(err => {
            console.log(err);
            return "Error";
        });
};

module.exports = { getGroceryList, changeGroceryList, getAllGroceryList };
