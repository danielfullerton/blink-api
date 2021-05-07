export interface SyncModule {
  id: number;
  created_at: string;
  updated_at: string;
  onboarded: boolean;
  status: string;
  name: string;
  serial: string;
  fw_version: string;
  type: string;
  last_hb: string;
  wifi_strength: number;
  network_id: number;
  enable_temp_alerts: boolean;
  local_storage_enabled: boolean;
  local_storage_compatible: boolean;
  local_storage_status: string;
}
