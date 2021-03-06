import {inject} from '@loopback/context';
import {compare, genSalt, hash} from 'bcryptjs';

interface PasswordHasher <T = string> {
  hashPassword(password: T) : Promise<T>;
  comparePassword(providedPass: T, storedPass: T) : Promise<boolean>
}

export class BcryptHasher implements PasswordHasher<string> {
  async comparePassword(providedPass: string, storedPass: string): Promise<boolean> {
    const passwordMatched = await compare(providedPass, storedPass);
    return passwordMatched;
  }
  @inject('rounds')
  public readonly rounds: number;
  // round: number = 10;

  async hashPassword(password: string) {
    const salt = await genSalt(this.rounds);
    return await hash(password, salt);
  }
}
