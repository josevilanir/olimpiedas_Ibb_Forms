-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'CANCELADO';

-- AlterTable
ALTER TABLE "participants" ADD COLUMN     "paid_at" TIMESTAMP(3),
ADD COLUMN     "payment_method" TEXT;
