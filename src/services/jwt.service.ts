import {UserProfile} from '@loopback/authentication';
import {HttpErrors} from '@loopback/rest';
import {promisify} from 'util'; // converts callbacks to promises
const jwt = require('jsonwebtoken');
const signAsync = promisify(jwt.sign);
const verifyAsync = promisify(jwt.verify);

export class JWTService {
  async generateToken(userProfile: UserProfile) : Promise<string> {
    if(!userProfile) {
      throw new HttpErrors.Unauthorized('Error while generating token : Userprofile is null');
    }

    let token = '';
    try {
      token = await signAsync(userProfile, 'jwt-secret-key', {
        expiresIn: '7h'
      });
    } catch(err) {
      throw new HttpErrors.Unauthorized(`error generating token ${err}`);
    }

    return token;

  }

  async verifyToken(token: string): Promise<UserProfile> {
    if (!token) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token : 'token' is null`,
      );
    }
    let userProfile: UserProfile;
    try {
      // decode user profile from token
      const decryptedToken = await verifyAsync(token, 'jwt-secret-key');
      // don't copy over  token field 'iat' and 'exp', nor 'email' to user profile
      userProfile = Object.assign(
        {id: '', name: ''},
        {id: decryptedToken.id, name: decryptedToken.name},
      );
    } catch (error) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token : ${error.message}`,
      );
    }
    return userProfile;
  }
}
