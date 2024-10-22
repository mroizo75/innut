-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `bedrift` VARCHAR(191) NOT NULL,
    `orgnr` VARCHAR(191) NOT NULL,
    `navn` VARCHAR(191) NOT NULL,
    `etternavn` VARCHAR(191) NOT NULL,
    `postnr` VARCHAR(191) NOT NULL,
    `sted` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
