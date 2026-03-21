CREATE TABLE `admin_audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`admin_user_id` text NOT NULL,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`details` text,
	`performed_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_admin_audit_log_admin` ON `admin_audit_log` (`admin_user_id`);--> statement-breakpoint
CREATE INDEX `idx_admin_audit_log_entity` ON `admin_audit_log` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `idx_admin_audit_log_performed_at` ON `admin_audit_log` (`performed_at`);--> statement-breakpoint
CREATE TABLE `breaks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`started_at` text NOT NULL,
	`ended_at` text,
	`duration_minutes` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_breaks_user_id` ON `breaks` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_breaks_started_at` ON `breaks` (`started_at`);--> statement-breakpoint
CREATE TABLE `daily_summaries` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`tasks_completed` integer DEFAULT 0 NOT NULL,
	`tasks_worked_on` integer DEFAULT 0 NOT NULL,
	`total_points` integer DEFAULT 0 NOT NULL,
	`focus_minutes` integer DEFAULT 0 NOT NULL,
	`break_minutes` integer DEFAULT 0 NOT NULL,
	`work_session_count` integer DEFAULT 0 NOT NULL,
	`clock_in_time` text,
	`clock_out_time` text,
	`efficiency_rating` real DEFAULT 0 NOT NULL,
	`standout_moment` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_daily_summaries_user_date` ON `daily_summaries` (`user_id`,`date`);--> statement-breakpoint
CREATE INDEX `idx_daily_summaries_user_id_date` ON `daily_summaries` (`user_id`,`date`);--> statement-breakpoint
CREATE TABLE `features` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`display_name` text NOT NULL,
	`description` text,
	`value_type` text NOT NULL,
	`category` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `features_key_unique` ON `features` (`key`);--> statement-breakpoint
CREATE INDEX `idx_features_category` ON `features` (`category`);--> statement-breakpoint
CREATE TABLE `goals` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`type` text NOT NULL,
	`target_value` integer NOT NULL,
	`period` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_goals_user_id` ON `goals` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_goals_workspace_id` ON `goals` (`workspace_id`);--> statement-breakpoint
CREATE TABLE `plan_features` (
	`id` text PRIMARY KEY NOT NULL,
	`plan_id` text NOT NULL,
	`feature_id` text NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`limit_value` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_plan_features_plan_feature` ON `plan_features` (`plan_id`,`feature_id`);--> statement-breakpoint
CREATE INDEX `idx_plan_features_feature_id` ON `plan_features` (`feature_id`);--> statement-breakpoint
CREATE TABLE `plan_prices` (
	`id` text PRIMARY KEY NOT NULL,
	`plan_id` text NOT NULL,
	`billing_period` text NOT NULL,
	`price_cents` integer NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`stripe_price_id` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_plan_prices_plan_id` ON `plan_prices` (`plan_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_plan_prices_plan_period` ON `plan_prices` (`plan_id`,`billing_period`);--> statement-breakpoint
CREATE TABLE `plans` (
	`id` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`description` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `points_ledger` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`task_id` text,
	`time_entry_id` text,
	`points` integer NOT NULL,
	`reason` text NOT NULL,
	`description` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_points_ledger_user_id` ON `points_ledger` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_points_ledger_user_created` ON `points_ledger` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_points_ledger_task_id` ON `points_ledger` (`task_id`);--> statement-breakpoint
CREATE TABLE `project_teams` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`team_id` text NOT NULL,
	`added_at` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_project_teams_project_team` ON `project_teams` (`project_id`,`team_id`);--> statement-breakpoint
CREATE INDEX `idx_project_teams_team_id` ON `project_teams` (`team_id`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`color` text,
	`icon` text,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`completion_percentage` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_projects_workspace_id` ON `projects` (`workspace_id`);--> statement-breakpoint
CREATE INDEX `idx_projects_user_id` ON `projects` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_projects_deleted` ON `projects` (`deleted`);--> statement-breakpoint
CREATE TABLE `scheduled_events` (
	`id` text PRIMARY KEY NOT NULL,
	`task_id` text,
	`user_id` text NOT NULL,
	`start_time` text NOT NULL,
	`duration_minutes` integer NOT NULL,
	`label` text NOT NULL,
	`type` text NOT NULL,
	`external_id` text,
	`external_source` text,
	`metadata` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_scheduled_events_user_id` ON `scheduled_events` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_scheduled_events_start_time` ON `scheduled_events` (`start_time`);--> statement-breakpoint
CREATE INDEX `idx_scheduled_events_external_id` ON `scheduled_events` (`external_id`);--> statement-breakpoint
CREATE TABLE `subscription_history` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`old_plan_id` text,
	`new_plan_id` text NOT NULL,
	`old_price_cents` integer,
	`new_price_cents` integer NOT NULL,
	`reason` text NOT NULL,
	`changed_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_subscription_history_user_id` ON `subscription_history` (`user_id`);--> statement-breakpoint
CREATE TABLE `task_types` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`icon` text,
	`color` text,
	`is_default` integer DEFAULT false NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_task_types_user_id` ON `task_types` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_task_types_workspace_id` ON `task_types` (`workspace_id`);--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`project_id` text NOT NULL,
	`parent_task_id` text,
	`title` text NOT NULL,
	`description` text,
	`difficulty` text NOT NULL,
	`priority` text DEFAULT 'NONE' NOT NULL,
	`progress` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'BACKLOG' NOT NULL,
	`assignee_user_id` text,
	`team_id` text,
	`estimated_minutes` integer,
	`max_minutes` integer,
	`actual_minutes` integer DEFAULT 0 NOT NULL,
	`planned_for_date` text,
	`due_date` text,
	`task_type_id` text,
	`display_order` integer DEFAULT 0 NOT NULL,
	`tags` text,
	`external_id` text,
	`external_source` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`completed_at` text,
	`deleted` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_tasks_user_id` ON `tasks` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_tasks_project_id` ON `tasks` (`project_id`);--> statement-breakpoint
CREATE INDEX `idx_tasks_parent_task_id` ON `tasks` (`parent_task_id`);--> statement-breakpoint
CREATE INDEX `idx_tasks_status` ON `tasks` (`status`);--> statement-breakpoint
CREATE INDEX `idx_tasks_planned_for_date` ON `tasks` (`planned_for_date`);--> statement-breakpoint
CREATE INDEX `idx_tasks_deleted` ON `tasks` (`deleted`);--> statement-breakpoint
CREATE TABLE `team_members` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text NOT NULL,
	`added_by` text,
	`added_at` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_team_members_team_user` ON `team_members` (`team_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `idx_team_members_user_id` ON `team_members` (`user_id`);--> statement-breakpoint
CREATE TABLE `teams` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`color` text,
	`icon` text,
	`is_default` integer DEFAULT false NOT NULL,
	`lead_user_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_teams_workspace_id` ON `teams` (`workspace_id`);--> statement-breakpoint
CREATE INDEX `idx_teams_lead_user_id` ON `teams` (`lead_user_id`);--> statement-breakpoint
CREATE TABLE `time_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`task_id` text NOT NULL,
	`user_id` text NOT NULL,
	`started_at` text NOT NULL,
	`ended_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_time_entries_task_id` ON `time_entries` (`task_id`);--> statement-breakpoint
CREATE INDEX `idx_time_entries_user_id` ON `time_entries` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_time_entries_started_at` ON `time_entries` (`started_at`);--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`user_id` text PRIMARY KEY NOT NULL,
	`theme` text DEFAULT 'SYSTEM' NOT NULL,
	`check_in_frequency` integer DEFAULT 30 NOT NULL,
	`check_in_enabled` integer DEFAULT true NOT NULL,
	`end_of_day_summary_time` text DEFAULT '17:00' NOT NULL,
	`end_of_day_summary_enabled` integer DEFAULT true NOT NULL,
	`auto_pause_minutes` integer DEFAULT 10 NOT NULL,
	`auto_pause_enabled` integer DEFAULT true NOT NULL,
	`break_reminder_enabled` integer DEFAULT true NOT NULL,
	`break_reminder_minutes` integer DEFAULT 90 NOT NULL,
	`accent_color` text,
	`font_size` text DEFAULT 'MEDIUM' NOT NULL,
	`density` text DEFAULT 'COMFORTABLE' NOT NULL,
	`keyboard_shortcuts` text,
	`sound_enabled` integer DEFAULT true NOT NULL,
	`sound_volume` integer DEFAULT 80 NOT NULL,
	`enable_haptic_feedback` integer DEFAULT false NOT NULL,
	`auto_start_timer` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`plan_id` text NOT NULL,
	`status` text NOT NULL,
	`price_cents` integer NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`billing_period` text NOT NULL,
	`stripe_customer_id` text,
	`stripe_subscription_id` text,
	`stripe_price_id` text,
	`started_at` text NOT NULL,
	`current_period_start` text,
	`current_period_end` text,
	`canceled_at` text,
	`trial_ends_at` text,
	`is_grandfathered` integer DEFAULT false NOT NULL,
	`grandfathered_reason` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_subscriptions_user_id_unique` ON `user_subscriptions` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_user_subscriptions_user_id` ON `user_subscriptions` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_user_subscriptions_plan_id` ON `user_subscriptions` (`plan_id`);--> statement-breakpoint
CREATE INDEX `idx_user_subscriptions_status` ON `user_subscriptions` (`status`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`first_name` text,
	`last_name` text,
	`avatar_url` text,
	`timezone` text DEFAULT 'UTC' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `idx_users_email` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `work_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`status` text NOT NULL,
	`clocked_in_at` text NOT NULL,
	`clocked_out_at` text,
	`total_focus_minutes` integer DEFAULT 0 NOT NULL,
	`total_break_minutes` integer DEFAULT 0 NOT NULL,
	`date` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_work_sessions_user_id` ON `work_sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_work_sessions_date` ON `work_sessions` (`date`);--> statement-breakpoint
CREATE TABLE `workspace_members` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text NOT NULL,
	`invited_by` text,
	`joined_at` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_workspace_members_workspace_user` ON `workspace_members` (`workspace_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `idx_workspace_members_user_id` ON `workspace_members` (`user_id`);--> statement-breakpoint
CREATE TABLE `workspace_statuses` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`icon` text DEFAULT 'Circle' NOT NULL,
	`color` text DEFAULT '#22c55e' NOT NULL,
	`is_enabled` integer DEFAULT true NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	`is_default` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_workspace_statuses_workspace_id` ON `workspace_statuses` (`workspace_id`);--> statement-breakpoint
CREATE TABLE `workspace_user_preferences` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`default_view` text DEFAULT 'TODAY' NOT NULL,
	`group_tasks_by` text DEFAULT 'PROJECT' NOT NULL,
	`sort_tasks_by` text DEFAULT 'PRIORITY' NOT NULL,
	`show_completed_tasks` integer DEFAULT false NOT NULL,
	`show_quick_add_button` integer DEFAULT true NOT NULL,
	`keyboard_shortcuts_enabled` integer DEFAULT true NOT NULL,
	`auto_start_timer_on_task` integer DEFAULT false NOT NULL,
	`track_time` integer DEFAULT true NOT NULL,
	`track_breaks` integer DEFAULT true NOT NULL,
	`track_completion_times` integer DEFAULT true NOT NULL,
	`track_focus` integer DEFAULT true NOT NULL,
	`track_project_switching` integer DEFAULT false NOT NULL,
	`stats_visibility` text DEFAULT 'ONLY_ME' NOT NULL,
	`show_on_leaderboard` integer DEFAULT false NOT NULL,
	`share_achievements` integer DEFAULT false NOT NULL,
	`data_retention` text DEFAULT 'FOREVER' NOT NULL,
	`task_reminders` integer DEFAULT true NOT NULL,
	`goal_progress_notifications` integer DEFAULT true NOT NULL,
	`break_reminders` integer DEFAULT true NOT NULL,
	`daily_summary` integer DEFAULT true NOT NULL,
	`weekly_schedule` text,
	`working_hours_start` text DEFAULT '09:00' NOT NULL,
	`working_hours_end` text DEFAULT '17:00' NOT NULL,
	`working_days` text DEFAULT '[1,2,3,4,5]' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_workspace_user_prefs_user_workspace` ON `workspace_user_preferences` (`user_id`,`workspace_id`);--> statement-breakpoint
CREATE TABLE `workspace_user_status` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`status` text NOT NULL,
	`status_text` text,
	`active_task_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_workspace_user_status_user_workspace` ON `workspace_user_status` (`user_id`,`workspace_id`);--> statement-breakpoint
CREATE INDEX `idx_workspace_user_status_workspace_id` ON `workspace_user_status` (`workspace_id`);--> statement-breakpoint
CREATE TABLE `workspaces` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_user_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`icon` text,
	`color` text,
	`timezone` text DEFAULT 'America/New_York' NOT NULL,
	`week_starts_on` integer DEFAULT 1 NOT NULL,
	`default_project_id` text,
	`default_team_id` text,
	`type` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_workspaces_owner_user_id` ON `workspaces` (`owner_user_id`);