# TODO - add info

# How to deploy a subgraph

- Create an account at [thegraph](https://thegraph.com/) 
- From the Subgraph Studio(not free) or Hosted Service (free) section create a subgraph
- Follow the instructions on the Subgraph Studio/Hosted Service section how to build it.
Usually the instructions involve typing the following commands in your terminal:

```shell
# INSTALL GRAPH CLI USING NPM
npm install -g @graphprotocol/graph-cli

# OR USING YARN
yarn global add @graphprotocol/graph-cli

# THEN INITIALIZE THE SUBGRAPH
graph init --studio {subgraph_name}

# AUTH AND DEPLOY
graph auth --studio {your_key}

# ENTER SUBGRAPH FOLDER
cd {subgraph_folder}

# BUILD SUBGRAPH
graph codegen && graph build

# DEPLOY SUBGRAPH TO STUDIO
graph deploy --studio {subgraph_name}

# DEPLOY SUBGRAPH TO HOSTED
graph deploy --hosted {your_github_account}/{subgraph_name}
```
