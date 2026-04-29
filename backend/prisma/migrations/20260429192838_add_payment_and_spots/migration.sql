-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDENTE', 'PAGO');

-- AlterTable
ALTER TABLE "modalities" ADD COLUMN     "max_spots" INTEGER;

-- AlterTable
ALTER TABLE "participants" ADD COLUMN     "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDENTE';
