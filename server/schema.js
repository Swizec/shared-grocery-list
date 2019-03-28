const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLInputObjectType,
    GraphQLNonNull,
    GraphQLList,
    GraphQLString,
    GraphQLBoolean
} = require("graphql");

const { getGroceryList, changeGroceryList } = require("./dynamodb");

const GraphQLItem = new GraphQLObjectType({
    name: "GroceryListItem",
    fields: {
        itemName: { type: new GraphQLNonNull(GraphQLString) },
        key: { type: new GraphQLNonNull(GraphQLString) },
        done: { type: GraphQLBoolean }
    }
});

const GraphQLInputItem = new GraphQLInputObjectType({
    name: "GroceryListInputItem",
    fields: {
        itemName: { type: new GraphQLNonNull(GraphQLString) },
        key: { type: new GraphQLNonNull(GraphQLString) },
        done: { type: GraphQLBoolean }
    }
});

const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: "RootQueryType",
        fields: {
            groceryList: {
                args: {
                    listId: {
                        name: "listId",
                        type: new GraphQLNonNull(GraphQLString)
                    }
                },
                type: new GraphQLList(GraphQLItem),
                resolve: (parent, args) => getGroceryList(args.listId)
            }
        }
    }),
    mutation: new GraphQLObjectType({
        name: "RootMutationType",
        fields: {
            changeGroceryList: {
                args: {
                    listId: {
                        name: "listId",
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    groceries: {
                        name: "groceries",
                        type: new GraphQLList(GraphQLInputItem)
                    }
                },
                type: GraphQLString,
                resolve: (parent, args) =>
                    changeGroceryList(args.listId, args.groceries)
            }
        }
    })
});

exports.schema = schema;
