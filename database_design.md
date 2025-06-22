# 小说阅读网站数据库设计

## 数据库表结构

### 1. 小说表 (novels)
```
id: INT(11) - 主键，自增
title: VARCHAR(255) - 小说标题
author: VARCHAR(100) - 作者名称
cover_image: VARCHAR(255) - 封面图片路径
description: TEXT - 小说简介
status: TINYINT(1) - 小说状态（0-连载中，1-已完结）
word_count: INT(11) - 总字数
view_count: INT(11) - 浏览次数
created_at: DATETIME - 创建时间
updated_at: DATETIME - 更新时间
```

### 2. 章节表 (chapters)
```
id: INT(11) - 主键，自增
novel_id: INT(11) - 外键，关联小说表
title: VARCHAR(255) - 章节标题
content: LONGTEXT - 章节内容
chapter_number: INT(11) - 章节序号
word_count: INT(11) - 章节字数
created_at: DATETIME - 创建时间
updated_at: DATETIME - 更新时间
```

### 3. 分类表 (categories)
```
id: INT(11) - 主键，自增
name: VARCHAR(50) - 分类名称
description: VARCHAR(255) - 分类描述
created_at: DATETIME - 创建时间
updated_at: DATETIME - 更新时间
```

### 4. 小说与分类关联表 (novel_categories)
```
id: INT(11) - 主键，自增
novel_id: INT(11) - 外键，关联小说表
category_id: INT(11) - 外键，关联分类表
created_at: DATETIME - 创建时间
updated_at: DATETIME - 更新时间
```

### 5. 管理员表 (admin)
```
id: INT(11) - 主键，自增
username: VARCHAR(50) - 用户名
password: VARCHAR(255) - 密码（加密存储）
email: VARCHAR(100) - 邮箱
last_login: DATETIME - 最后登录时间
created_at: DATETIME - 创建时间
updated_at: DATETIME - 更新时间
```

### 6. 阅读记录表 (reading_records)
```
id: INT(11) - 主键，自增
novel_id: INT(11) - 外键，关联小说表
chapter_id: INT(11) - 外键，关联章节表
ip_address: VARCHAR(50) - 读者IP地址（用于标识不同读者）
last_read_at: DATETIME - 最后阅读时间
created_at: DATETIME - 创建时间
updated_at: DATETIME - 更新时间
```

## 表关系说明

1. 一本小说可以有多个章节（一对多关系）
2. 一本小说可以属于多个分类，一个分类可以包含多本小说（多对多关系，通过novel_categories表关联）
3. 阅读记录表用于记录不同IP地址的阅读进度，实现自动记录阅读进度功能

## 索引设计

1. novels表：
   - 主键索引：id
   - 普通索引：title, author, status

2. chapters表：
   - 主键索引：id
   - 外键索引：novel_id
   - 普通索引：chapter_number

3. categories表：
   - 主键索引：id
   - 唯一索引：name

4. novel_categories表：
   - 主键索引：id
   - 外键索引：novel_id, category_id
   - 联合唯一索引：(novel_id, category_id)

5. admin表：
   - 主键索引：id
   - 唯一索引：username, email

6. reading_records表：
   - 主键索引：id
   - 外键索引：novel_id, chapter_id
   - 联合索引：(novel_id, ip_address)
