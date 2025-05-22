
// Define shared type interfaces for system settings components
export interface SystemSetting {
  id: string;
  category: string;
  key: string;
  value: any;
  description: string;
  is_sensitive: boolean;
  data_type: string; // Changed from a union type to string to match what comes from the database
  created_at: string;
  updated_at: string;
  created_by?: string; // Added as optional
  updated_by?: string; // Added as optional
}
