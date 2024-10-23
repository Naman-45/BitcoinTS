/*
  Warnings:

  - You are about to drop the column `status` on the `UTXO` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[publicKey]` on the table `Account` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "UTXO" DROP COLUMN "status",
ADD COLUMN     "isSpent" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Account_publicKey_key" ON "Account"("publicKey");
