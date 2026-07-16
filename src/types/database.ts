export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      families: {
        Row: {
          id: string
          family_name: string
          address: string | null
          village: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          family_name: string
          address?: string | null
          village?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          family_name?: string
          address?: string | null
          village?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      members: {
        Row: {
          id: string
          family_id: string | null
          member_number: string
          full_name: string
          father_name: string | null
          phone: string | null
          cnic: string | null
          occupation: string | null
          address: string | null
          status: 'active' | 'inactive' | 'deceased'
          joined_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          family_id?: string | null
          member_number: string
          full_name: string
          father_name?: string | null
          phone?: string | null
          cnic?: string | null
          occupation?: string | null
          address?: string | null
          status?: 'active' | 'inactive' | 'deceased'
          joined_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          family_id?: string | null
          member_number?: string
          full_name?: string
          father_name?: string | null
          phone?: string | null
          cnic?: string | null
          occupation?: string | null
          address?: string | null
          status?: 'active' | 'inactive' | 'deceased'
          joined_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      funeral_cases: {
        Row: {
          id: string
          case_number: string
          deceased_name: string
          member_id: string | null
          family_id: string | null
          date_of_death: string
          date_of_funeral: string | null
          location: string | null
          contact_person: string | null
          contact_phone: string | null
          notes: string | null
          status: 'open' | 'closed'
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          case_number: string
          deceased_name: string
          member_id?: string | null
          family_id?: string | null
          date_of_death: string
          date_of_funeral?: string | null
          location?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          notes?: string | null
          status?: 'open' | 'closed'
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          case_number?: string
          deceased_name?: string
          member_id?: string | null
          family_id?: string | null
          date_of_death?: string
          date_of_funeral?: string | null
          location?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          notes?: string | null
          status?: 'open' | 'closed'
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          funeral_case_id: string
          category: 'transportation' | 'food' | 'shroud' | 'miscellaneous'
          description: string | null
          amount: number
          receipt_url: string | null
          expense_date: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          funeral_case_id: string
          category?: 'transportation' | 'food' | 'shroud' | 'miscellaneous'
          description?: string | null
          amount: number
          receipt_url?: string | null
          expense_date?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          funeral_case_id?: string
          category?: 'transportation' | 'food' | 'shroud' | 'miscellaneous'
          description?: string | null
          amount?: number
          receipt_url?: string | null
          expense_date?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      collections: {
        Row: {
          id: string
          funeral_case_id: string
          member_id: string
          amount_due: number
          amount_paid: number
          status: 'pending' | 'partial' | 'paid'
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          funeral_case_id: string
          member_id: string
          amount_due: number
          amount_paid?: number
          status?: 'pending' | 'partial' | 'paid'
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          funeral_case_id?: string
          member_id?: string
          amount_due?: number
          amount_paid?: number
          status?: 'pending' | 'partial' | 'paid'
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          collection_id: string
          amount: number
          payment_date: string
          payment_method: 'cash' | 'easypaisa' | 'jazzcash' | 'bank_transfer'
          reference_number: string | null
          notes: string | null
          received_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          collection_id: string
          amount: number
          payment_date?: string
          payment_method?: 'cash' | 'easypaisa' | 'jazzcash' | 'bank_transfer'
          reference_number?: string | null
          notes?: string | null
          received_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          collection_id?: string
          amount?: number
          payment_date?: string
          payment_method?: 'cash' | 'easypaisa' | 'jazzcash' | 'bank_transfer'
          reference_number?: string | null
          notes?: string | null
          received_by?: string | null
          created_at?: string
        }
      }
      announcements: {
        Row: {
          id: string
          title: string
          content: string
          type: 'death_notice' | 'meeting' | 'general'
          is_public: boolean
          scheduled_date: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          type?: 'death_notice' | 'meeting' | 'general'
          is_public?: boolean
          scheduled_date?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          type?: 'death_notice' | 'meeting' | 'general'
          is_public?: boolean
          scheduled_date?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          funeral_case_id: string | null
          title: string
          document_type: 'death_certificate' | 'receipt' | 'meeting_minutes' | 'other'
          file_url: string
          uploaded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          funeral_case_id?: string | null
          title: string
          document_type?: 'death_certificate' | 'receipt' | 'meeting_minutes' | 'other'
          file_url: string
          uploaded_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          funeral_case_id?: string | null
          title?: string
          document_type?: 'death_certificate' | 'receipt' | 'meeting_minutes' | 'other'
          file_url?: string
          uploaded_by?: string | null
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      member_status: 'active' | 'inactive' | 'deceased'
      funeral_case_status: 'open' | 'closed'
      expense_category: 'transportation' | 'food' | 'shroud' | 'miscellaneous'
      collection_status: 'pending' | 'partial' | 'paid'
      payment_method: 'cash' | 'easypaisa' | 'jazzcash' | 'bank_transfer'
      announcement_type: 'death_notice' | 'meeting' | 'general'
      document_type: 'death_certificate' | 'receipt' | 'meeting_minutes' | 'other'
    }
  }
}

export type Family = Database['public']['Tables']['families']['Row']
export type Member = Database['public']['Tables']['members']['Row']
export type FuneralCase = Database['public']['Tables']['funeral_cases']['Row']
export type Expense = Database['public']['Tables']['expenses']['Row']
export type Collection = Database['public']['Tables']['collections']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']
export type Announcement = Database['public']['Tables']['announcements']['Row']
export type Document = Database['public']['Tables']['documents']['Row']
