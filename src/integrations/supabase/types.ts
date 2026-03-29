export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      daily_brain_tests: {
        Row: {
          challenges_completed: number
          created_at: string
          id: string
          score: number
          test_date: string
          user_id: string
        }
        Insert: {
          challenges_completed?: number
          created_at?: string
          id?: string
          score?: number
          test_date?: string
          user_id: string
        }
        Update: {
          challenges_completed?: number
          created_at?: string
          id?: string
          score?: number
          test_date?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_rewards: {
        Row: {
          claimed_date: string
          created_at: string
          id: string
          points_awarded: number
          streak_count: number
          user_id: string
        }
        Insert: {
          claimed_date?: string
          created_at?: string
          id?: string
          points_awarded?: number
          streak_count?: number
          user_id: string
        }
        Update: {
          claimed_date?: string
          created_at?: string
          id?: string
          points_awarded?: number
          streak_count?: number
          user_id?: string
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          brain_score: number
          brainly_enabled: boolean
          created_at: string
          display_name: string | null
          gauntlet_high_score: number
          goals: string[] | null
          id: string
          is_plus: boolean
          last_active_at: string | null
          last_login_date: string | null
          login_streak: number
          onboarding_complete: boolean
          peak_score: number
          selected_outfit: string
          selected_subject: string
          selected_theme: string
          sleep_hours: string | null
          updated_at: string
          user_id: string
          user_type: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          brain_score?: number
          brainly_enabled?: boolean
          created_at?: string
          display_name?: string | null
          gauntlet_high_score?: number
          goals?: string[] | null
          id?: string
          is_plus?: boolean
          last_active_at?: string | null
          last_login_date?: string | null
          login_streak?: number
          onboarding_complete?: boolean
          peak_score?: number
          selected_outfit?: string
          selected_subject?: string
          selected_theme?: string
          sleep_hours?: string | null
          updated_at?: string
          user_id: string
          user_type?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          brain_score?: number
          brainly_enabled?: boolean
          created_at?: string
          display_name?: string | null
          gauntlet_high_score?: number
          goals?: string[] | null
          id?: string
          is_plus?: boolean
          last_active_at?: string | null
          last_login_date?: string | null
          login_streak?: number
          onboarding_complete?: boolean
          peak_score?: number
          selected_outfit?: string
          selected_subject?: string
          selected_theme?: string
          sleep_hours?: string | null
          updated_at?: string
          user_id?: string
          user_type?: string | null
          username?: string | null
        }
        Relationships: []
      }
      qotd_responses: {
        Row: {
          created_at: string
          id: string
          points_awarded: number
          question_date: string
          user_id: string
          was_correct: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          points_awarded?: number
          question_date?: string
          user_id: string
          was_correct?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          points_awarded?: number
          question_date?: string
          user_id?: string
          was_correct?: boolean
        }
        Relationships: []
      }
      score_comments: {
        Row: {
          author_id: string
          comment: string
          created_at: string
          id: string
          target_user_id: string
        }
        Insert: {
          author_id: string
          comment: string
          created_at?: string
          id?: string
          target_user_id: string
        }
        Update: {
          author_id?: string
          comment?: string
          created_at?: string
          id?: string
          target_user_id?: string
        }
        Relationships: []
      }
      score_history: {
        Row: {
          brain_score: number
          created_at: string
          game_results: Json
          games_played: number
          id: string
          user_id: string
        }
        Insert: {
          brain_score: number
          created_at?: string
          game_results?: Json
          games_played?: number
          id?: string
          user_id: string
        }
        Update: {
          brain_score?: number
          created_at?: string
          game_results?: Json
          games_played?: number
          id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          brain_score: number | null
          display_name: string | null
          id: string | null
          is_plus: boolean | null
          last_active_at: string | null
          login_streak: number | null
          peak_score: number | null
          selected_outfit: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          brain_score?: number | null
          display_name?: string | null
          id?: string | null
          is_plus?: boolean | null
          last_active_at?: string | null
          login_streak?: number | null
          peak_score?: number | null
          selected_outfit?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          brain_score?: number | null
          display_name?: string | null
          id?: string | null
          is_plus?: boolean | null
          last_active_at?: string | null
          login_streak?: number | null
          peak_score?: number | null
          selected_outfit?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
