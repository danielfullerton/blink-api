export interface Network {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  time_zone: string;
  dst: boolean;
  armed: boolean;
  lv_save: boolean;
  location_id: number;
}
