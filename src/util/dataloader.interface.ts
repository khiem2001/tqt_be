import { IDataloaders } from 'modules/dataloader/dataloader.service';

export interface IGraphQLContext {
  loaders: IDataloaders;
}
