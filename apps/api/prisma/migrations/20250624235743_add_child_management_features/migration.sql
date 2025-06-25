/*
  Warnings:

  - You are about to drop the column `firstName` on the `emergency_contacts` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `emergency_contacts` table. All the data in the column will be lost.
  - You are about to drop the column `relationshipType` on the `emergency_contacts` table. All the data in the column will be lost.
  - You are about to drop the column `conditions` on the `medical_information` table. All the data in the column will be lost.
  - You are about to drop the column `physicianName` on the `medical_information` table. All the data in the column will be lost.
  - You are about to drop the column `physicianPhone` on the `medical_information` table. All the data in the column will be lost.
  - You are about to drop the `parent_child_relations` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `name` to the `emergency_contacts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `relationship` to the `emergency_contacts` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `parent_child_relations` DROP FOREIGN KEY `parent_child_relations_childId_fkey`;

-- DropForeignKey
ALTER TABLE `parent_child_relations` DROP FOREIGN KEY `parent_child_relations_parentId_fkey`;

-- AlterTable
ALTER TABLE `children` ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `enrollmentDate` DATETIME(3) NULL,
    ADD COLUMN `gender` VARCHAR(191) NULL,
    ADD COLUMN `profilePhoto` VARCHAR(191) NULL,
    ADD COLUMN `status` ENUM('ACTIVE', 'INACTIVE', 'WAITLIST', 'WITHDRAWN') NOT NULL DEFAULT 'ACTIVE',
    ADD COLUMN `withdrawalDate` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `classroom_assignments` ADD COLUMN `endDate` DATETIME(3) NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `classrooms` ADD COLUMN `ageGroup` VARCHAR(191) NULL,
    ADD COLUMN `currentEnrollment` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `emergency_contacts` DROP COLUMN `firstName`,
    DROP COLUMN `lastName`,
    DROP COLUMN `relationshipType`,
    ADD COLUMN `email` VARCHAR(191) NULL,
    ADD COLUMN `isAuthorizedPickup` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `name` VARCHAR(191) NOT NULL,
    ADD COLUMN `notes` VARCHAR(191) NULL,
    ADD COLUMN `relationship` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `medical_information` DROP COLUMN `conditions`,
    DROP COLUMN `physicianName`,
    DROP COLUMN `physicianPhone`,
    ADD COLUMN `additionalNotes` VARCHAR(191) NULL,
    ADD COLUMN `bloodType` VARCHAR(191) NULL,
    ADD COLUMN `doctorName` VARCHAR(191) NULL,
    ADD COLUMN `doctorPhone` VARCHAR(191) NULL,
    ADD COLUMN `hospitalPreference` VARCHAR(191) NULL,
    ADD COLUMN `insurancePolicyNumber` VARCHAR(191) NULL,
    ADD COLUMN `insuranceProvider` VARCHAR(191) NULL,
    ADD COLUMN `medicalConditions` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `parent_child_relations`;

-- CreateTable
CREATE TABLE `parent_child_relationships` (
    `id` VARCHAR(191) NOT NULL,
    `parentId` VARCHAR(191) NOT NULL,
    `childId` VARCHAR(191) NOT NULL,
    `relationship` ENUM('FATHER', 'MOTHER', 'GUARDIAN', 'OTHER') NOT NULL,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    `isEmergencyContact` BOOLEAN NOT NULL DEFAULT true,
    `canPickup` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `parent_child_relationships_parentId_childId_key`(`parentId`, `childId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `photos` (
    `id` VARCHAR(191) NOT NULL,
    `childId` VARCHAR(191) NOT NULL,
    `classroomId` VARCHAR(191) NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `uploadedBy` VARCHAR(191) NOT NULL,
    `photoUrl` VARCHAR(191) NOT NULL,
    `thumbnailUrl` VARCHAR(191) NULL,
    `caption` VARCHAR(191) NULL,
    `isProfilePhoto` BOOLEAN NOT NULL DEFAULT false,
    `isSharedWithParents` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `parent_child_relationships` ADD CONSTRAINT `parent_child_relationships_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `parent_child_relationships` ADD CONSTRAINT `parent_child_relationships_childId_fkey` FOREIGN KEY (`childId`) REFERENCES `children`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `photos` ADD CONSTRAINT `photos_childId_fkey` FOREIGN KEY (`childId`) REFERENCES `children`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `photos` ADD CONSTRAINT `photos_uploadedBy_fkey` FOREIGN KEY (`uploadedBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
