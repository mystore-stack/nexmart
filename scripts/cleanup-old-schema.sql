-- Cleanup old homepage schema tables before applying new CMS schema
-- This script removes old tables that conflict with the new schema

-- Drop old tables in order of dependencies
DROP TABLE IF EXISTS "HomepageSectionVisibility" CASCADE;
DROP TABLE IF EXISTS "AnnouncementBarAnalytics" CASCADE;
DROP TABLE IF EXISTS "HomepageVersion" CASCADE;
DROP TABLE IF EXISTS "HomepageSection" CASCADE;
DROP TABLE IF EXISTS "HomepageConfig" CASCADE;
DROP TABLE IF EXISTS "AnnouncementBar" CASCADE;

-- Note: This will remove old homepage data
-- The new CMS will be initialized with default sections
