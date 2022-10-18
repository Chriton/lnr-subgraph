# Linagee subgraph

### TODO - add description

# How to deploy this subgraph

- Create an account at [thegraph](https://thegraph.com/) 
- From the Subgraph Studio(not free) or Hosted Service (free) section create a subgraph.
The Subgraph Studio / Hosted Service section will also have installation instructions.
- After you create it, follow these steps to deploy this graph:

```shell
# INSTALL GRAPH CLI 
yarn global add @graphprotocol/graph-cli

# INSTALL THE DEPENDENCIES
yarn install

# AUTH AND DEPLOY. KEY IS IN THEGRAPH PAGE
graph auth --studio {your_key}

# BUILD THE SUBGRAPH
graph codegen && graph build

# DEPLOY THE SUBGRAPH TO STUDIO OR TO HOSTED (FREE VERSION)
graph deploy --studio {subgraph_name}
graph deploy --hosted {your_github_account}/{subgraph_name}
```
