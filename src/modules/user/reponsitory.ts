import { UserEntity } from 'common/entity';
import { EntityRepository, MongoRepository } from 'typeorm';

@EntityRepository(UserEntity)
export class MediaRepository extends MongoRepository<UserEntity> {}
