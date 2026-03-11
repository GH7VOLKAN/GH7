-- Faz 4: Brand auto_scan fields + Notifications table

-- Add auto scan fields to brands
ALTER TABLE "brands" ADD COLUMN "auto_scan" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "brands" ADD COLUMN "scan_interval" TEXT NOT NULL DEFAULT 'daily';

-- Create notifications table
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "brand_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- Add foreign key
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;
