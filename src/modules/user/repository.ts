import { AdminEntity, UserEntity } from 'common/entity';
import { EntityRepository, MongoRepository } from 'typeorm';
import { BaseRepository } from 'util/base.repository';

@EntityRepository(UserEntity)
export class UserRepository extends BaseRepository<UserEntity> {}

@EntityRepository(AdminEntity)
export class AdminRepository extends BaseRepository<AdminEntity> {}
