CREATE TABLE "bonds" (
	"id" text PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"subject_id" text NOT NULL,
	"object_id" text NOT NULL,
	"certainty" text,
	"sources" jsonb,
	"family_ref" text
);
--> statement-breakpoint
CREATE TABLE "event_persons" (
	"event_id" text NOT NULL,
	"person_id" text NOT NULL,
	CONSTRAINT "event_persons_event_id_person_id_pk" PRIMARY KEY("event_id","person_id")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" text PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"date_text" text,
	"place" text,
	"country" text,
	"sources" jsonb
);
--> statement-breakpoint
CREATE TABLE "persons" (
	"id" text PRIMARY KEY NOT NULL,
	"given_name" text,
	"family_name" text,
	"sex" text,
	"visibility" text DEFAULT 'public' NOT NULL,
	"occupation" text,
	"tags" jsonb
);
--> statement-breakpoint
ALTER TABLE "bonds" ADD CONSTRAINT "bonds_subject_id_persons_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."persons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bonds" ADD CONSTRAINT "bonds_object_id_persons_id_fk" FOREIGN KEY ("object_id") REFERENCES "public"."persons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_persons" ADD CONSTRAINT "event_persons_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_persons" ADD CONSTRAINT "event_persons_person_id_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id") ON DELETE cascade ON UPDATE no action;