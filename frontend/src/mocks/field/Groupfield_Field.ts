import { FieldGroup } from '@/types/field.type';

export const mockFieldGroups: FieldGroup[] = [
  {
    id: '1',
    name: 'TECHCOMBANK - NHTMCP Kỹ Thương Việt Nam',
    dimension: '100m x 100m',
    surface: 'Cỏ nhân tạo',
    basePrice: 100000,
    peakStartTime1: '08:00',
    peakEndTime1: '10:00',
    priceIncrease1: 10000,
    peakStartTime2: '10:00',
    peakEndTime2: '12:00',
    priceIncrease2: 10000,
    peakStartTime3: '12:00',
    peakEndTime3: '14:00',
    priceIncrease3: 10000,
    numberOfPeaks: 3,
    fields: [
      {
        id: '1',
        name: 'Field 1',
        status: 'active'
      },
      {
        id: '2',
        name: 'Field 2',
        status: 'active'
      },
      {
        id: '3',
        name: 'Field 3',
        status: 'closed'
      },
      {
        id: '4',
        name: 'Field 4',
        status: 'closed'
      }
    ],
    sports: [
      {
        id: 1,
        name: 'Bóng đá',        
      },
      {
        id: 2,
        name: 'Bóng rổ',
      },
      {
        id: 3,
        name: 'Bóng chuyền',
      }
    ],
    facilityId: '1'
  },
  {
    id: '2',
    name: 'VIETCOMBANK - NHTMCP Ngoại Thương Việt Nam',
    dimension: '100m x 100m',
    surface: 'Cỏ nhân tạo',
    basePrice: 100000,
    peakStartTime1: '08:00',
    peakEndTime1: '10:00',
    priceIncrease1: 10000,
    peakStartTime2: '10:00',
    peakEndTime2: '12:00',
    priceIncrease2: 10000,
    peakStartTime3: '12:00',
    peakEndTime3: '14:00',
    priceIncrease3: 10000,
    numberOfPeaks: 3,
    fields: [
      {
        id: '1',
        name: 'Field 1',
        status: 'active'
      },
      {
        id: '2',
        name: 'Field 2',
        status: 'active'
      },
      {
        id: '3',
        name: 'Field 3',
        status: 'closed'
      },
      {
        id: '4',
        name: 'Field 4',
        status: 'closed'
      }
    ],
    sports: [
      {
        id: 1,
        name: 'Bóng đá',
      }
    ],
    facilityId: '1'
  },
  {
    id: '3',
    name: 'BANK OF AMERICA - NHTMCP Bảo Việt',
    dimension: '100m x 100m',
    surface: 'Cỏ nhân tạo',
    basePrice: 100000,
    peakStartTime1: '08:00',
    peakEndTime1: '10:00',
    priceIncrease1: 10000,
    peakStartTime2: '',
    peakEndTime2: '',
    priceIncrease2: 0,  
    peakStartTime3: '',
    peakEndTime3: '',
    priceIncrease3: 0,
    numberOfPeaks: 2,
    fields: [
      {
        id: '1',
        name: 'Field 1',
        status: 'active'
      },
      {
        id: '2',
        name: 'Field 2',
        status: 'active'
      }
    ],
    sports: [
      {
        id: 1,
        name: 'Bóng đá',
      },
      {
        id: 2,
        name: 'Bóng rổ',
      }
    ],
    facilityId: '2'
  }
];
