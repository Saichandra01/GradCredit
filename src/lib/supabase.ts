import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      applications: {
        Row: {
          id: string;
          user_id: string;
          status: string;
          preferred_country: string | null;
          preferred_course: string | null;
          preferred_university: string | null;
          intake_year: number | null;
          intake_month: string | null;
          current_step: number;
          personal_info: Record<string, unknown> | null;
          academic_info: Record<string, unknown> | null;
          test_scores: Record<string, unknown> | null;
          loan_required: boolean;
          loan_amount: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['applications']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['applications']['Insert']>;
      };
      documents: {
        Row: {
          id: string;
          user_id: string;
          application_id: string | null;
          document_type: string;
          file_name: string;
          file_url: string;
          status: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['documents']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['documents']['Insert']>;
      };
      consultations: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          preferred_country: string | null;
          course_interest: string | null;
          preferred_date: string | null;
          preferred_time: string | null;
          message: string | null;
          status: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['consultations']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['consultations']['Insert']>;
      };
    };
  };
};
