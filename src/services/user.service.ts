import {UserProfile, UserService} from '@loopback/authentication';
import {inject} from '@loopback/context';
import {
  repository
} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {User} from '../models';
import {Credentials, UserRepository} from '../repositories';
import {BcryptHasher} from './hash.password.bcrypt';

export class MyUserService implements UserService<User, Credentials> {
  constructor(
    @repository(UserRepository)
    public userRepository : UserRepository,
    @inject('service.hasher')
    public hasher: BcryptHasher
  ) {}

  async verifyCredentials(credentials: Credentials): Promise<User> {
    const foundUser = await this.userRepository.findOne({
      where: {
        email: credentials.email
      }
    });
    if(!foundUser) {
      throw new HttpErrors.NotFound(`User not found with this ${credentials.email}`);
    }

    const passwordMatched = await this.hasher.comparePassword(credentials.password, foundUser.password);

    if(!passwordMatched) {
      throw new HttpErrors.Unauthorized('password is not valid');
    }

    return foundUser;

  }

  convertToUserProfile(user: User): UserProfile {
    let userName = '';
    if(user.firstName) {
      userName = user.firstName;
    }
    if(user.lastName) {
      userName = user.firstName ? `${user.firstName} ${user.lastName}` : user.lastName
    }
    return {id: `${user.id}`, name: userName};
  }
}

