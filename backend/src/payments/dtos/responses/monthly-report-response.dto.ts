export class MonthlyReportResponseDto {
  revenue: number;
  prevMonthRevenue: number;
  bookingCount: number;
  prevMonthBookingCount: number;
  playerCount: number;
  playerRateCompareToPrevMonth: number;
  replayRate: number;

  revenueDatas: {
    date: Date;
    revenue: number;
  }[];

  revenueDistribution: { type: string; value: number }[];
}
