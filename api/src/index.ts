import express from 'express';
import txRoutes from './routes/txRoutes';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';
import accountRoutes from './routes/accountRoutes';

dotenv.config();
const app = express();
app.use(express.json());

const port = process.env.PORT ?? 3000;

app.use('/transaction', txRoutes);
app.use('/user', userRoutes);
app.use('/account', accountRoutes);


app.listen(port, () => {
    console.log('Api server is listening on port 3000');
})


/* 
    utxo set at miner - done
    first transaction i.e; coinbase Transaction (6.25 BTC reward) for successful mining of the block - done
    at api server - update user balance from acknowledgement
    client -
        hd wallets
            generate multiple accounts using derivative paths
            fetch id and associated accounts using mnemonic phrases
        create and sign a transaction
        get and update transaction status -> pending -> successful/failed    

        UI -
            memonic phrases ( 12 words proper display), ability to copy on clipboard
            remove any 3 random words and ask user to input those words to veirfy
            create a password
            option to create more account
            initialize transaction form
            transaction status
               particular account
                    display account balance
                    transaction history              
*/
