export interface BankAccount {
    id: string;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    expireDate: string;
    cvv: string;
    isVerified: boolean;
    status: string;
  }

export interface BankAccountState {
    bankAccounts: BankAccount[];
    isLoading: boolean;
    error: string | null;
  }
  

