import { Router, Request, Response } from 'express';
import { InventoryService } from '../application/inventory.service';
import { verifyToken } from '../auth.middleware'; // Importamos el guardián de seguridad

const router = Router();
const inventoryService = new InventoryService();

/**
 * @route GET /api/inventory
 * @desc Obtener todos los activos (Requiere Token)
 */
router.get('/', verifyToken, async (req: Request, res: Response) => {
  try {
    const assets = await inventoryService.getAll();
    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los activos" });
  }
});

/**
 * @route POST /api/inventory
 * @desc Crear un nuevo activo (Requiere Token)
 */
router.post('/', verifyToken, async (req: Request, res: Response) => {
  try {
    // Validamos que el body no venga vacío (QA check)
    if (!req.body.name || !req.body.status) {
      return res.status(400).json({ error: "Faltan campos obligatorios: name o status" });
    }

    const asset = await inventoryService.create(req.body);
    res.status(201).json(asset);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el activo" });
  }
});

/**
 * @route GET /api/inventory/:id
 * @desc Obtener un activo por ID (Requiere Token)
 */
router.get('/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    // Nota: Deberías implementar findById en tu Service si no lo tienes
    // const asset = await inventoryService.getById(id); 
    // res.json(asset);
    res.status(501).json({ message: "Búsqueda por ID en desarrollo para Fase 3" });
  } catch (error) {
    res.status(500).json({ error: "Error al buscar el activo" });
  }
});

export default router;