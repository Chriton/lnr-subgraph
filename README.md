# Linagee subgraph

##### Linagee subgraph to keep track of tokens minted by users

# Deployed url
Currently this subgraph is deployed [here](https://thegraph.com/hosted-service/subgraph/chriton/linagee). 
You can deploy your own or use that one. 

Remember that for queries from your React app you must use the API url like for example: https://api.thegraph.com/subgraphs/name/chriton/linagee

# How to deploy this subgraph

- Create an account at [thegraph](https://thegraph.com/)
- From the Subgraph Studio(not free) or Hosted Service (free) section create a subgraph.   
  Note that the Subgraph Studio / Hosted Service section will also have installation instructions.
- After you create it, follow these steps to deploy this graph:

```shell
# INSTALL GRAPH CLI 
yarn global add @graphprotocol/graph-cli

# INSTALL THE DEPENDENCIES
yarn install

# AUTH AND DEPLOY. KEY IS IN THEGRAPH PAGE (https://thegraph.com/hosted-service/subgraph/chriton/linagee
graph auth --studio {your_key}

# BUILD THE SUBGRAPH
graph codegen && graph build

# DEPLOY THE SUBGRAPH TO STUDIO OR TO HOSTED (FREE VERSION)
graph deploy --product subgraph-studio {subgraph_name}
graph deploy --product hosted-service {your_github_account}/{subgraph_name}
```
