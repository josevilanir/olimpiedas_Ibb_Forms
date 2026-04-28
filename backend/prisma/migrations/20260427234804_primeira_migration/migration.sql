-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('SIM', 'NAO', 'GR');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MASCULINO', 'FEMININO');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modalities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "min_age" INTEGER,
    "max_age" INTEGER,
    "requires_membership" BOOLEAN NOT NULL DEFAULT true,
    "coordinator_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "modalities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participants" (
    "id" TEXT NOT NULL,
    "is_for_child" BOOLEAN NOT NULL DEFAULT false,
    "is_member" "MembershipStatus" NOT NULL,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "full_name" TEXT NOT NULL,
    "parent_name" TEXT,
    "whatsapp" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "health_issues" TEXT,
    "terms_accepted" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "participant_id" TEXT NOT NULL,
    "modality_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "modalities_name_key" ON "modalities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_participant_id_modality_id_key" ON "subscriptions"("participant_id", "modality_id");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_modality_id_fkey" FOREIGN KEY ("modality_id") REFERENCES "modalities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
