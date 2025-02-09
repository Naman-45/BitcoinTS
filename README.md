## BitcoinTS - 

# Bitcoin system design implementation 

![System design architecture](https://res.cloudinary.com/dxyexbgt6/image/upload/v1739131989/Untitled-2024-07-24-2243_1_cpy4wm.png)

1. Central server - A central websocket server that all miners connect to to exchange messages
2. Miner server - 
 - Code that miners can run to be able to create blocks, do proof of work, broadcast the block via the central server. 
 - Code that verifies the signature, balances and creates / adds a block
 - Code should reject smaller blockchains/erronours blocks
 - Should be able to catch up to the blockchain when the server starts
3. Frontend -
 - Lets the user create a BTC wallet
 - Lets the user sign a txn, send it over to one of the miner servers



