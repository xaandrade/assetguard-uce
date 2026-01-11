import { AppDataSource } from '../database';
import { Asset } from '../domain/asset';

export class InventoryRepository {
  private repository = AppDataSource.getRepository(Asset);

  async findAll(): Promise<Asset[]> {
    return await this.repository.find();
  }

  async save(asset: Asset): Promise<Asset> {
    return await this.repository.save(asset);
  }
}