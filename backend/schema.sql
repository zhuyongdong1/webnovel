-- 数据库初始化脚本

-- 创建数据库 (如果不存在)
-- CREATE DATABASE IF NOT EXISTS novel_website CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE novel_website;

-- 删除已存在的表 (开发环境方便重置)
DROP TABLE IF EXISTS `reading_records`;
DROP TABLE IF EXISTS `novel_categories`;
DROP TABLE IF EXISTS `chapters`;
DROP TABLE IF EXISTS `novels`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `admin`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `sms_codes`;

-- 创建管理员表
CREATE TABLE `admin` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL, -- 存储哈希后的密码
  `email` VARCHAR(100) NULL UNIQUE,
  `last_login` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建分类表
CREATE TABLE `categories` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `description` VARCHAR(255) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建小说表
CREATE TABLE `novels` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `author` VARCHAR(100) NOT NULL,
  `cover_image` VARCHAR(255) NULL, -- 存储封面图片相对路径或URL
  `description` TEXT NULL,
  `status` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '0-连载中, 1-已完结',
  `word_count` INT(11) NOT NULL DEFAULT 0,
  `view_count` INT(11) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_title` (`title`),
  INDEX `idx_author` (`author`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建章节表
CREATE TABLE `chapters` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `novel_id` INT(11) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `chapter_number` INT(11) NOT NULL, -- 章节序号，从1开始
  `word_count` INT(11) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_novel_id` (`novel_id`),
  INDEX `idx_chapter_number` (`chapter_number`),
  FOREIGN KEY (`novel_id`) REFERENCES `novels` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建小说与分类关联表
CREATE TABLE `novel_categories` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `novel_id` INT(11) NOT NULL,
  `category_id` INT(11) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_novel_category` (`novel_id`, `category_id`), -- 确保同一本书不会重复关联同一分类
  FOREIGN KEY (`novel_id`) REFERENCES `novels` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建阅读记录表 (用于记录匿名用户的阅读进度)
CREATE TABLE `reading_records` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `novel_id` INT(11) NOT NULL,
  `chapter_id` INT(11) NOT NULL,
  `ip_address` VARCHAR(50) NOT NULL, -- 使用IP地址标识匿名用户
  `last_read_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_novel_ip` (`novel_id`, `ip_address`),
  FOREIGN KEY (`novel_id`) REFERENCES `novels` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`chapter_id`) REFERENCES `chapters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 用户表
CREATE TABLE users (
    id INT(11) PRIMARY KEY AUTO_INCREMENT,
    phone VARCHAR(20) NOT NULL UNIQUE COMMENT '手机号',
    password VARCHAR(255) COMMENT '密码（可选，如果只用手机号登录）',
    nickname VARCHAR(50) COMMENT '昵称',
    avatar VARCHAR(255) COMMENT '头像URL',
    status TINYINT(1) DEFAULT 1 COMMENT '状态（0-禁用，1-正常）',
    last_login DATETIME COMMENT '最后登录时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 短信验证码表
CREATE TABLE sms_codes (
    id INT(11) PRIMARY KEY AUTO_INCREMENT,
    phone VARCHAR(20) NOT NULL COMMENT '手机号',
    code VARCHAR(6) NOT NULL COMMENT '验证码',
    type TINYINT(1) NOT NULL COMMENT '类型（1-注册，2-登录）',
    expired_at DATETIME NOT NULL COMMENT '过期时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_phone_type (phone, type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='短信验证码表';

-- 插入测试数据

-- 插入管理员 (密码: password123, 需要在后端注册时进行哈希处理)
INSERT INTO `admin` (`username`, `password`, `email`) VALUES
('admin', 'password123', 'admin@example.com');

-- 插入分类
INSERT INTO `categories` (`name`, `description`) VALUES
('玄幻奇幻', '充满想象力的奇幻世界'),
('都市生活', '现代都市背景的故事'),
('科幻末世', '未来科技与末日生存');

-- 插入小说
INSERT INTO `novels` (`title`, `author`, `cover_image`, `description`, `status`, `word_count`) VALUES
('永恒圣王', '雪满弓刀', '/covers/novel1_cover.jpg', '一个平凡少年，偶得神秘印记，从此踏上逆天之路...', 0, 15000),
('都市狂少', '陨落星辰', '/covers/novel2_cover.jpg', '兵王回归都市，掀起腥风血雨，美女环绕，逍遥快活。', 0, 12000),
('星际开拓者', '幻梦流光', '/covers/novel3_cover.jpg', '人类进入星际时代，探索未知宇宙，遭遇外星文明。', 1, 18000);

-- 获取小说ID和分类ID (假设ID按插入顺序为1, 2, 3)
SET @novel1_id = 1;
SET @novel2_id = 2;
SET @novel3_id = 3;
SET @cat1_id = 1;
SET @cat2_id = 2;
SET @cat3_id = 3;

-- 关联小说与分类
INSERT INTO `novel_categories` (`novel_id`, `category_id`) VALUES
(@novel1_id, @cat1_id),
(@novel2_id, @cat2_id),
(@novel3_id, @cat3_id),
(@novel1_id, @cat2_id); -- 永恒圣王也属于都市分类（示例）

-- 插入章节 (每本小说5章)
-- 小说1: 永恒圣王
INSERT INTO `chapters` (`novel_id`, `title`, `content`, `chapter_number`, `word_count`) VALUES
(@novel1_id, '第一章 神秘印记', '夜黑风高，少年苏子墨意外获得了一枚神秘的青铜方印...', 1, 3000),
(@novel1_id, '第二章 初露锋芒', '青铜方印蕴含无上力量，苏子墨开始修炼，实力突飞猛进...', 2, 3100),
(@novel1_id, '第三章 家族危机', '苏家面临强敌压迫，苏子墨挺身而出，展现惊人实力...', 3, 2900),
(@novel1_id, '第四章 玄天宗考核', '为了变得更强，苏子墨参加玄天宗的入门考核...', 4, 3050),
(@novel1_id, '第五章 一鸣惊人', '考核中，苏子墨力压群雄，震惊四座...', 5, 2950);

-- 小说2: 都市狂少
INSERT INTO `chapters` (`novel_id`, `title`, `content`, `chapter_number`, `word_count`) VALUES
(@novel2_id, '第一章 兵王归来', '昔日兵王叶凡，带着一身荣耀与伤痕，回到阔别多年的繁华都市...', 1, 2500),
(@novel2_id, '第二章 美女总裁', '刚回都市，就遇上冷艳的美女总裁，麻烦接踵而至...', 2, 2400),
(@novel2_id, '第三章 路见不平', '面对恶势力，叶凡挺身而出，展现非凡身手...', 3, 2600),
(@novel2_id, '第四章 商业帝国', '叶凡不仅武力超群，商业头脑也异于常人，开始建立自己的商业帝国...', 4, 2300),
(@novel2_id, '第五章 震撼全场', '在一场商业晚宴上，叶凡的身份曝光，震惊全场...', 5, 2200);

-- 小说3: 星际开拓者
INSERT INTO `chapters` (`novel_id`, `title`, `content`, `chapter_number`, `word_count`) VALUES
(@novel3_id, '第一章 深空远航', '公元2350年，人类乘坐"探索者号"星舰，开始了对半人马座α星系的远征...', 1, 3500),
(@novel3_id, '第二章 异星信号', '航行途中，星舰接收到来自未知文明的神秘信号...', 2, 3600),
(@novel3_id, '第三章 首次接触', '经过谨慎分析，舰长决定派出登陆小队，进行首次接触...', 3, 3700),
(@novel3_id, '第四章 文明冲突', '接触并不顺利，两个文明间的误解与冲突逐渐升级...', 4, 3400),
(@novel3_id, '第五章 绝境求生', '登陆小队陷入险境，必须在陌生的星球上为生存而战...', 5, 3800);

-- 更新小说总字数 (示例，实际应由后端逻辑计算)
UPDATE `novels` SET `word_count` = (SELECT SUM(`word_count`) FROM `chapters` WHERE `novel_id` = @novel1_id) WHERE `id` = @novel1_id;
UPDATE `novels` SET `word_count` = (SELECT SUM(`word_count`) FROM `chapters` WHERE `novel_id` = @novel2_id) WHERE `id` = @novel2_id;
UPDATE `novels` SET `word_count` = (SELECT SUM(`word_count`) FROM `chapters` WHERE `novel_id` = @novel3_id) WHERE `id` = @novel3_id;


