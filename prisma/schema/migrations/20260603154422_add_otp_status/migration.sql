-- AlterTable
ALTER TABLE "otp_registrations" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "token" TEXT;
