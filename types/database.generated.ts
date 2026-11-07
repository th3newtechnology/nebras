/**
 * Generated TypeScript Database Types for Nebras Quran School
 * Reflects the complete, verified 22-table PostgreSQL schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRoleType = 'ADMIN' | 'TEACHER' | 'GUARDIAN' | 'STUDENT';
export type CircleLevelType = 'مبتدئ' | 'متوسط' | 'متقدم' | 'إتمام الحفظ' | 'مراجعة';
export type TargetGenderType = 'male' | 'female' | 'mixed';
export type CircleStatusType = 'active' | 'completed' | 'suspended';
export type HallStatusType = 'active' | 'maintenance' | 'inactive';
export type TeacherStatusType = 'active' | 'on_leave' | 'inactive';
export type StudentStatusType = 'active' | 'suspended' | 'graduated' | 'withdrawn';
export type CircleEnrollmentStatusType = 'enrolled' | 'transferred' | 'completed' | 'withdrawn';
export type AttendanceStatusType = 'present' | 'absent' | 'late' | 'excused';
export type MemorizationRecordType = 'new_memorization' | 'minor_review' | 'major_review';
export type MemorizationGradeType = 'ممتاز' | 'جيد جداً' | 'جيد' | 'يحتاج مراجعة';
export type EvaluationTypeEnum = 'memorization' | 'revision' | 'tajweed' | 'behavior';
export type FeeStatusType = 'pending' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';
export type PaymentStatusType = 'pending' | 'confirmed' | 'reversed';
export type PaymentMethodType = 'cash' | 'bank_transfer' | 'check' | 'online';
export type AnnouncementTypeEnum = 'info' | 'warning' | 'success' | 'urgent';
export type MessageTypeEnum = 'text' | 'audio' | 'image' | 'document';
export type NotificationTypeEnum = 'info' | 'success' | 'warning' | 'error';

export interface Database {
  public: {
    Tables: {
      school_settings: {
        Row: {
          id: number;
          school_name: string;
          affiliation: string;
          default_currency: string;
          timezone: string;
          language: string;
          direction: string;
          vision: string | null;
          message: string | null;
          email: string | null;
          phone: string | null;
          address: string | null;
          updated_at: string;
        };
        Insert: {
          id?: number;
          school_name?: string;
          affiliation?: string;
          default_currency?: string;
          timezone?: string;
          language?: string;
          direction?: string;
          vision?: string | null;
          message?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: number;
          school_name?: string;
          affiliation?: string;
          default_currency?: string;
          timezone?: string;
          language?: string;
          direction?: string;
          vision?: string | null;
          message?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string | null;
          phone: string | null;
          avatar_url: string | null;
          is_active: boolean;
          deactivated_at: string | null;
          deactivation_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          deactivated_at?: string | null;
          deactivation_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          deactivated_at?: string | null;
          deactivation_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: UserRoleType;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: UserRoleType;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: UserRoleType;
          created_at?: string;
        };
      };
      academic_years: {
        Row: {
          id: string;
          name: string;
          start_date: string;
          end_date: string;
          is_current: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          start_date: string;
          end_date: string;
          is_current?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          start_date?: string;
          end_date?: string;
          is_current?: boolean;
          created_at?: string;
        };
      };
      halls: {
        Row: {
          id: string;
          name: string;
          location: string | null;
          capacity: number;
          status: HallStatusType;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          location?: string | null;
          capacity: number;
          status?: HallStatusType;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          location?: string | null;
          capacity?: number;
          status?: HallStatusType;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      teachers: {
        Row: {
          id: string;
          user_id: string | null;
          full_name: string;
          phone: string;
          email: string | null;
          qualification: string | null;
          specialization: string | null;
          experience_years: number;
          hire_date: string;
          status: TeacherStatusType;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          full_name: string;
          phone: string;
          email?: string | null;
          qualification?: string | null;
          specialization?: string | null;
          experience_years?: number;
          hire_date?: string;
          status?: TeacherStatusType;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          full_name?: string;
          phone?: string;
          email?: string | null;
          qualification?: string | null;
          specialization?: string | null;
          experience_years?: number;
          hire_date?: string;
          status?: TeacherStatusType;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      guardians: {
        Row: {
          id: string;
          user_id: string | null;
          full_name: string;
          relationship: string;
          phone: string;
          secondary_phone: string | null;
          email: string | null;
          national_id: string | null;
          address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          full_name: string;
          relationship: string;
          phone: string;
          secondary_phone?: string | null;
          email?: string | null;
          national_id?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          full_name?: string;
          relationship?: string;
          phone?: string;
          secondary_phone?: string | null;
          email?: string | null;
          national_id?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      students: {
        Row: {
          id: string;
          user_id: string | null;
          registration_number: string;
          full_name: string;
          birth_date: string;
          gender: 'male' | 'female';
          address: string | null;
          current_juz: number;
          target_juz: number;
          hifz_level: CircleLevelType;
          status: StudentStatusType;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          registration_number: string;
          full_name: string;
          birth_date: string;
          gender: 'male' | 'female';
          address?: string | null;
          current_juz?: number;
          target_juz?: number;
          hifz_level?: CircleLevelType;
          status?: StudentStatusType;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          registration_number?: string;
          full_name?: string;
          birth_date?: string;
          gender?: 'male' | 'female';
          address?: string | null;
          current_juz?: number;
          target_juz?: number;
          hifz_level?: CircleLevelType;
          status?: StudentStatusType;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      guardian_students: {
        Row: {
          id: string;
          guardian_id: string;
          student_id: string;
          relationship_type: string;
          is_primary_contact: boolean;
          can_pickup: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          guardian_id: string;
          student_id: string;
          relationship_type?: string;
          is_primary_contact?: boolean;
          can_pickup?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          guardian_id?: string;
          student_id?: string;
          relationship_type?: string;
          is_primary_contact?: boolean;
          can_pickup?: boolean;
          created_at?: string;
        };
      };
      circles: {
        Row: {
          id: string;
          name: string;
          level: CircleLevelType;
          academic_year_id: string;
          teacher_id: string;
          hall_id: string | null;
          target_gender: TargetGenderType;
          capacity: number;
          status: CircleStatusType;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          level: CircleLevelType;
          academic_year_id: string;
          teacher_id: string;
          hall_id?: string | null;
          target_gender?: TargetGenderType;
          capacity: number;
          status?: CircleStatusType;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          level?: CircleLevelType;
          academic_year_id?: string;
          teacher_id?: string;
          hall_id?: string | null;
          target_gender?: TargetGenderType;
          capacity?: number;
          status?: CircleStatusType;
          created_at?: string;
          updated_at?: string;
        };
      };
      circle_schedules: {
        Row: {
          id: string;
          circle_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          circle_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          circle_id?: string;
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          created_at?: string;
        };
      };
      circle_students: {
        Row: {
          id: string;
          circle_id: string;
          student_id: string;
          enrollment_date: string;
          end_date: string | null;
          status: CircleEnrollmentStatusType;
          transfer_reason: string | null;
          previous_circle_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          circle_id: string;
          student_id: string;
          enrollment_date?: string;
          end_date?: string | null;
          status?: CircleEnrollmentStatusType;
          transfer_reason?: string | null;
          previous_circle_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          circle_id?: string;
          student_id?: string;
          enrollment_date?: string;
          end_date?: string | null;
          status?: CircleEnrollmentStatusType;
          transfer_reason?: string | null;
          previous_circle_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      attendance: {
        Row: {
          id: string;
          circle_id: string;
          student_id: string;
          schedule_id: string | null;
          date: string;
          status: AttendanceStatusType;
          delay_minutes: number;
          recorded_by: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          circle_id: string;
          student_id: string;
          schedule_id?: string | null;
          date?: string;
          status: AttendanceStatusType;
          delay_minutes?: number;
          recorded_by?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          circle_id?: string;
          student_id?: string;
          schedule_id?: string | null;
          date?: string;
          status?: AttendanceStatusType;
          delay_minutes?: number;
          recorded_by?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      memorization_records: {
        Row: {
          id: string;
          student_id: string;
          teacher_id: string;
          circle_id: string | null;
          date: string;
          record_type: MemorizationRecordType;
          juz: number;
          surah_number: number;
          surah_name: string;
          ayah_from: number;
          ayah_to: number;
          grade: MemorizationGradeType;
          mistakes_count: number;
          tajweed_mistakes_count: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          teacher_id: string;
          circle_id?: string | null;
          date?: string;
          record_type: MemorizationRecordType;
          juz: number;
          surah_number: number;
          surah_name: string;
          ayah_from: number;
          ayah_to: number;
          grade: MemorizationGradeType;
          mistakes_count?: number;
          tajweed_mistakes_count?: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          teacher_id?: string;
          circle_id?: string | null;
          date?: string;
          record_type?: MemorizationRecordType;
          juz?: number;
          surah_number?: number;
          surah_name?: string;
          ayah_from?: number;
          ayah_to?: number;
          grade?: MemorizationGradeType;
          mistakes_count?: number;
          tajweed_mistakes_count?: number;
          notes?: string | null;
          created_at?: string;
        };
      };
      evaluations: {
        Row: {
          id: string;
          student_id: string;
          teacher_id: string;
          circle_id: string | null;
          date: string;
          evaluation_type: EvaluationTypeEnum;
          score: number;
          max_score: number;
          appreciation: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          teacher_id: string;
          circle_id?: string | null;
          date?: string;
          evaluation_type: EvaluationTypeEnum;
          score: number;
          max_score?: number;
          appreciation?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          teacher_id?: string;
          circle_id?: string | null;
          date?: string;
          evaluation_type?: EvaluationTypeEnum;
          score?: number;
          max_score?: number;
          appreciation?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      fees: {
        Row: {
          id: string;
          student_id: string;
          academic_year_id: string;
          fee_title: string;
          period_key: string | null;
          amount: number;
          discount: number;
          final_amount: number;
          paid_amount: number;
          remaining_amount: number;
          status: FeeStatusType;
          due_date: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          academic_year_id: string;
          fee_title: string;
          period_key?: string | null;
          amount: number;
          discount?: number;
          paid_amount?: number;
          status?: FeeStatusType;
          due_date: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          academic_year_id?: string;
          fee_title?: string;
          period_key?: string | null;
          amount?: number;
          discount?: number;
          paid_amount?: number;
          status?: FeeStatusType;
          due_date?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          fee_id: string;
          student_id: string;
          receipt_number: string;
          amount: number;
          payment_date: string;
          payment_method: PaymentMethodType;
          status: PaymentStatusType;
          transaction_reference: string | null;
          received_by: string;
          reversal_reason: string | null;
          reversed_by: string | null;
          reversed_at: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          fee_id: string;
          student_id: string;
          receipt_number: string;
          amount: number;
          payment_date?: string;
          payment_method?: PaymentMethodType;
          status?: PaymentStatusType;
          transaction_reference?: string | null;
          received_by: string;
          reversal_reason?: string | null;
          reversed_by?: string | null;
          reversed_at?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          fee_id?: string;
          student_id?: string;
          receipt_number?: string;
          amount?: number;
          payment_date?: string;
          payment_method?: PaymentMethodType;
          status?: PaymentStatusType;
          transaction_reference?: string | null;
          received_by?: string;
          reversal_reason?: string | null;
          reversed_by?: string | null;
          reversed_at?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string;
          event_date: string;
          start_time: string | null;
          end_time: string | null;
          location: string | null;
          target_audience: string;
          is_published: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          event_date: string;
          start_time?: string | null;
          end_time?: string | null;
          location?: string | null;
          target_audience?: string;
          is_published?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          event_date?: string;
          start_time?: string | null;
          end_time?: string | null;
          location?: string | null;
          target_audience?: string;
          is_published?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          content: string;
          announcement_type: AnnouncementTypeEnum;
          is_pinned: boolean;
          publish_date: string;
          expiry_date: string | null;
          target_role: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          announcement_type?: AnnouncementTypeEnum;
          is_pinned?: boolean;
          publish_date?: string;
          expiry_date?: string | null;
          target_role?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          announcement_type?: AnnouncementTypeEnum;
          is_pinned?: boolean;
          publish_date?: string;
          expiry_date?: string | null;
          target_role?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          sender_id: string;
          recipient_id: string;
          content: string;
          message_type: MessageTypeEnum;
          attachment_url: string | null;
          is_read: boolean;
          read_at: string | null;
          is_deleted_by_sender: boolean;
          is_deleted_by_recipient: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          recipient_id: string;
          content: string;
          message_type?: MessageTypeEnum;
          attachment_url?: string | null;
          is_read?: boolean;
          read_at?: string | null;
          is_deleted_by_sender?: boolean;
          is_deleted_by_recipient?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string;
          recipient_id?: string;
          content?: string;
          message_type?: MessageTypeEnum;
          attachment_url?: string | null;
          is_read?: boolean;
          read_at?: string | null;
          is_deleted_by_sender?: boolean;
          is_deleted_by_recipient?: boolean;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          notification_type: NotificationTypeEnum;
          link_url: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          notification_type?: NotificationTypeEnum;
          link_url?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          notification_type?: NotificationTypeEnum;
          link_url?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          user_email_snapshot: string;
          user_name_snapshot: string;
          user_role_snapshot: string;
          action: string;
          entity_type: string;
          entity_id: string | null;
          old_data: Json | null;
          new_data: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          user_email_snapshot: string;
          user_name_snapshot: string;
          user_role_snapshot: string;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          user_email_snapshot?: string;
          user_name_snapshot?: string;
          user_role_snapshot?: string;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      registration_applications: {
        Row: {
          id: string;
          student_name: string;
          student_age: number | null;
          guardian_name: string;
          guardian_phone: string;
          desired_track: string;
          previous_memorization: string | null;
          notes: string | null;
          status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CONTACTED';
          reviewer_id: string | null;
          reviewer_notes: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_name: string;
          student_age?: number | null;
          guardian_name: string;
          guardian_phone: string;
          desired_track: string;
          previous_memorization?: string | null;
          notes?: string | null;
          status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CONTACTED';
          reviewer_id?: string | null;
          reviewer_notes?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_name?: string;
          student_age?: number | null;
          guardian_name?: string;
          guardian_phone?: string;
          desired_track?: string;
          previous_memorization?: string | null;
          notes?: string | null;
          status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CONTACTED';
          reviewer_id?: string | null;
          reviewer_notes?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      current_user_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      has_role: {
        Args: {
          checked_role: string;
        };
        Returns: boolean;
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_teacher: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_guardian: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_student: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      get_current_teacher_id: {
        Args: Record<PropertyKey, never>;
        Returns: string | null;
      };
      get_current_guardian_id: {
        Args: Record<PropertyKey, never>;
        Returns: string | null;
      };
      get_current_student_id: {
        Args: Record<PropertyKey, never>;
        Returns: string | null;
      };
      generate_student_registration_number: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      transfer_student_circle: {
        Args: {
          p_student_id: string;
          p_new_circle_id: string;
          p_transfer_reason?: string | null;
        };
        Returns: Json;
      };
      convert_registration_application: {
        Args: {
          p_application_id: string;
          p_circle_id?: string | null;
          p_birth_date?: string | null;
          p_gender?: string;
          p_notes?: string | null;
        };
        Returns: Json;
      };
    };
    Enums: {
      user_role: UserRoleType;
      circle_level: CircleLevelType;
      hall_status: HallStatusType;
      attendance_status: AttendanceStatusType;
      memorization_record_type: MemorizationRecordType;
      memorization_grade: MemorizationGradeType;
      fee_status: FeeStatusType;
      payment_status: PaymentStatusType;
      payment_method: PaymentMethodType;
    };
  };
}
