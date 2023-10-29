import { MediaEntity } from 'common/entity';
import { EntityRepository, MongoRepository } from 'typeorm';
@EntityRepository(MediaEntity)
export class MediaRepository extends MongoRepository<MediaEntity> {}
