import { Request, Response } from 'express';
import { FacilityService } from '@/services/facility.service';
import { ApiResponse } from '@/utils/api-response';
import { PrismaQueryBuilder } from 'prisma-query-parser';

export class FacilityController {
  /**
   * Get all Facilities with filtering, pagination, and sorting
   */
  public static getFacilities = async (req: Request, res: Response): Promise<void> => {
    const builder = new PrismaQueryBuilder(req.query);
    const queryOptions = builder.build();
    
    const { data, total } = await FacilityService.getFacilities(queryOptions);
    const formattedData = builder.formatData(data);
    
    // We send a custom response here to include pagination metadata
    ApiResponse.success(res, 'Berhasil mengambil daftar fasilitas', formattedData, 200, builder.getMeta(total, data.length));
  };

  /**
   * Get a single Facility by ID
   */
  public static getFacilityById = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const facility = await FacilityService.getFacilityById(id);
    ApiResponse.success(res, 'Berhasil mengambil data fasilitas', facility, 200);
  };

  /**
   * Create a new Facility
   */
  public static createFacility = async (req: Request, res: Response): Promise<void> => {
    const newFacility = await FacilityService.createFacility(req.body);
    ApiResponse.success(res, 'Berhasil membuat fasilitas baru', newFacility, 201);
  };

  /**
   * Update an existing Facility
   */
  public static updateFacility = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const updatedFacility = await FacilityService.updateFacility(id, req.body);
    ApiResponse.success(res, 'Berhasil memperbarui data fasilitas', updatedFacility, 200);
  };

  /**
   * Delete a Facility
   */
  public static deleteFacility = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    await FacilityService.deleteFacility(id);
    ApiResponse.success(res, 'Berhasil menghapus fasilitas', null, 200);
  };
}
