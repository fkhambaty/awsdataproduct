export interface Database {
  public: {
    Tables: {
      parents: {
        Row: {
          id: string;
          email: string;
          name: string;
          username: string | null;
          pin: string | null;
          subscription_tier: "free" | "premium_weekly" | "premium_monthly" | "premium_yearly" | "lifetime";
          subscription_expires_at: string | null;
          welcome_email_sent_at: string | null;
          razorpay_subscription_id: string | null;
          razorpay_customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string;
          username?: string | null;
          pin?: string | null;
          subscription_tier?: "free" | "premium_weekly" | "premium_monthly" | "premium_yearly" | "lifetime";
          subscription_expires_at?: string | null;
          welcome_email_sent_at?: string | null;
          razorpay_subscription_id?: string | null;
          razorpay_customer_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["parents"]["Insert"]>;
      };
      children: {
        Row: {
          id: string;
          parent_id: string;
          name: string;
          age: number;
          avatar_config: AvatarConfig;
          photo_url: string | null;
          total_stars: number;
          total_coins: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          parent_id: string;
          name: string;
          age: number;
          avatar_config?: AvatarConfig;
          photo_url?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["children"]["Insert"]>;
      };
      zones: {
        Row: {
          id: string;
          subject: string;
          theme_name: string;
          display_name: string;
          emoji: string;
          description: string;
          color_key: string;
          is_free: boolean;
          order_index: number;
          stars_to_unlock: number;
          created_at: string;
        };
        Insert: {
          id: string;
          subject?: string;
          theme_name: string;
          display_name: string;
          emoji?: string;
          description?: string;
          color_key?: string;
          is_free?: boolean;
          order_index?: number;
          stars_to_unlock?: number;
        };
        Update: Partial<Database["public"]["Tables"]["zones"]["Insert"]>;
      };
      games: {
        Row: {
          id: string;
          zone_id: string;
          game_type: GameType;
          title: string;
          description: string;
          difficulty: number;
          config: Record<string, unknown>;
          max_stars: number;
          order_index: number;
          is_free: boolean;
          created_at: string;
        };
        Insert: {
          zone_id: string;
          game_type: GameType;
          title: string;
          description?: string;
          difficulty?: number;
          config: Record<string, unknown>;
          max_stars?: number;
          order_index?: number;
          is_free?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["games"]["Insert"]>;
      };
      progress: {
        Row: {
          id: string;
          child_id: string;
          game_id: string;
          stars_earned: number;
          score: number;
          time_spent_seconds: number;
          attempts: number;
          completed: boolean;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          child_id: string;
          game_id: string;
          stars_earned?: number;
          score?: number;
          time_spent_seconds?: number;
          attempts?: number;
          completed?: boolean;
          completed_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["progress"]["Insert"]>;
      };
      unlocks: {
        Row: {
          id: string;
          child_id: string;
          zone_id: string;
          unlocked_at: string;
        };
        Insert: {
          child_id: string;
          zone_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["unlocks"]["Insert"]>;
      };
      rewards: {
        Row: {
          id: string;
          child_id: string;
          reward_type: "sticker" | "costume" | "badge" | "title";
          reward_id: string;
          reward_name: string;
          earned_at: string;
        };
        Insert: {
          child_id: string;
          reward_type: "sticker" | "costume" | "badge" | "title";
          reward_id: string;
          reward_name?: string;
        };
        Update: Partial<Database["public"]["Tables"]["rewards"]["Insert"]>;
      };
      learning_packs: {
        Row: {
          id: string;
          parent_id: string;
          title: string;
          subject: string;
          theme: string;
          status: "draft" | "ready";
          source_text: string;
          generated: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          parent_id: string;
          title?: string;
          subject?: string;
          theme?: string;
          status?: "draft" | "ready";
          source_text?: string;
          generated?: Record<string, unknown>;
        };
        Update: Partial<Database["public"]["Tables"]["learning_packs"]["Insert"]>;
      };
      pack_pages: {
        Row: {
          id: string;
          pack_id: string;
          parent_id: string;
          storage_path: string | null;
          ocr_text: string;
          edited_text: string;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          pack_id: string;
          parent_id: string;
          storage_path?: string | null;
          ocr_text?: string;
          edited_text?: string;
          order_index?: number;
        };
        Update: Partial<Database["public"]["Tables"]["pack_pages"]["Insert"]>;
      };
      pack_assignments: {
        Row: {
          id: string;
          pack_id: string;
          child_id: string;
          parent_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          pack_id: string;
          child_id: string;
          parent_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["pack_assignments"]["Insert"]>;
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          discount_percent: number;
          free_days: number;
          active: boolean;
          expires_at: string | null;
          max_redemptions: number | null;
          redeemed_count: number;
          note: string | null;
          created_at: string;
        };
        Insert: {
          code: string;
          discount_percent?: number;
          free_days?: number;
          active?: boolean;
          expires_at?: string | null;
          max_redemptions?: number | null;
          note?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["coupons"]["Insert"] & { redeemed_count: number }>;
      };
      coupon_redemptions: {
        Row: {
          id: string;
          coupon_id: string;
          parent_id: string;
          redeemed_at: string;
        };
        Insert: {
          coupon_id: string;
          parent_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["coupon_redemptions"]["Insert"]>;
      };
      coaching_skill_axes: {
        Row: {
          id: string;
          title: string;
          parent_description: string;
          support_tip: string;
          sort_order: number;
        };
        Insert: {
          id: string;
          title: string;
          parent_description: string;
          support_tip?: string;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["coaching_skill_axes"]["Insert"]>;
      };
      game_type_skill_contribution: {
        Row: {
          game_type: string;
          skill_axis_id: string;
          weight: number;
        };
        Insert: {
          game_type: string;
          skill_axis_id: string;
          weight?: number;
        };
        Update: Partial<Database["public"]["Tables"]["game_type_skill_contribution"]["Insert"]>;
      };
      parent_coaching_reports: {
        Row: {
          child_id: string;
          updated_at: string;
          report: Record<string, unknown>;
        };
        Insert: {
          child_id: string;
          report: Record<string, unknown>;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["parent_coaching_reports"]["Insert"]>;
      };
      coaching_core_capabilities: {
        Row: {
          id: string;
          title: string;
          lens_summary: string;
          what_strong_signals: string;
          what_to_watch: string;
          parent_interventions: string;
          sort_order: number;
        };
        Insert: {
          id: string;
          title: string;
          lens_summary: string;
          what_strong_signals: string;
          what_to_watch: string;
          parent_interventions: string;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["coaching_core_capabilities"]["Insert"]>;
      };
      skill_axis_capability_map: {
        Row: {
          skill_axis_id: string;
          capability_id: string;
          weight: number;
        };
        Insert: {
          skill_axis_id: string;
          capability_id: string;
          weight?: number;
        };
        Update: Partial<Database["public"]["Tables"]["skill_axis_capability_map"]["Insert"]>;
      };
    };
    Functions: {
      leaderboard_top_stars: {
        Args: { p_limit?: number };
        Returns: {
          rank: number;
          child_id: string | null;
          total_stars: number;
          display_name: string;
          photo_url: string | null;
          is_mine: boolean;
        };
      };
      get_child_star_rank: {
        Args: { p_child_id: string };
        Returns: { rank: number; total: number };
      };
    };
  };
}

export type GameType =
  | "drag_sort"
  | "memory_match"
  | "picture_quiz"
  | "sequence_builder"
  | "spot_difference"
  | "odd_one_out"
  | "true_false"
  | "color_activity"
  | "word_picture_link"
  | "interactive_story"
  | "bubble_pop"
  | "star_catcher"
  | "pixi_lab";

export interface AvatarConfig {
  body: string;
  hair: string;
  color: string;
}

export type Parent = Database["public"]["Tables"]["parents"]["Row"];
export type Child = Database["public"]["Tables"]["children"]["Row"];
export type Zone = Database["public"]["Tables"]["zones"]["Row"];
export type Game = Database["public"]["Tables"]["games"]["Row"];
export type Progress = Database["public"]["Tables"]["progress"]["Row"];
export type Unlock = Database["public"]["Tables"]["unlocks"]["Row"];
export type Reward = Database["public"]["Tables"]["rewards"]["Row"];
export type LearningPack = Database["public"]["Tables"]["learning_packs"]["Row"];
export type PackPage = Database["public"]["Tables"]["pack_pages"]["Row"];
export type PackAssignment = Database["public"]["Tables"]["pack_assignments"]["Row"];
