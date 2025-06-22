/*
  Warnings:

  - A unique constraint covering the columns `[invitationToken]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[emailVerificationToken]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `users` ADD COLUMN `emailVerificationExpiry` DATETIME(3) NULL,
    ADD COLUMN `emailVerificationToken` VARCHAR(191) NULL,
    ADD COLUMN `invitationExpiresAt` DATETIME(3) NULL,
    ADD COLUMN `invitationToken` VARCHAR(191) NULL,
    ADD COLUMN `invitedAt` DATETIME(3) NULL,
    ADD COLUMN `invitedBy` VARCHAR(191) NULL,
    ADD COLUMN `isInvited` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `password` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `users_invitationToken_key` ON `users`(`invitationToken`);

-- CreateIndex
CREATE UNIQUE INDEX `users_emailVerificationToken_key` ON `users`(`emailVerificationToken`);
