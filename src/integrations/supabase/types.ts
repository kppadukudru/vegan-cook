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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      recipe_submissions: {
        Row: {
          allergen_notes: string | null
          allergens: string[]
          author_name: string
          blurb: string
          calories: number | null
          cookware: string
          created_at: string
          cuisine: Database["public"]["Enums"]["recipe_cuisine"] | null
          email: string
          id: string
          ingredients: string
          meal_types: Database["public"]["Enums"]["meal_type"][]
          method: string
          published_recipe_id: string | null
          review_notes: string | null
          reviewed_at: string | null
          servings: number
          skill: Database["public"]["Enums"]["recipe_skill"]
          spice_level: Database["public"]["Enums"]["spice_level"] | null
          status: Database["public"]["Enums"]["submission_status"]
          time_minutes: number
          title: string
          updated_at: string
        }
        Insert: {
          allergen_notes?: string | null
          allergens?: string[]
          author_name: string
          blurb: string
          calories?: number | null
          cookware: string
          created_at?: string
          cuisine?: Database["public"]["Enums"]["recipe_cuisine"] | null
          email: string
          id?: string
          ingredients: string
          meal_types?: Database["public"]["Enums"]["meal_type"][]
          method: string
          published_recipe_id?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          servings: number
          skill: Database["public"]["Enums"]["recipe_skill"]
          spice_level?: Database["public"]["Enums"]["spice_level"] | null
          status?: Database["public"]["Enums"]["submission_status"]
          time_minutes: number
          title: string
          updated_at?: string
        }
        Update: {
          allergen_notes?: string | null
          allergens?: string[]
          author_name?: string
          blurb?: string
          calories?: number | null
          cookware?: string
          created_at?: string
          cuisine?: Database["public"]["Enums"]["recipe_cuisine"] | null
          email?: string
          id?: string
          ingredients?: string
          meal_types?: Database["public"]["Enums"]["meal_type"][]
          method?: string
          published_recipe_id?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          servings?: number
          skill?: Database["public"]["Enums"]["recipe_skill"]
          spice_level?: Database["public"]["Enums"]["spice_level"] | null
          status?: Database["public"]["Enums"]["submission_status"]
          time_minutes?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_submissions_published_recipe_id_fkey"
            columns: ["published_recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          allergen_notes: string | null
          author: string
          blurb: string
          calories: number | null
          contains: string[]
          cookware: string[]
          created_at: string
          cuisine: Database["public"]["Enums"]["recipe_cuisine"] | null
          id: string
          ingredients: Json
          meal_types: Database["public"]["Enums"]["meal_type"][]
          method: Json
          published_at: string
          servings: number
          skill: Database["public"]["Enums"]["recipe_skill"]
          source_submission_id: string | null
          spice_level: Database["public"]["Enums"]["spice_level"] | null
          status: string
          time_minutes: number
          title: string
          updated_at: string
        }
        Insert: {
          allergen_notes?: string | null
          author?: string
          blurb: string
          calories?: number | null
          contains?: string[]
          cookware?: string[]
          created_at?: string
          cuisine?: Database["public"]["Enums"]["recipe_cuisine"] | null
          id: string
          ingredients?: Json
          meal_types?: Database["public"]["Enums"]["meal_type"][]
          method?: Json
          published_at?: string
          servings: number
          skill: Database["public"]["Enums"]["recipe_skill"]
          source_submission_id?: string | null
          spice_level?: Database["public"]["Enums"]["spice_level"] | null
          status?: string
          time_minutes: number
          title: string
          updated_at?: string
        }
        Update: {
          allergen_notes?: string | null
          author?: string
          blurb?: string
          calories?: number | null
          contains?: string[]
          cookware?: string[]
          created_at?: string
          cuisine?: Database["public"]["Enums"]["recipe_cuisine"] | null
          id?: string
          ingredients?: Json
          meal_types?: Database["public"]["Enums"]["meal_type"][]
          method?: Json
          published_at?: string
          servings?: number
          skill?: Database["public"]["Enums"]["recipe_skill"]
          source_submission_id?: string | null
          spice_level?: Database["public"]["Enums"]["spice_level"] | null
          status?: string
          time_minutes?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipes_source_submission_id_fkey"
            columns: ["source_submission_id"]
            isOneToOne: false
            referencedRelation: "recipe_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
      meal_type: "Breakfast" | "Lunch" | "Dinner" | "Snack" | "Dessert"
      recipe_cuisine:
        | "Indian"
        | "Middle Eastern"
        | "Japanese"
        | "Italian"
        | "Continental"
        | "Mexican"
        | "Thai"
        | "Chinese"
        | "Mediterranean"
        | "American"
        | "Other"
      recipe_skill: "Beginner" | "Intermediate" | "Expert"
      spice_level: "None" | "Mild" | "Medium" | "Spicy" | "Fiery"
      submission_status: "pending" | "approved" | "rejected"
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
    Enums: {
      app_role: ["admin", "user"],
      meal_type: ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"],
      recipe_cuisine: [
        "Indian",
        "Middle Eastern",
        "Japanese",
        "Italian",
        "Continental",
        "Mexican",
        "Thai",
        "Chinese",
        "Mediterranean",
        "American",
        "Other",
      ],
      recipe_skill: ["Beginner", "Intermediate", "Expert"],
      spice_level: ["None", "Mild", "Medium", "Spicy", "Fiery"],
      submission_status: ["pending", "approved", "rejected"],
    },
  },
} as const
