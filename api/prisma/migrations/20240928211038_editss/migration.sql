/*
  Warnings:

  - You are about to drop the `Utxo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Utxo" DROP CONSTRAINT "Utxo_ownerId_fkey";

-- DropTable
DROP TABLE "Utxo";

-- CreateTable
CREATE TABLE "uTXO" (
    "id" SERIAL NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "isSpent" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" INTEGER NOT NULL,

    CONSTRAINT "uTXO_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "uTXO" ADD CONSTRAINT "uTXO_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
