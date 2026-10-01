// Generated from the Supabase schema (supabase/migrations). Regenerate after
// changing the schema instead of editing by hand.

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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      albums: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      bucket_list: {
        Row: {
          category: string
          completed_on: string | null
          created_at: string
          created_by: string | null
          currency: string
          description: string
          difficulty: string
          estimated_cost: number | null
          id: string
          location: string
          priority: string
          progress: number
          status: string
          target_date: string | null
          title: string
        }
        Insert: {
          category?: string
          completed_on?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string
          difficulty?: string
          estimated_cost?: number | null
          id?: string
          location?: string
          priority?: string
          progress?: number
          status?: string
          target_date?: string | null
          title: string
        }
        Update: {
          category?: string
          completed_on?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string
          difficulty?: string
          estimated_cost?: number | null
          id?: string
          location?: string
          priority?: string
          progress?: number
          status?: string
          target_date?: string | null
          title?: string
        }
        Relationships: []
      }
      budgets: {
        Row: {
          alert_threshold: number
          category: string
          created_at: string
          id: string
          is_active: boolean
          monthly_limit: number
        }
        Insert: {
          alert_threshold?: number
          category: string
          created_at?: string
          id?: string
          is_active?: boolean
          monthly_limit: number
        }
        Update: {
          alert_threshold?: number
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          monthly_limit?: number
        }
        Relationships: []
      }
      dates: {
        Row: {
          created_at: string
          created_by: string | null
          day: string
          done: boolean
          id: string
          location: string
          start_time: string | null
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          day: string
          done?: boolean
          id?: string
          location?: string
          start_time?: string | null
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          day?: string
          done?: boolean
          id?: string
          location?: string
          start_time?: string | null
          title?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          created_by: string | null
          description: string
          id: string
          paid_by: string
          spent_on: string
        }
        Insert: {
          amount: number
          category?: string
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          paid_by: string
          spent_on?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          paid_by?: string
          spent_on?: string
        }
        Relationships: []
      }
      members: {
        Row: {
          created_at: string
          person: string
          user_id: string
        }
        Insert: {
          created_at?: string
          person: string
          user_id: string
        }
        Update: {
          created_at?: string
          person?: string
          user_id?: string
        }
        Relationships: []
      }
      photos: {
        Row: {
          album_id: string | null
          created_at: string
          created_by: string | null
          favorite: boolean
          id: string
          path: string
          tags: string[]
          thumb_path: string
          title: string
        }
        Insert: {
          album_id?: string | null
          created_at?: string
          created_by?: string | null
          favorite?: boolean
          id?: string
          path: string
          tags?: string[]
          thumb_path: string
          title?: string
        }
        Update: {
          album_id?: string | null
          created_at?: string
          created_by?: string | null
          favorite?: boolean
          id?: string
          path?: string
          tags?: string[]
          thumb_path?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "photos_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
        ]
      }
      savings_goals: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          current_amount: number
          description: string
          id: string
          target_amount: number
          target_date: string
          title: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          current_amount?: number
          description?: string
          id?: string
          target_amount: number
          target_date: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          current_amount?: number
          description?: string
          id?: string
          target_amount?: number
          target_date?: string
          title?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string
          category: string
          created_at: string
          created_by: string | null
          done: boolean
          done_on: string | null
          due_on: string | null
          id: string
          notes: string
          priority: string
          title: string
        }
        Insert: {
          assigned_to?: string
          category?: string
          created_at?: string
          created_by?: string | null
          done?: boolean
          done_on?: string | null
          due_on?: string | null
          id?: string
          notes?: string
          priority?: string
          title: string
        }
        Update: {
          assigned_to?: string
          category?: string
          created_at?: string
          created_by?: string | null
          done?: boolean
          done_on?: string | null
          due_on?: string | null
          id?: string
          notes?: string
          priority?: string
          title?: string
        }
        Relationships: []
      }
      watchlist: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          kind: string
          poster_path: string | null
          status: string
          title: string
          tmdb_id: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          kind: string
          poster_path?: string | null
          status?: string
          title: string
          tmdb_id: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          poster_path?: string | null
          status?: string
          title?: string
          tmdb_id?: number
        }
        Relationships: []
      }
    }
    Views: {
      monthly_spend: {
        Row: {
          category: string | null
          entries: number | null
          her: number | null
          him: number | null
          month: string | null
          total: number | null
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
