import { UUID } from 'crypto';
import { Facility } from './facility.entity';
import { CreateFacilityDto } from './dtos/requests/create-facility.dto';
import { EntityManager } from 'typeorm';
import { DeleteImageDto } from './dtos/requests/delete-image.dto';
import { UpdateBaseInfo } from './dtos/requests/update-base-info.dto';
export interface IFacilityService {
  findOneByIdAndOwnerId(facilityId: UUID, ownerId: UUID): Promise<Facility>;

  create(
    createFacilityDto: CreateFacilityDto,
    images: Express.Multer.File[],
    ownerId: UUID,
    certificate: Express.Multer.File,
    licenses?: Express.Multer.File[],
    sportIds?: number[],
  ): Promise<{ message: string }>;

  getAll(): Promise<any[]>;

  getDropDownInfo(ownerId: UUID): Promise<any[]>;

  getByOwner(ownerId: UUID): Promise<any[]>;

  getByFacility(facilityId: UUID): Promise<Facility>;

  findOneById(facilityId: UUID): Promise<Facility>;

  findOneByIdWithTransaction(
    facilityId: UUID,
    manager: EntityManager,
  ): Promise<Facility>;

  updateName(
    facilityId: UUID,
    name: string,
    certificate: Express.Multer.File,
    ownerId: UUID,
  ): Promise<{ message: string }>;

  findOneByIdAndOwnerWithTransaction(
    facilityId: UUID,
    manager: EntityManager,
    ownerId: UUID,
  ): Promise<Facility>;

  updateCertificate(
    facilityId: UUID,
    certificate: Express.Multer.File,
    ownerId: UUID,
  ): Promise<{ message: string }>;

  updateLicense(
    facilityId: UUID,
    sportId: number,
    license: Express.Multer.File,
    ownerId: UUID,
  ): Promise<{ message: string }>;

  getExistingFacilityName(ownerId: UUID): Promise<string[]>;

  addImages(
    facilityId: UUID,
    images: Express.Multer.File[],
    ownerId: UUID,
  ): Promise<{ message: string }>;

  deleteImage(
    deleteImageDto: DeleteImageDto,
    ownerId: UUID,
  ): Promise<{ message: string }>;

  updateBaseInfo(
    facilityId: UUID,
    updateBaseInfo: UpdateBaseInfo,
    ownerId: UUID,
  ): Promise<{ message: string }>;

  getActiveTime(facilityId: UUID): Promise<any>;

  findOneByField(fieldId: number): Promise<Facility>;

  getTopFacilities(): Promise<any[]>;

  addRating(fieldId: number, rating: number): Promise<Facility>;

  addFavorite(facilityId: UUID, playerId: UUID): Promise<{ message: string }>;

  deleteFavorite(
    facilityId: UUID,
    playerId: UUID,
  ): Promise<{ message: string }>;

  getFavorite(playerId: UUID): Promise<any[]>;
}
