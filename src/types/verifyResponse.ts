export interface VerifyResponse {
  valid: boolean;
  require_new_pin: boolean;
  message: string;
  code: number;
}
