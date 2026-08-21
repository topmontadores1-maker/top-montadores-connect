export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      audit_logs: {
        Row: AuditLog;
        Insert: AuditLogInsert;
        Update: Partial<AuditLogInsert>;
        Relationships: [];
      };
      cities: {
        Row: City;
        Insert: CityInsert;
        Update: Partial<CityInsert>;
        Relationships: [];
      };
      professional_services: {
        Row: ProfessionalService;
        Insert: ProfessionalServiceInsert;
        Update: Partial<ProfessionalServiceInsert>;
        Relationships: [
          {
            foreignKeyName: "professional_services_professional_id_fkey";
            columns: ["professional_id"];
            isOneToOne: false;
            referencedRelation: "professionals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "professional_services_service_slug_fkey";
            columns: ["service_slug"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["slug"];
          },
        ];
      };
      professional_portfolio_items: {
        Row: ProfessionalPortfolioItem;
        Insert: ProfessionalPortfolioItemInsert;
        Update: Partial<ProfessionalPortfolioItemInsert>;
        Relationships: [
          {
            foreignKeyName: "professional_portfolio_items_professional_id_fkey";
            columns: ["professional_id"];
            isOneToOne: false;
            referencedRelation: "professionals";
            referencedColumns: ["id"];
          },
        ];
      };
      professionals: {
        Row: Professional;
        Insert: ProfessionalInsert;
        Update: Partial<ProfessionalInsert>;
        Relationships: [];
      };
      public_links: {
        Row: PublicLink;
        Insert: PublicLinkInsert;
        Update: Partial<PublicLinkInsert>;
        Relationships: [
          {
            foreignKeyName: "public_links_professional_id_fkey";
            columns: ["professional_id"];
            isOneToOne: false;
            referencedRelation: "professionals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_links_service_slug_fkey";
            columns: ["service_slug"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["slug"];
          },
        ];
      };
      search_queries: {
        Row: SearchQuery;
        Insert: SearchQueryInsert;
        Update: Partial<SearchQueryInsert>;
        Relationships: [];
      };
      services: {
        Row: Service;
        Insert: ServiceInsert;
        Update: Partial<ServiceInsert>;
        Relationships: [];
      };
    };
    Views: {
      public_services: {
        Row: PublicService;
        Relationships: [];
      };
      public_cities: {
        Row: PublicCity;
        Relationships: [];
      };
      public_directory_links: {
        Row: PublicDirectoryLinkRow;
        Relationships: [];
      };
      service_city_search_rankings: {
        Row: ServiceCitySearchRanking;
        Relationships: [];
      };
    };
    Functions: {
      increment_clicks: {
        Args: { link_id: string };
        Returns: number;
      };
      replace_professional_portfolio: {
        Args: {
          p_professional_id: string;
          p_items: Json;
        };
        Returns: undefined;
      };
      submit_professional_registration: {
        Args: {
          p_name: string;
          p_whatsapp: string;
          p_email: string | null;
          p_doc: string | null;
          p_photo_url: string | null;
          p_postal_code: string;
          p_street: string;
          p_address_number: string;
          p_address_complement: string | null;
          p_neighborhood: string;
          p_city: string;
          p_state: string;
          p_hours: string | null;
          p_notes: string | null;
          p_neighborhoods: string[];
          p_service_slugs: string[];
          p_portfolio: Json;
        };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
import type {
  AuditLog,
  AuditLogInsert,
  City,
  CityInsert,
  Professional,
  ProfessionalInsert,
  ProfessionalPortfolioItem,
  ProfessionalPortfolioItemInsert,
  ProfessionalService,
  ProfessionalServiceInsert,
  PublicLink,
  PublicLinkInsert,
  PublicCity,
  PublicDirectoryLinkRow,
  PublicService,
  SearchQuery,
  SearchQueryInsert,
  Service,
  ServiceCitySearchRanking,
  ServiceInsert,
} from "./database.types";
