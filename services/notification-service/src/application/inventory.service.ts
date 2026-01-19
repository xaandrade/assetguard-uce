import { InventoryRepository } from '../infrastructure/inventory.repository';
import { Asset } from '../domain/asset';

export class InventoryService {
  private inventoryRepository = new InventoryRepository();

  // Cambiamos a async y Promise
  async getAll(): Promise<Asset[]> {
    return await this.inventoryRepository.findAll();
  }

  async create(data: any): Promise<Asset> {
    const asset = new Asset();
    asset.name = data.name;
    asset.description = data.description;
    asset.status = data.status;
    
    return await this.inventoryRepository.save(asset);
  }
}
