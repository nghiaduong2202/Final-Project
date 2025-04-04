import { BankAccount } from '@/types/bankaccount.type';

export const mockBankAccounts: BankAccount[] = [
  {
    id: '1',
    bankName: 'TECHCOMBANK - NHTMCP Kỹ Thương Việt Nam',
    accountNumber: '**** **** **** 0019',
    accountHolder: 'NGUYEN TUAN ANH',
    isVerified: true,
    status: 'MẶC ĐỊNH',
    expireDate: '2025-03-29',
    cvv: '***'
  },
  {
    id: '2',
    bankName: 'VIETCOMBANK - NHTMCP Ngoại Thương Việt Nam',
    accountNumber: '**** **** **** 1234',
    accountHolder: 'NGUYEN TUAN ANH',
    isVerified: true,
    status: 'PHỤ',
    expireDate: '2024-12-31',
    cvv: '***'
  },
  {
    id: '3',
    bankName: 'ACB - NHTMCP Á Châu',
    accountNumber: '**** **** **** 5678',
    accountHolder: 'NGUYEN TUAN ANH',
    isVerified: false,
    status: 'PHỤ',
    expireDate: '2026-06-30',
    cvv: '***'
  }
];
