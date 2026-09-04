-- 自动从 yudao-module-ai DO 反推生成的建表 DDL
SET NAMES utf8mb4;

DROP TABLE IF EXISTS `ai_image`;
CREATE TABLE `ai_image` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `user_id` bigint DEFAULT NULL,
  `prompt` text DEFAULT NULL,
  `platform` varchar(512) DEFAULT NULL,
  `model_id` bigint DEFAULT NULL,
  `model` varchar(512) DEFAULT NULL,
  `width` int DEFAULT NULL,
  `height` int DEFAULT NULL,
  `status` int DEFAULT NULL,
  `finish_time` datetime DEFAULT NULL,
  `error_message` text DEFAULT NULL,
  `pic_url` text DEFAULT NULL,
  `public_status` bit(1) DEFAULT NULL,
  `options` varchar(2048) DEFAULT NULL,
  `buttons` varchar(2048) DEFAULT NULL,
  `task_id` varchar(512) DEFAULT NULL,
  `creator` varchar(64) NOT NULL DEFAULT '',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updater` varchar(64) NOT NULL DEFAULT '',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='ai_image';

DROP TABLE IF EXISTS `ai_api_key`;
CREATE TABLE `ai_api_key` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(512) DEFAULT NULL,
  `api_key` varchar(512) DEFAULT NULL,
  `platform` varchar(512) DEFAULT NULL,
  `url` text DEFAULT NULL,
  `status` int DEFAULT NULL,
  `creator` varchar(64) NOT NULL DEFAULT '',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updater` varchar(64) NOT NULL DEFAULT '',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='ai_api_key';

DROP TABLE IF EXISTS `ai_chat_role`;
CREATE TABLE `ai_chat_role` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(512) DEFAULT NULL,
  `avatar` varchar(512) DEFAULT NULL,
  `category` varchar(512) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `system_message` text DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  `model_id` bigint DEFAULT NULL,
  `knowledge_ids` varchar(2048) DEFAULT NULL,
  `tool_ids` varchar(2048) DEFAULT NULL,
  `mcp_client_names` varchar(2048) DEFAULT NULL,
  `public_status` bit(1) DEFAULT NULL,
  `sort` int DEFAULT NULL,
  `status` int DEFAULT NULL,
  `creator` varchar(64) NOT NULL DEFAULT '',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updater` varchar(64) NOT NULL DEFAULT '',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='ai_chat_role';

DROP TABLE IF EXISTS `ai_model`;
CREATE TABLE `ai_model` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `key_id` bigint DEFAULT NULL,
  `name` varchar(512) DEFAULT NULL,
  `model` varchar(512) DEFAULT NULL,
  `platform` varchar(512) DEFAULT NULL,
  `type` int DEFAULT NULL,
  `sort` int DEFAULT NULL,
  `status` int DEFAULT NULL,
  `temperature` decimal(24,6) DEFAULT NULL,
  `max_tokens` int DEFAULT NULL,
  `max_contexts` int DEFAULT NULL,
  `creator` varchar(64) NOT NULL DEFAULT '',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updater` varchar(64) NOT NULL DEFAULT '',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='ai_model';

DROP TABLE IF EXISTS `ai_tool`;
CREATE TABLE `ai_tool` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(512) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` int DEFAULT NULL,
  `creator` varchar(64) NOT NULL DEFAULT '',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updater` varchar(64) NOT NULL DEFAULT '',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='ai_tool';

DROP TABLE IF EXISTS `ai_write`;
CREATE TABLE `ai_write` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `user_id` bigint DEFAULT NULL,
  `type` int DEFAULT NULL,
  `platform` varchar(512) DEFAULT NULL,
  `model_id` bigint DEFAULT NULL,
  `model` varchar(512) DEFAULT NULL,
  `prompt` text DEFAULT NULL,
  `generated_content` text DEFAULT NULL,
  `original_content` text DEFAULT NULL,
  `length` int DEFAULT NULL,
  `format` int DEFAULT NULL,
  `tone` int DEFAULT NULL,
  `language` int DEFAULT NULL,
  `error_message` text DEFAULT NULL,
  `creator` varchar(64) NOT NULL DEFAULT '',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updater` varchar(64) NOT NULL DEFAULT '',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='ai_write';

DROP TABLE IF EXISTS `ai_mind_map`;
CREATE TABLE `ai_mind_map` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `user_id` bigint DEFAULT NULL,
  `platform` varchar(512) DEFAULT NULL,
  `model_id` bigint DEFAULT NULL,
  `model` varchar(512) DEFAULT NULL,
  `prompt` text DEFAULT NULL,
  `generated_content` text DEFAULT NULL,
  `error_message` text DEFAULT NULL,
  `creator` varchar(64) NOT NULL DEFAULT '',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updater` varchar(64) NOT NULL DEFAULT '',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='ai_mind_map';

DROP TABLE IF EXISTS `ai_chat_message`;
CREATE TABLE `ai_chat_message` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `conversation_id` bigint DEFAULT NULL,
  `reply_id` bigint DEFAULT NULL,
  `type` varchar(512) DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  `role_id` bigint DEFAULT NULL,
  `model` varchar(512) DEFAULT NULL,
  `model_id` bigint DEFAULT NULL,
  `content` text DEFAULT NULL,
  `reasoning_content` text DEFAULT NULL,
  `use_context` bit(1) DEFAULT NULL,
  `segment_ids` varchar(2048) DEFAULT NULL,
  `web_search_pages` varchar(2048) DEFAULT NULL,
  `attachment_urls` varchar(2048) DEFAULT NULL,
  `creator` varchar(64) NOT NULL DEFAULT '',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updater` varchar(64) NOT NULL DEFAULT '',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='ai_chat_message';

DROP TABLE IF EXISTS `ai_chat_conversation`;
CREATE TABLE `ai_chat_conversation` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `user_id` bigint DEFAULT NULL,
  `title` varchar(512) DEFAULT NULL,
  `pinned` bit(1) DEFAULT NULL,
  `pinned_time` datetime DEFAULT NULL,
  `role_id` bigint DEFAULT NULL,
  `model_id` bigint DEFAULT NULL,
  `model` varchar(512) DEFAULT NULL,
  `system_message` text DEFAULT NULL,
  `temperature` decimal(24,6) DEFAULT NULL,
  `max_tokens` int DEFAULT NULL,
  `max_contexts` int DEFAULT NULL,
  `creator` varchar(64) NOT NULL DEFAULT '',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updater` varchar(64) NOT NULL DEFAULT '',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='ai_chat_conversation';

DROP TABLE IF EXISTS `ai_knowledge_document`;
CREATE TABLE `ai_knowledge_document` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `knowledge_id` bigint DEFAULT NULL,
  `name` varchar(512) DEFAULT NULL,
  `url` text DEFAULT NULL,
  `content` text DEFAULT NULL,
  `content_length` int DEFAULT NULL,
  `tokens` int DEFAULT NULL,
  `segment_max_tokens` int DEFAULT NULL,
  `retrieval_count` int DEFAULT NULL,
  `status` int DEFAULT NULL,
  `creator` varchar(64) NOT NULL DEFAULT '',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updater` varchar(64) NOT NULL DEFAULT '',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='ai_knowledge_document';

DROP TABLE IF EXISTS `ai_knowledge`;
CREATE TABLE `ai_knowledge` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(512) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `embedding_model_id` bigint DEFAULT NULL,
  `embedding_model` varchar(512) DEFAULT NULL,
  `top_k` int DEFAULT NULL,
  `similarity_threshold` decimal(24,6) DEFAULT NULL,
  `status` int DEFAULT NULL,
  `creator` varchar(64) NOT NULL DEFAULT '',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updater` varchar(64) NOT NULL DEFAULT '',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='ai_knowledge';

DROP TABLE IF EXISTS `ai_knowledge_segment`;
CREATE TABLE `ai_knowledge_segment` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `knowledge_id` bigint DEFAULT NULL,
  `document_id` bigint DEFAULT NULL,
  `content` text DEFAULT NULL,
  `content_length` int DEFAULT NULL,
  `vector_id` varchar(512) DEFAULT NULL,
  `tokens` int DEFAULT NULL,
  `retrieval_count` int DEFAULT NULL,
  `status` int DEFAULT NULL,
  `creator` varchar(64) NOT NULL DEFAULT '',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updater` varchar(64) NOT NULL DEFAULT '',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='ai_knowledge_segment';

DROP TABLE IF EXISTS `ai_workflow`;
CREATE TABLE `ai_workflow` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(512) DEFAULT NULL,
  `code` varchar(512) DEFAULT NULL,
  `graph` varchar(512) DEFAULT NULL,
  `remark` text DEFAULT NULL,
  `status` int DEFAULT NULL,
  `creator` varchar(64) NOT NULL DEFAULT '',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updater` varchar(64) NOT NULL DEFAULT '',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='ai_workflow';

DROP TABLE IF EXISTS `ai_music`;
CREATE TABLE `ai_music` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `user_id` bigint DEFAULT NULL,
  `title` varchar(512) DEFAULT NULL,
  `lyric` varchar(512) DEFAULT NULL,
  `image_url` text DEFAULT NULL,
  `audio_url` text DEFAULT NULL,
  `video_url` text DEFAULT NULL,
  `status` int DEFAULT NULL,
  `generate_mode` int DEFAULT NULL,
  `description` text DEFAULT NULL,
  `platform` varchar(512) DEFAULT NULL,
  `model` varchar(512) DEFAULT NULL,
  `tags` varchar(2048) DEFAULT NULL,
  `duration` decimal(24,6) DEFAULT NULL,
  `public_status` bit(1) DEFAULT NULL,
  `task_id` varchar(512) DEFAULT NULL,
  `error_message` text DEFAULT NULL,
  `creator` varchar(64) NOT NULL DEFAULT '',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updater` varchar(64) NOT NULL DEFAULT '',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='ai_music';

