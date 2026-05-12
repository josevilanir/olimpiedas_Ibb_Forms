-- CreateIndex
CREATE INDEX "participants_whatsapp_idx" ON "participants"("whatsapp");

-- CreateIndex
CREATE INDEX "participants_payment_status_idx" ON "participants"("payment_status");

-- CreateIndex
CREATE INDEX "subscriptions_modality_id_idx" ON "subscriptions"("modality_id");
