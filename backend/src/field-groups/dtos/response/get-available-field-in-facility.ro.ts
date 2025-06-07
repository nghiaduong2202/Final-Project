import { UUID } from 'crypto';
import { Field } from 'src/fields/field.entity';
import { Sport } from 'src/sports/sport.entity';

export class GetAvailableFieldInFacilityRO {
  id: UUID;
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
  numberOfPeaks: number;
  bookingSlot: { date: Date; fields: Field[] }[];
  sports: Sport[];
}
