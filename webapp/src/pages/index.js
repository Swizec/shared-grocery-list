import React from "react"
import { graphql } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"
import GroceryList from "../components/GroceryList"

const IndexPage = ({ data = {} }) => (
  <Layout>
    <SEO title="🛍" keywords={[`gatsby`, `application`, `react`]} />
    <GroceryList listId="bla" initialState={data.groceryapi.groceryList} />
  </Layout>
)

export default IndexPage

export const query = graphql`
  query {
    groceryapi {
      groceryList(listId: "bla") {
        listName
        groceries {
          itemName
          key
          done
        }
      }
    }
  }
`
