import React, { useReducer, useState, useEffect } from "react"
import { Box, Paragraph, Heading, Input, Flex, Button, styled } from "reakit"
import { theme } from "styled-tools"
import posed, { PoseGroup } from "react-pose"
import gql from "graphql-tag"
import { useApolloClient } from "react-apollo-hooks"

const Title = styled(Input)`
  font-weight: bold;
  font-size: ${theme("fontSize.3")};
  margin-bottom: 0.5em;
`

const Item = styled(Flex)`
  padding: 0.5em 0em;
  padding-right: 1em;
`

const PosedItem = posed.div({
  before: { opacity: 0, paddingLeft: 0 },
  enter: { opacity: 1, paddingLeft: 50 },
  exit: { opacity: 0, paddingLeft: 500 },
})

const ItemName = styled(Heading)`
  cursor: pointer;
  display: inline-block;
  padding: 0.5em 0;
`

const Strike = styled.span`
  display: inline-block;
  text-decoration: line-through;
  position: relative;
  left: -19px;
  &:before,
  &:after {
    content: "\00a0\00a0\00a0\00a0";
  }
`

const READ_QUERY = gql`
  query groceryList($listId: String!) {
    groceryList(listId: $listId) {
      listName
      groceries {
        itemName
        key
        done
      }
    }
  }
`

const SAVE_QUERY = gql`
  mutation changeGroceryList(
    $listId: String!
    $listName: String
    $groceries: [GroceryListInputItem]
  ) {
    changeGroceryList(
      listId: $listId
      listName: $listName
      groceries: $groceries
    )
  }
`

function reducer(state, action) {
  const index = action.index

  switch (action.type) {
    case "addItem":
      return [
        ...state,
        {
          itemName: action.itemName,
          key: new Date().toISOString(),
        },
      ]
    case "toggleDone":
      return [
        ...state.slice(0, index),
        { ...state[index], done: !state[index].done },
        ...state.slice(index + 1),
      ]
    case "remove":
      return [...state.slice(0, index), ...state.slice(index + 1)]
    case "replaceList":
      return action.groceries
    default:
      throw new Error("Unknown action")
  }
}

const ListItem = ({ dispatch, itemName, done }) => {
  return (
    <Item justifyContent="space-between">
      <ItemName as="span" onClick={() => dispatch("toggleDone")}>
        {done ? <Strike>{itemName}</Strike> : itemName}
      </ItemName>
      <Button opaque={false} onClick={() => dispatch("remove")}>
        ❌
      </Button>
    </Item>
  )
}

const NewItem = ({ dispatch }) => {
  const [itemName, setItem] = useState("")

  function addItem() {
    dispatch({ type: "addItem", itemName })
    setItem("")
  }

  return (
    <Flex>
      <Input
        value={itemName}
        onChange={event => setItem(event.target.value)}
        onKeyPress={({ key }) => (key === "Enter" ? addItem() : null)}
        placeholder="What do you need to buy? 🛍"
      />
      <Button onClick={addItem}>Add</Button>
    </Flex>
  )
}

const GroceryList = ({ listId, initialState }) => {
  const [listName, setListName] = useState(initialState.listName)
  const [loading, setLoading] = useState(false)
  const [fetched, setFetched] = useState(false)
  const [groceries, dispatch] = useReducer(reducer, initialState.groceries)

  const client = useApolloClient()

  useEffect(() => {
    async function saveGroceries() {
      // avoid overwriting state
      if (fetched) {
        setLoading(true)
        const result = await client.mutate({
          mutation: SAVE_QUERY,
          variables: {
            listId,
            listName,
            groceries,
          },
        })

        setLoading(false)
      }
    }
    saveGroceries()
  }, [listName, groceries.length, groceries.filter(item => item.done).length])

  useEffect(() => {
    async function fetchGroceries() {
      setLoading(true)
      const { data } = await client.query({
        query: READ_QUERY,
        variables: { listId },
      })

      const groceries = data.groceryList.groceries.map(g => ({
        itemName: g.itemName,
        key: g.key,
        done: g.done,
      }))

      setLoading(false)
      setFetched(true)
      setListName(data.groceryList.listName)
      dispatch({
        type: "replaceList",
        groceries,
      })
    }
    fetchGroceries()
  }, [])

  return (
    <Box>
      <Title
        value={listName}
        onChange={event => setListName(event.target.value)}
        placeholder="Give your list a name"
      />
      {!groceries.length ? (
        <Paragraph>Add some items to your list 👇</Paragraph>
      ) : null}
      <PoseGroup preEnterPose="before">
        {groceries.map((item, index) => (
          <PosedItem key={item.key}>
            <ListItem
              dispatch={action => dispatch({ type: action, index })}
              {...item}
              key={item.key}
            />
          </PosedItem>
        ))}
      </PoseGroup>
      <NewItem dispatch={dispatch} />
      {loading ? <Paragraph>Updating list ...</Paragraph> : null}
    </Box>
  )
}

export default GroceryList
