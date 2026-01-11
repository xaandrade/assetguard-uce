import { Router, Request, Response } from 'express';
import { InventoryService } from '../application/inventory.service';

const router = Router();
const inventoryService = new InventoryService();

// Agregamos async para poder esperar a la base de datos
router.get('/', async (req: Request, res: Response) => {
  try {
    const assets = await inventoryService.getAll();
    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los activos" });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const asset = await inventoryService.create(req.body);
    res.status(201).json(asset);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el activo" });
  }
});

export default router;
