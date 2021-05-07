export interface Camera {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  serial: string;
  fw_version: string;
  type: string;
  enabled: boolean;
  thumbnail: string;
  status: string;
  battery: string;
  usage_rate: boolean;
  network_id: number;
  issues: any[];
  signals: {
    lfr: number;
    wifi: number;
    temp: number;
    battery: number;
  };
  lfr: string;
  local_storage_enabled: boolean;
  local_storage_compatible: boolean;
}
