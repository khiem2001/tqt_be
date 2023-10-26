import { OtpEntity } from 'common/entity';
import { EntityRepository } from 'typeorm';
import { BaseRepository } from 'util/base.repository';

@EntityRepository(OtpEntity)
export class OtpRepository extends BaseRepository<OtpEntity> {}
