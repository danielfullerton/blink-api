import { Network } from './network';
import { SyncModule } from './syncModule';
import { Camera } from './camera';
import { MiniCamera } from './miniCamera';

export interface SysInfoResponse {
  "account": {
    "id": number;
    "email_verified": boolean;
    "email_verification_required": boolean;
    "amazon_account_linked": boolean;
  };
  "networks": Network[];
  "locations": Location[];
  "sync_modules": SyncModule[];
  "cameras": Camera[];
  "sirens": any[];
  "chimes": any[];
  "video_stats": {
    "storage": number;
    "auto_delete_days": number;
    "auto_delete_day_options": number[];
  };
  "doorbell_buttons": [];
  "owls": MiniCamera[];
  "app_updates": {
    "message": string;
    "code": number;
    "update_available": boolean;
    "update_required": boolean;
  };
  "device_limits": {
    "camera": number;
    "chime": number;
    "doorbell_button": number;
    "owl": number;
    "siren": number;
    "total_devices": number;
  };
  "whats_new": {
    "updated_at": number;
    "url": string;
  };
  "subscriptions": {
    "updated_at": string;
  };
  "entitlements": {
    "updated_at": string;
  };
  "tiv_lock_enable": boolean;
  "tiv_lock_status": {
    "locked": boolean;
  };
}
