import React, { useReducer, useState, useEffect } from "react"
import { Box, Paragraph, Heading, Input, Flex, Button, styled } from "reakit"
import { theme } from "styled-tools"
import posed, { PoseGroup } from "react-pose"
import gql from "graphql-tag"
import { useMutation } from "react-apollo-hooks"

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

const SAVE_QUERY = gql`
  mutation changeGroceryList(
    $listId: String!
    $groceries: [GroceryListInputItem]
  ) {
    changeGroceryList(listId: $listId, groceries: $groceries)
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
  console.log(initialState)
  const [listName, setListName] = useState(initialState.listName)
  const [list, dispatch] = useReducer(reducer, initialState.groceries)

  const saveList = useMutation(SAVE_QUERY, {
    variables: {
      listId,
      listName,
      groceries: list,
    },
  })

  useEffect(() => {
    saveList()
  }, [listName, list.length, list.filter(item => item.done).length])

  return (
    <Box>
      <Title
        value={listName}
        onChange={event => setListName(event.target.value)}
        placeholder="Give your list a name"
      />
      {!list.length ? (
        <Paragraph>Add some items to your list 👇</Paragraph>
      ) : null}
      <PoseGroup preEnterPose="before">
        {list.map((item, index) => (
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
    </Box>
  )
}

export default GroceryList
