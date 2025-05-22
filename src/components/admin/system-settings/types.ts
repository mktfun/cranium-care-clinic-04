
// Define shared type interfaces for system settings components
export interface SystemSetting {
  id: string;
  category: string;
  key: string;
  value: any;
  description: string;
  is_sensitive: boolean;
  data_type: 'string' | 'number' | 'boolean' | 'json' | 'array';
  created_at: string;
  updated_at: string;
}
