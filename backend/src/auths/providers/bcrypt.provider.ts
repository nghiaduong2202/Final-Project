import { Injectable } from '@nestjs/common';
import { HashProvider } from './hash.provider';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptProvider implements HashProvider {
  public async hashPassword(password: string | Buffer): Promise<string> {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(password, salt);
  }
  public async comparePassword(
    password: string | Buffer,
    encryptedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, encryptedPassword);
  }
}
