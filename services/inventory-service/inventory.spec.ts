import { InventoryService } from './src/application/inventory.service';
import { InventoryRepository } from './src/infrastructure/inventory.repository';

// 1. Aquí estaba el error: la ruta debe ser exacta a donde está el archivo real
jest.mock('./src/infrastructure/inventory.repository'); 

describe('InventoryService QA - Unit Tests', () => {
  let service: InventoryService;
  let repositoryMock: any; // Usamos any para simplificar la demo de mañana

  beforeEach(() => {
    service = new InventoryService();
    // Accedemos a la instancia que el servicio creó internamente
    repositoryMock = (service as any).inventoryRepository;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return assets from the repository', async () => {
    // Simulamos una respuesta exitosa
    repositoryMock.findAll = jest.fn().mockResolvedValue([]);
    
    const result = await service.getAll();
    expect(result).toEqual([]);
  });
});