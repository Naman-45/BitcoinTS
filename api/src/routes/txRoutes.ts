import { Router } from "express";
import { WebSocketClient } from "../SocketClient";
import prisma from "../db";

const txRoutes = Router();

function generateTransactionId() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

interface utxoType {
  id : number,
  amount: number,
  isSpent : Boolean,
  ownerId: number,
}[];

txRoutes.post("/", async (req, res) => {
  try {
    const { id, from, to, amount, signature } = req.body;
    const response = await prisma.account.findFirst({
      where: {
        publicKey: from,
      },
      include: {
        utxos: true,
      },
    });

    if (response) {
      const utxos = response["utxos"];
      let utxos1: utxoType = [];
      let executedAmount = 0;
      utxos.map((ux) => {
        if (executedAmount < amount) {
          executedAmount += ux.amount;
          utxos1.push(ux);
        }
      });
      const transaction = {
        id: generateTransactionId(),
        from,
        to,
        amount,
        UTXO: utxos1,
        signature,
      };
      const result = await WebSocketClient.getInstance().sendAndAwait({
        type: "NEW_TRANSACTION",
        payload: transaction,
      });
      if (result.data.successful === true) {
        for (const ux of utxos1) {
          await prisma.uTXO.update({
            where: { id: ux.id },
            data: { isSpent: true },
          });
        }
        await prisma.account.update({
          where: { id: from },
          data: {
            balance: {
              decrement: utxos.reduce((sum, ux) => sum + ux.amount, 0),
            },
          },
        });

        result.data.fills.map(async (utx : ) => {
          if(utx.ownerId === from) {
            await prisma.uTXO.create({
              data: {
                ownerId: from,
                amount: utx.amount,

              }
            })
          }
        })
      }

      executedAmount = 0;
      utxos1 = [];
      res.json({ message: "Transaction submitted successfully", result });
    }
  } catch (error) {
    console.error("Error submitting transaction:", error);
    res.status(500).json({ error: "Failed to submit transaction" });
  }
});

txRoutes.post("/utxos", async (req, res) => {
  const { address } = req.body;

  const response = await prisma.account.findFirst({
    where: {
      publicKey: address,
    },
    include: {
      utxos: true,
    },
  });
  //@ts-ignore
  const utxos = response["utxos"];
  res.status(200).send(utxos);
});

export default txRoutes;
