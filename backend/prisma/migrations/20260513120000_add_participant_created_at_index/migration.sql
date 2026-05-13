-- Add index on participants.created_at to speed up admin dashboard queries
-- that ORDER BY created_at DESC (findParticipants, findParticipantsMinimal).
CREATE INDEX IF NOT EXISTS "participants_created_at_idx" ON "participants"("created_at");
