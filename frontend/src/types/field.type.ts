import { Sport } from "./sport.type";

// Type cho Field Group/ Field

export interface Field {
    id: string;
    name: string;
    status: 'active' | 'closed';
  }

export interface FieldGroup {
    id: string;
    name: string;
    dimension: string;
    surface: string;
    basePrice: number;
    peakStartTime1: string;
    peakEndTime1: string;
    priceIncrease1: number;
    peakStartTime2?: string;
    peakEndTime2?: string;
    priceIncrease2?: number;
    peakStartTime3?: string;
    peakEndTime3?: string;
    priceIncrease3?: number;
    numberOfPeaks: number;
    fields: Field[];
    sports: Sport[]; 
    facilityId: string;
  }

// For field group form when creating or editing
export interface FieldGroupFormData {
  name: string;
  dimension: string;
  surface: string;
  basePrice: number;
  peakStartTime1?: string;
  peakEndTime1?: string;
  priceIncrease1?: number;
  peakStartTime2?: string;
  peakEndTime2?: string;
  priceIncrease2?: number;
  peakStartTime3?: string;
  peakEndTime3?: string;
  priceIncrease3?: number;
  numberOfPeaks?: number;
  sportIds: number[];
  fields: Field[] | { name: string; status?: 'active' | 'closed' }[];
  facilityId?: string;
}

// Group of fields State
export interface FieldGroupState {
    fieldGroups: FieldGroup[];
    selectedFacilityId: string | null;
    isLoading: boolean;
    error: string | null;
}
