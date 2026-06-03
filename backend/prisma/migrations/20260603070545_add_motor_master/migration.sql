-- AlterTable
ALTER TABLE `vehicle` ADD COLUMN `brand_id` INTEGER NULL,
    ADD COLUMN `engine_capacity_id` INTEGER NULL,
    ADD COLUMN `motor_type_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `MotorBrand` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `MotorBrand_nama_key`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MotorType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `brand_id` INTEGER NOT NULL,

    UNIQUE INDEX `MotorType_brand_id_nama_key`(`brand_id`, `nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EngineCapacity` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kapasitas` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `EngineCapacity_kapasitas_key`(`kapasitas`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Vehicle` ADD CONSTRAINT `Vehicle_brand_id_fkey` FOREIGN KEY (`brand_id`) REFERENCES `MotorBrand`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Vehicle` ADD CONSTRAINT `Vehicle_motor_type_id_fkey` FOREIGN KEY (`motor_type_id`) REFERENCES `MotorType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Vehicle` ADD CONSTRAINT `Vehicle_engine_capacity_id_fkey` FOREIGN KEY (`engine_capacity_id`) REFERENCES `EngineCapacity`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MotorType` ADD CONSTRAINT `MotorType_brand_id_fkey` FOREIGN KEY (`brand_id`) REFERENCES `MotorBrand`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
