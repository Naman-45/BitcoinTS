/*
  Warnings:

  - You are about to drop the `UTXO` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UTXO" DROP CONSTRAINT "UTXO_ownerId_fkey";

-- DropTable
DROP TABLE "UTXO";

-- CreateTable
CREATE TABLE "Utxo" (
    "id" SERIAL NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "isSpent" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" INTEGER NOT NULL,

    CONSTRAINT "Utxo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Utxo" ADD CONSTRAINT "Utxo_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
