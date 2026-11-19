CREATE TABLE "login_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"client_id" varchar(255) NOT NULL,
	"method" varchar(30) NOT NULL,
	"browser" varchar(100),
	"browser_version" varchar(50),
	"os" varchar(100),
	"device" varchar(20),
	"language" varchar(35),
	"ip" varchar(64),
	"country" varchar(2),
	"region" varchar(100),
	"city" varchar(100),
	"timezone" varchar(64),
	"latitude" double precision,
	"longitude" double precision,
	"is_new_device" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "login_events" ADD CONSTRAINT "login_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "login_events_user_created_idx" ON "login_events" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "login_events_client_idx" ON "login_events" USING btree ("client_id");