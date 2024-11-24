export type Database = {
  public: {
    Tables: {
      discourse_users: {
        Row: {
          id: string
          discourse_id: string
          name: string | null
          username: string | null
          avatar_url: string | null
          trust_level: number
          created_at: string
        }
        Insert: {
          id?: string
          discourse_id: string
          name?: string | null
          username?: string | null
          avatar_url?: string | null
          trust_level: number
          created_at?: string
        }
        Update: {
          id?: string
          discourse_id?: string
          name?: string | null
          username?: string | null
          avatar_url?: string | null
          trust_level?: number
          created_at?: string
        }
      }
    }
  }
} 