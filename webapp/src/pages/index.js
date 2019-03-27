import React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import Image from "../components/image"
import SEO from "../components/seo"
import GroceryList from "../components/GroceryList"

const IndexPage = () => (
  <Layout>
    <SEO title="🛍" keywords={[`gatsby`, `application`, `react`]} />
    <GroceryList />
  </Layout>
)

export default IndexPage
