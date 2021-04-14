import {UserProfile} from '@loopback/authentication';
import {inject} from '@loopback/context';
import {
  repository
} from '@loopback/repository';
import {
  get, getModelSchemaRef, post,

  requestBody,
  response
} from '@loopback/rest';
import * as _ from 'lodash';
import {User} from '../models';
import {Credentials, UserRepository} from '../repositories';
import {BcryptHasher} from '../services/hash.password.bcrypt';
import {JWTService} from '../services/jwt.service';
import {MyUserService} from '../services/user.service';
import {validateCredentials} from '../services/validator';

export class UserController {
  constructor(
    @repository(UserRepository)
    public userRepository : UserRepository,
    @inject('service.hasher')
    public hasher: BcryptHasher,
    @inject('services.user.service')
    public userService: MyUserService,
    @inject('services.jwt.service')
    public jwtService: JWTService
  ) {}

  @post('/users/signup')
  @response(200, {
    description: 'User model instance',
    content: {'application/json': {schema: getModelSchemaRef(User)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            title: 'NewUser',
            exclude: ['id'],
          }),
        },
      },
    })
    user: Omit<User, 'id'>,
  ): Promise<User> {
    validateCredentials(_.pick(user, ['email', 'password']));

    // encrypt the user password
    user.password = await this.hasher.hashPassword(user.password);

    return this.userRepository.create(user);
  }

  // Login route
  @post('/users/login', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string'
                }
              }
            }
          }
        }
      }
    }
  })
  async login(@requestBody({
    description: 'The input of login function',
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
            },
            password: {
              type: 'string',
              minLength: 8,
            }
          }
        }
      }
    },
  }) credentials: Credentials): Promise<{token: string}> {
    // make sure user exists, password should be valid
    const user = await this.userService.verifyCredentials(credentials);
    // console.log(user);
    const userProfile = this.userService.convertToUserProfile(user);
    // console.log(userProfile);

    // generate a JSON Web Token
    const token = await this.jwtService.generateToken(userProfile);
    return Promise.resolve({token});
  }

  // Making protected route
  @get('/users/me')
  // @authenticate('jwt')
  async me() : Promise<UserProfile> {
    return Promise.resolve({ id: '1', name: 'Ashutosh Bansal' });
  }

  // @get('/users/count')
  // @response(200, {
  //   description: 'User model count',
  //   content: {'application/json': {schema: CountSchema}},
  // })
  // async count(
  //   @param.where(User) where?: Where<User>,
  // ): Promise<Count> {
  //   return this.userRepository.count(where);
  // }

  // @get('/users')
  // @response(200, {
  //   description: 'Array of User model instances',
  //   content: {
  //     'application/json': {
  //       schema: {
  //         type: 'array',
  //         items: getModelSchemaRef(User, {includeRelations: true}),
  //       },
  //     },
  //   },
  // })
  // async find(
  //   @param.filter(User) filter?: Filter<User>,
  // ): Promise<User[]> {
  //   return this.userRepository.find(filter);
  // }

  // @patch('/users')
  // @response(200, {
  //   description: 'User PATCH success count',
  //   content: {'application/json': {schema: CountSchema}},
  // })
  // async updateAll(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(User, {partial: true}),
  //       },
  //     },
  //   })
  //   user: User,
  //   @param.where(User) where?: Where<User>,
  // ): Promise<Count> {
  //   return this.userRepository.updateAll(user, where);
  // }

  // @get('/users/{id}')
  // @response(200, {
  //   description: 'User model instance',
  //   content: {
  //     'application/json': {
  //       schema: getModelSchemaRef(User, {includeRelations: true}),
  //     },
  //   },
  // })
  // async findById(
  //   @param.path.number('id') id: number,
  //   @param.filter(User, {exclude: 'where'}) filter?: FilterExcludingWhere<User>
  // ): Promise<User> {
  //   return this.userRepository.findById(id, filter);
  // }

  // @patch('/users/{id}')
  // @response(204, {
  //   description: 'User PATCH success',
  // })
  // async updateById(
  //   @param.path.number('id') id: number,
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(User, {partial: true}),
  //       },
  //     },
  //   })
  //   user: User,
  // ): Promise<void> {
  //   await this.userRepository.updateById(id, user);
  // }

  // @put('/users/{id}')
  // @response(204, {
  //   description: 'User PUT success',
  // })
  // async replaceById(
  //   @param.path.number('id') id: number,
  //   @requestBody() user: User,
  // ): Promise<void> {
  //   await this.userRepository.replaceById(id, user);
  // }

  // @del('/users/{id}')
  // @response(204, {
  //   description: 'User DELETE success',
  // })
  // async deleteById(@param.path.number('id') id: number): Promise<void> {
  //   await this.userRepository.deleteById(id);
  // }
}
