export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string
          title: string
          description: string
          date: string
          location: string
          image_url: string | null
          created_at: string | null
          updated_at: string | null
          // Add registration_link to match your code
          registration_link: string | null
          event_type: string | null
          details_link: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          date: string
          location: string
          image_url?: string | null
          created_at?: string | null
          updated_at?: string | null
          registration_link?: string | null
          event_type?: string | null
          details_link?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          date?: string
          location?: string
          image_url?: string | null
          created_at?: string | null
          updated_at?: string | null
          registration_link?: string | null
          event_type?: string | null
          details_link?: string | null
        }
      }
      executives: {
        Row: {
          id: string
          name: string
          position: string
          bio: string
          image_url: string | null
          email: string
          facebook_url: string | null
          instagram_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          position: string
          bio: string
          image_url?: string | null
          email: string
          facebook_url?: string | null
          instagram_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          position?: string
          bio?: string
          image_url?: string | null
          email?: string
          facebook_url?: string | null
          instagram_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      moderators: {
        Row: {
          id: string
          name: string
          position: string
          bio: string
          image_url: string | null
          email: string
          facebook_url: string | null
          instagram_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          position: string
          bio: string
          image_url?: string | null
          email: string
          facebook_url?: string | null
          instagram_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          position?: string
          bio?: string
          image_url?: string | null
          email?: string
          facebook_url?: string | null
          instagram_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      developers: {
        Row: {
          id: string
          name: string
          role: string
          skills: string[] | null
          image_url: string | null
          github_url: string | null
          portfolio: string | null
          projects: number | null
          contributions: number | null
          bio: string | null
          linkedin_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          role: string
          skills?: string[] | null
          image_url?: string | null
          github_url?: string | null
          portfolio?: string | null
          projects?: number | null
          contributions?: number | null
          bio?: string | null
          linkedin_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          role?: string
          skills?: string[] | null
          image_url?: string | null
          github_url?: string | null
          portfolio?: string | null
          projects?: number | null
          contributions?: number | null
          bio?: string | null
          linkedin_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          description: string
          image: string | null
          technologies: string[] | null
          github: string | null
          demo: string | null
          featured: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          image?: string | null
          technologies?: string[] | null
          github?: string | null
          demo?: string | null
          featured?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          image?: string | null
          technologies?: string[] | null
          github?: string | null
          demo?: string | null
          featured?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
  }
}

