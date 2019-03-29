import { useReducer, useState, useEffect } from "react"
import gql from "graphql-tag"
import { useApolloClient } from "react-apollo-hooks"

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

export function useListState({ listId, initialState }) {
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

  return { loading, listName, setListName, groceries, dispatch }
}
