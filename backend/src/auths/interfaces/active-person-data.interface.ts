import { UUID } from 'crypto';

export interface ActivePersonData {
  /**
   * id
   */
  sub: UUID;

  /**
   * role
   */
  role: string;
}
