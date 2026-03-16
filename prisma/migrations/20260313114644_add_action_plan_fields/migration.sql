-- AlterTable
ALTER TABLE "action_tasks" ADD COLUMN     "can_we_do_it" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "difficulty" TEXT,
ADD COLUMN     "estimated_time" TEXT,
ADD COLUMN     "self_service_steps" JSONB;
