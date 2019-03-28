import ApolloClient from "apollo-boost"
import fetch from "isomorphic-fetch"

import { SERVER_URI } from "../config"

export const client = new ApolloClient({
  uri: SERVER_URI,
  fetch,
})
