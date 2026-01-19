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
  
async update(id: number, data: Partial<Asset>): Promise<void> {
  await this.repository.update(id, data);
}

async delete(id: number): Promise<void> {
  await this.repository.delete(id);
}

async findOne(id: number): Promise<Asset | null> {
  return await this.repository.findOneBy({ id });
}
}