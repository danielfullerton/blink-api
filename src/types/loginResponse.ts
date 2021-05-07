export interface LoginResponse {
  "account": {
    "account_id": number;
    "user_id": number;
    "client_id": number;
    "new_account": boolean;
    "tier": string;
    "region": string;
    "account_verification_required": boolean;
    "phone_verification_required": boolean;
    "client_verification_required": boolean;
    "country_required": boolean;
    "verification_channel": string;
    "user": {
      "user_id": number;
      "country": string;
    };
  };
  "auth": {
    "token": string;
  };
  "phone": {
    "number": string;
    "last_4_digits": string;
    "country_calling_code": string;
    "valid": boolean;
  };
  "verification": {
    "email": {
      "required": boolean;
    };
    "phone": {
      "required": boolean;
      "channel": string;
    };
  };
  "lockout_time_remaining": number;
  "force_password_reset": boolean;
  "allow_pin_resend_seconds": number;
}
