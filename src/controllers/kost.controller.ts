import { Request, Response } from 'express';
import { KostService } from '@/services/kost.service';
import { ApiResponse } from '@/utils/api-response';

export class KostController {
  /**
   * Get all Kosts
   */
  public static getKosts = async (req: Request, res: Response): Promise<void> => {
    const kosts = await KostService.getKosts();
    ApiResponse.success(res, 'Kosts retrieved successfully', kosts, 200);
  };

  /**
   * Get a single Kost by ID
   */
  public static getKostById = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const kost = await KostService.getKostById(id);
    ApiResponse.success(res, 'Kost retrieved successfully', kost, 200);
  };

  /**
   * Create a new Kost
   */
  public static createKost = async (req: Request, res: Response): Promise<void> => {
    const ownerId = req.user!.id;
    const newKost = await KostService.createKost(ownerId, req.body);
    ApiResponse.success(res, 'Kost created successfully', newKost, 201);
  };

  /**
   * Update an existing Kost
   */
  public static updateKost = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const ownerId = req.user!.id;
    const updatedKost = await KostService.updateKost(id, ownerId, req.body);
    ApiResponse.success(res, 'Kost updated successfully', updatedKost, 200);
  };

  /**
   * Delete a Kost
   */
  public static deleteKost = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const ownerId = req.user!.id;
    const userRole = req.user!.role;
    
    await KostService.deleteKost(id, ownerId, userRole);
    ApiResponse.success(res, 'Kost deleted successfully', null, 200);
  };
}
