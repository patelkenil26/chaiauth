DROP INDEX "consents_user_client_idx";--> statement-breakpoint
ALTER TABLE "consents" ADD CONSTRAINT "consents_user_client_unique" UNIQUE("user_id","client_id");