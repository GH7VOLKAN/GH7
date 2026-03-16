-- AlterTable
ALTER TABLE "brands" ADD COLUMN     "city" TEXT,
ADD COLUMN     "competitor_names" TEXT[],
ADD COLUMN     "profession" TEXT,
ADD COLUMN     "specialties" TEXT[];

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "plan" TEXT NOT NULL DEFAULT 'free',
ADD COLUMN     "plan_end_date" TIMESTAMP(3),
ADD COLUMN     "plan_start_date" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "prompts" ADD COLUMN     "category" TEXT,
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'ai_generated';
