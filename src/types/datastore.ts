import { Camera } from './camera';
import { Network } from './network';
import { SyncModule } from './syncModule';

export interface Datastore {
  accountId: string;
  clientId: string;
  region: string;
  authToken: string;
  tier: string;
  networks: Network[];
  syncModules: SyncModule[];
  cameras: Camera[];
}
