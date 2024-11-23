-- CreateTable
CREATE TABLE `Region` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `region_code` INTEGER NOT NULL,
    `region` CHAR(255) NOT NULL,
    `longitude` DOUBLE NOT NULL DEFAULT 0,
    `latitude` DOUBLE NOT NULL DEFAULT 0,
    `has_points` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Region_region_code_key`(`region_code`),
    INDEX `Region_has_points_longitude_latitude_idx`(`has_points`, `longitude`, `latitude`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `City` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` INTEGER NOT NULL,
    `city` CHAR(255) NOT NULL,
    `region` CHAR(255) NOT NULL,
    `region_code` INTEGER NOT NULL,
    `longitude` DOUBLE NOT NULL,
    `latitude` DOUBLE NOT NULL,
    `points_qty` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `City_code_key`(`code`),
    INDEX `City_region_code_idx`(`region_code`),
    INDEX `City_points_qty_longitude_latitude_idx`(`points_qty`, `longitude`, `latitude`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Point` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` CHAR(10) NOT NULL,
    `uuid` CHAR(36) NOT NULL,
    `name` CHAR(255) NOT NULL,
    `region_code` INTEGER NOT NULL,
    `city_code` INTEGER NOT NULL,
    `longitude` DOUBLE NOT NULL,
    `latitude` DOUBLE NOT NULL,
    `address` CHAR(255) NOT NULL,
    `address_full` CHAR(255) NOT NULL,
    `address_comment` CHAR(255) NULL,
    `nearest_station` CHAR(255) NULL,
    `nearest_metro_station` CHAR(255) NULL,
    `work_time` CHAR(100) NOT NULL,
    `phones` JSON NOT NULL,
    `email` CHAR(255) NULL,
    `note` CHAR(255) NULL,
    `type` CHAR(8) NOT NULL,
    `owner_code` CHAR(255) NOT NULL,
    `take_only` BOOLEAN NOT NULL,
    `is_handout` BOOLEAN NOT NULL,
    `is_reception` BOOLEAN NOT NULL,
    `is_dressing_room` BOOLEAN NOT NULL,
    `have_cashless` BOOLEAN NOT NULL,
    `have_cash` BOOLEAN NOT NULL,
    `have_fast_payment_system` BOOLEAN NOT NULL,
    `allowed_cod` BOOLEAN NOT NULL,
    `is_ltl` BOOLEAN NULL,
    `fulfillment` BOOLEAN NULL,
    `site` CHAR(255) NULL,
    `work_time_list` JSON NOT NULL,
    `work_time_exception_list` JSON NULL,
    `weight_min` DOUBLE NULL,
    `weight_max` DOUBLE NULL,
    `dimensions` JSON NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Point_code_key`(`code`),
    INDEX `Point_city_code_idx`(`city_code`),
    INDEX `Point_region_code_idx`(`region_code`),
    INDEX `Point_is_deleted_longitude_latitude_idx`(`is_deleted`, `longitude`, `latitude`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
