import React from 'react';
import { Card, Typography, Divider, Tag } from 'antd';
import { FieldTimeOutlined, DollarOutlined, TagOutlined, GiftOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { AvailableFieldGroup } from '@/types/field.type';
import { Service } from '@/types/service.type';

const { Title, Text } = Typography;

interface BookingPaymentSummaryProps {
  step?: number; // Added step property to control display
  fieldGroup?: AvailableFieldGroup;
  services?: { serviceId: number; quantity: number }[];
  allServices?: Service[];
  startTime?: string;
  endTime?: string;
  selectedDates?: Dayjs[];
  voucherDiscount?: number;
  refundedPoint?: number;
  formatCurrency: (amount: number) => string;
  calculateTotalPrice?: () => number;
}

const BookingPaymentSummary: React.FC<BookingPaymentSummaryProps> = ({
  step = 4, // Default to final step if not provided
  fieldGroup,
  services,
  allServices,
  startTime,
  endTime,
  selectedDates = [],
  voucherDiscount = 0,
  refundedPoint = 0,
  formatCurrency,
  calculateTotalPrice
}) => {
  // Debug selectedDates
  console.log('BookingPaymentSummary - selectedDates:', selectedDates);

  // Format date for better display
  const formatDate = (date?: Dayjs): string => {
    if (!date) return '';
    return date.format('DD/MM/YYYY (ddd)');
  };

  // Format time for display
  const formatTimeForDisplay = (timeStr?: string): string => {
    if (!timeStr) return '';
    return timeStr.substring(0, 5);
  };

  // Render booking time and date information
  const renderBookingTimeInfo = (): JSX.Element | null => {
    if (!startTime || !endTime || selectedDates.length === 0) {
      return null;
    }

    return (
      <div className="bg-blue-50 p-3 rounded-md mb-4">
        <div className="flex justify-between items-center mb-2">
          <Text strong>Thông tin đặt sân</Text>
        </div>
        
        <div className="text-gray-600 text-sm space-y-1">
          <div className="flex items-center">
            <CalendarOutlined className="mr-2" />
            <Text>
              {selectedDates.length === 1 
                ? `Ngày: ${formatDate(selectedDates[0])}` 
                : `Đặt sân định kỳ: ${selectedDates.length} ngày`}
            </Text>
          </div>
          
          <div className="flex items-center">
            <FieldTimeOutlined className="mr-2" />
            <Text>Thời gian: {formatTimeForDisplay(startTime)} - {formatTimeForDisplay(endTime)}</Text>
          </div>
          
          {selectedDates.length > 1 && step === 4 && (
            <div className="mt-2">
              <Text strong className="text-xs mb-1 block">Các ngày đã chọn:</Text>
              <div className="grid grid-cols-2 gap-1 mt-1 max-h-28 overflow-y-auto">
                {selectedDates.map((date, index) => (
                  <Text key={index} className="text-xs flex items-center">
                    <CalendarOutlined className="mr-1 text-blue-500" style={{ fontSize: '10px' }} />
                    {formatDate(date)}
                  </Text>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Calculate duration in hours
  const getDurationHours = (): number => {
    if (!startTime || !endTime) return 0;
    
    const start = dayjs(`2000-01-01 ${startTime}`);
    const end = dayjs(`2000-01-01 ${endTime}`);
    
    return end.diff(start, 'hour', true); // Get precise hours with decimals
  };

  // Check if a time is within a peak hour range
  const isInPeakHour = (timeStr: string, peakStart: string | null, peakEnd: string | null): boolean => {
    if (!peakStart || !peakEnd) return false;
    
    const time = dayjs(`2000-01-01 ${timeStr}`);
    const start = dayjs(`2000-01-01 ${peakStart}`);
    const end = dayjs(`2000-01-01 ${peakEnd}`);
    
    return time.isAfter(start) && time.isBefore(end) || time.isSame(start) || time.isSame(end);
  };

  // Calculate field price including peak hour adjustments
  const calculateFieldPrice = (): { 
    basePrice: number; 
    peakHourPrice: number; 
    totalFieldPrice: number; 
    dailyFieldPrice: number;
    peakHourDetails: Array<{ 
      peakStart: string; 
      peakEnd: string; 
      priceIncrease: number; 
      hours: number 
    }>
  } => {
    if (!fieldGroup || !startTime || !endTime) {
      return { 
        basePrice: 0, 
        peakHourPrice: 0, 
        totalFieldPrice: 0, 
        dailyFieldPrice: 0,
        peakHourDetails: [] 
      };
    }
    
    const durationHours = getDurationHours();
    const datesCount = selectedDates.length;
    
    // Calculate the base price for a single day
    const dailyBasePrice = fieldGroup.basePrice * durationHours;
    
    // Calculate the total base price for all days
    const basePrice = dailyBasePrice * datesCount;
    
    // Check each peak hour range
    const peakHourDetails = [];
    let dailyPeakHourPrice = 0;
    
    // Create time intervals of 30 minutes within booking timeRange
    const start = dayjs(`2000-01-01 ${startTime}`);
    const end = dayjs(`2000-01-01 ${endTime}`);
    const intervals = [];
    
    let current = start;
    while (current.isBefore(end)) {
      intervals.push(current.format('HH:mm:ss'));
      current = current.add(30, 'minute');
    }
    
    // Calculate peak hours for each peak time setting
    if (fieldGroup.peakStartTime1 && fieldGroup.peakEndTime1 && fieldGroup.priceIncrease1) {
      const peakStart = fieldGroup.peakStartTime1;
      const peakEnd = fieldGroup.peakEndTime1;
      const priceIncrease = fieldGroup.priceIncrease1;
      
      // Count intervals within this peak time
      const peakIntervals = intervals.filter(time => 
        isInPeakHour(time, peakStart, peakEnd)
      );
      
      const peakHours = peakIntervals.length / 2; // Convert 30-min intervals to hours
      const dailyPeakPrice = peakHours * priceIncrease;
      
      if (peakHours > 0) {
        peakHourDetails.push({
          peakStart,
          peakEnd,
          priceIncrease,
          hours: peakHours
        });
        
        dailyPeakHourPrice += dailyPeakPrice;
      }
    }
    
    if (fieldGroup.peakStartTime2 && fieldGroup.peakEndTime2 && fieldGroup.priceIncrease2) {
      const peakStart = fieldGroup.peakStartTime2;
      const peakEnd = fieldGroup.peakEndTime2;
      const priceIncrease = fieldGroup.priceIncrease2;
      
      const peakIntervals = intervals.filter(time => 
        isInPeakHour(time, peakStart, peakEnd)
      );
      
      const peakHours = peakIntervals.length / 2;
      const dailyPeakPrice = peakHours * priceIncrease;
      
      if (peakHours > 0) {
        peakHourDetails.push({
          peakStart,
          peakEnd,
          priceIncrease,
          hours: peakHours
        });
        
        dailyPeakHourPrice += dailyPeakPrice;
      }
    }
    
    if (fieldGroup.peakStartTime3 && fieldGroup.peakEndTime3 && fieldGroup.priceIncrease3) {
      const peakStart = fieldGroup.peakStartTime3;
      const peakEnd = fieldGroup.peakEndTime3;
      const priceIncrease = fieldGroup.priceIncrease3;
      
      const peakIntervals = intervals.filter(time => 
        isInPeakHour(time, peakStart, peakEnd)
      );
      
      const peakHours = peakIntervals.length / 2;
      const dailyPeakPrice = peakHours * priceIncrease;
      
      if (peakHours > 0) {
        peakHourDetails.push({
          peakStart,
          peakEnd,
          priceIncrease,
          hours: peakHours
        });
        
        dailyPeakHourPrice += dailyPeakPrice;
      }
    }
    
    // Total peak hour price for all days
    const totalPeakHourPrice = dailyPeakHourPrice * datesCount;
    
    // Daily field price (base + peak for one day)
    const dailyFieldPrice = dailyBasePrice + dailyPeakHourPrice;
    
    // Total field price for all days
    const totalFieldPrice = basePrice + totalPeakHourPrice;
    
    return {
      basePrice,
      peakHourPrice: totalPeakHourPrice,
      totalFieldPrice,
      dailyFieldPrice,
      peakHourDetails
    };
  };

  // Calculate service prices
  const calculateServicePrice = (): { 
    totalServicePrice: number; 
    dailyServicePrice: number;
    serviceDetails: Array<{ 
      name: string; 
      price: number; 
      quantity: number; 
      total: number 
    }> 
  } => {
    if (!services || !allServices) {
      return { totalServicePrice: 0, dailyServicePrice: 0, serviceDetails: [] };
    }
    
    const serviceDetails = services.map(service => {
      const serviceInfo = allServices.find(s => s.id === service.serviceId);
      if (!serviceInfo) return null;
      
      return {
        name: serviceInfo.name,
        price: serviceInfo.price,
        quantity: service.quantity,
        total: serviceInfo.price * service.quantity
      };
    }).filter(Boolean) as Array<{ name: string; price: number; quantity: number; total: number }>;
    
    const dailyServicePrice = serviceDetails.reduce((sum, detail) => sum + detail.total, 0);
    const datesCount = selectedDates.length || 1;
    const totalServicePrice = dailyServicePrice * datesCount;
    
    return { totalServicePrice, dailyServicePrice, serviceDetails };
  };

  // Calculate grand total
  const calculateTotal = (): {
    subtotal: number;
    voucherDiscount: number;
    refundedPointDiscount: number;
    grandTotal: number;
  } => {
    const { totalFieldPrice } = calculateFieldPrice();
    const { totalServicePrice } = calculateServicePrice();
    
    // Use calculateTotalPrice from props if available
    const subtotal = calculateTotalPrice ? calculateTotalPrice() : totalFieldPrice + totalServicePrice;
    const refundedPointDiscount = refundedPoint * 1000; // Convert points to VND (1 point = 1000 VND)
    
    return {
      subtotal,
      voucherDiscount: voucherDiscount,
      refundedPointDiscount,
      grandTotal: subtotal - voucherDiscount - refundedPointDiscount
    };
  };

  const { totalFieldPrice, dailyFieldPrice, peakHourDetails } = calculateFieldPrice();
  const { totalServicePrice, dailyServicePrice, serviceDetails } = calculateServicePrice();
  const { subtotal, voucherDiscount: voucherDiscountValue, refundedPointDiscount, grandTotal } = calculateTotal();
  const durationHours = getDurationHours();
  const datesCount = selectedDates.length || 1;

  // Render content based on step
  const renderStepContent = () => {
    // Step 2: Field Selection - Only show field cost
    if (step === 2) {
      return (
        <>
          {renderBookingTimeInfo()}
          
          {fieldGroup && (
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <Text strong>Chi phí sân</Text>                
              </div>
              
              <div className="pl-4 text-gray-600 text-sm space-y-1">
                <div className="flex justify-between">
                  <Text>Giá cơ bản ({durationHours} giờ)</Text>
                  <Text>{formatCurrency(fieldGroup.basePrice * durationHours)}</Text>
                </div>
                
                {peakHourDetails.map((detail, index) => (
                  <div key={index} className="flex justify-between items-center text-orange-500">
                    <Text>
                      <FieldTimeOutlined className="mr-1" />
                      Phụ thu giờ cao điểm ({formatTimeForDisplay(detail.peakStart)}-{formatTimeForDisplay(detail.peakEnd)})
                    </Text>
                    <Text>{formatCurrency(detail.hours * detail.priceIncrease)}</Text>
                  </div>
                ))}
                
                {/* Show total cost for one day */}
                <div className="flex justify-between items-center font-medium">
                  <Text>Tổng chi phí sân / ngày</Text>
                  <Text>{formatCurrency(dailyFieldPrice)}</Text>
                </div>
                
                {/* Always show number of days calculation */}
                {selectedDates.length > 1 && (
                  <>
                    <Divider className="my-2" />
                    <div className="flex justify-between items-center">
                      <Text>Số ngày đặt sân</Text>
                      <Text>x {selectedDates.length}</Text>
                    </div>
                    <div className="flex justify-between items-center font-medium text-blue-600">
                      <Text>Tổng chi phí sân ({selectedDates.length} ngày)</Text>
                      <Text>{formatCurrency(totalFieldPrice)}</Text>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          
          {/* Add a summary total for visibility */}
          {fieldGroup && (
            <>
              <Divider className="my-3" />
              <div className="flex justify-between items-center">
                <Text strong>Tạm tính</Text>
                <Text strong>{formatCurrency(totalFieldPrice)}</Text>
                
              </div>
              {selectedDates.length > 1 && (
                <div className="text-xs text-gray-500 text-right mt-1">
                  {formatCurrency(dailyFieldPrice)}/ngày × {selectedDates.length} ngày
                </div>
              )}
            </>
          )}
        </>
      );
    }
    
    // Step 3: Service Selection - Show field cost, services, and subtotal
    if (step === 3) {
      return (
        <>
          {renderBookingTimeInfo()}
          
          {fieldGroup && (
            <div className="bg-gray-50 p-3 rounded-md mb-4">
              <div className="flex justify-between items-center mb-2">
                <Text strong>Chi phí sân</Text>                
              </div>
              
              <div className="pl-4 text-gray-600 text-sm space-y-1">
                <div className="flex justify-between">
                  <Text>Giá cơ bản ({durationHours} giờ)</Text>
                  <Text>{formatCurrency(fieldGroup.basePrice * durationHours)}</Text>
                </div>
                
                {peakHourDetails.map((detail, index) => (
                  <div key={index} className="flex justify-between items-center text-orange-500">
                    <Text>
                      <FieldTimeOutlined className="mr-1" />
                      Phụ thu giờ cao điểm ({formatTimeForDisplay(detail.peakStart)}-{formatTimeForDisplay(detail.peakEnd)})
                    </Text>
                    <Text>{formatCurrency(detail.hours * detail.priceIncrease)}</Text>
                  </div>
                ))}
                
                {/* Show total cost for one day */}
                <div className="flex justify-between items-center font-medium">
                  <Text>Tổng chi phí sân / ngày</Text>
                  <Text>{formatCurrency(dailyFieldPrice)}</Text>
                </div>
                
                {/* Show number of days if multiple */}
                {selectedDates.length > 1 && (
                  <>
                    <Divider className="my-2" />
                    <div className="flex justify-between items-center">
                      <Text>Số ngày đặt sân</Text>
                      <Text>x {selectedDates.length}</Text>
                    </div>
                    <div className="flex justify-between items-center font-medium text-blue-600">
                      <Text>Tổng chi phí sân ({selectedDates.length} ngày)</Text>
                      <Text>{formatCurrency(totalFieldPrice)}</Text>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          
          {services && services.length > 0 && (
            <div className="bg-gray-50 p-3 rounded-md mb-4">
              <div className="flex justify-between items-center mb-2">
                <Text strong>Dịch vụ đi kèm</Text>                
              </div>
              
              <div className="pl-4 text-gray-600 text-sm space-y-1">
                {serviceDetails.map((service, index) => (
                  <div key={index} className="flex justify-between">
                    <Text>{service.name} (x{service.quantity})</Text>
                    <Text>{formatCurrency(service.total)}</Text>
                  </div>
                ))}
                
                {/* If services selected and multiple days, show calculation */}
                {selectedDates.length > 1 && services.length > 0 && (
                  <>
                    <div className="flex justify-between items-center font-medium mt-2">
                      <Text>Chi phí dịch vụ / ngày</Text>
                      <Text>{formatCurrency(dailyServicePrice)}</Text>
                    </div>
                    <Divider className="my-2" />
                    <div className="flex justify-between items-center">
                      <Text>Số ngày đặt sân</Text>
                      <Text>x {selectedDates.length}</Text>
                    </div>
                    <div className="flex justify-between items-center font-medium text-blue-600">
                      <Text>Tổng chi phí dịch vụ ({selectedDates.length} ngày)</Text>
                      <Text>{formatCurrency(totalServicePrice)}</Text>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          
          {(totalFieldPrice > 0 || totalServicePrice > 0) && (
            <>
              <Divider className="my-3" />
              <div className="flex justify-between items-center">
                <Text strong>Tạm tính</Text>
                <Text strong>{formatCurrency(subtotal)}</Text>
              </div>
              {selectedDates.length > 1 && (
                <div className="text-xs text-gray-500 text-right mt-1">
                  {formatCurrency(subtotal / datesCount)}/ngày × {datesCount} ngày
                </div>
              )}
            </>
          )}
        </>
      );
    }
    
    // Step 4: Payment - Show all costs including vouchers, refunded points, and final total
    return (
      <>
        {renderBookingTimeInfo()}
        
        {fieldGroup && (
          <div className="bg-gray-50 p-3 rounded-md mb-4">
            <div className="flex justify-between items-center mb-2">
              <Text strong>Chi phí sân</Text>
              <Text>{formatCurrency(totalFieldPrice)}</Text>
            </div>
            
            <div className="pl-4 text-gray-600 text-sm space-y-1">
              <div className="flex justify-between">
                <Text>Giá cơ bản ({durationHours} giờ)</Text>
                <Text>{formatCurrency(fieldGroup.basePrice * durationHours)}</Text>
              </div>
              
              {peakHourDetails.map((detail, index) => (
                <div key={index} className="flex justify-between items-center text-orange-500">
                  <Text>
                    <FieldTimeOutlined className="mr-1" />
                    Phụ thu giờ cao điểm ({formatTimeForDisplay(detail.peakStart)}-{formatTimeForDisplay(detail.peakEnd)})
                  </Text>
                  <Text>{formatCurrency(detail.hours * detail.priceIncrease)}</Text>
                </div>
              ))}
              
              {/* Show total cost for one day */}
              <div className="flex justify-between items-center font-medium">
                <Text>Tổng chi phí sân / ngày</Text>
                <Text>{formatCurrency(dailyFieldPrice)}</Text>
              </div>
              
              {/* Show number of days if multiple */}
              {selectedDates.length > 1 && (
                <>
                  <Divider className="my-2" />
                  <div className="flex justify-between items-center">
                    <Text>Số ngày đặt sân</Text>
                    <Text>x {selectedDates.length}</Text>
                  </div>
                  <div className="flex justify-between items-center font-medium text-blue-600">
                    <Text>Tổng chi phí sân ({selectedDates.length} ngày)</Text>
                    <Text>{formatCurrency(totalFieldPrice)}</Text>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        
        {services && services.length > 0 && (
          <div className="bg-gray-50 p-3 rounded-md mb-4">
            <div className="flex justify-between items-center mb-2">
              <Text strong>Dịch vụ đi kèm</Text>
              <Text>{formatCurrency(totalServicePrice)}</Text>
            </div>
            
            <div className="pl-4 text-gray-600 text-sm space-y-1">
              {serviceDetails.map((service, index) => (
                <div key={index} className="flex justify-between">
                  <Text>{service.name} (x{service.quantity})</Text>
                  <Text>{formatCurrency(service.total)}</Text>
                </div>
              ))}
              
              {/* If services selected and multiple days, show calculation */}
              {selectedDates.length > 1 && services.length > 0 && (
                <>
                  <div className="flex justify-between items-center font-medium mt-2">
                    <Text>Chi phí dịch vụ / ngày</Text>
                    <Text>{formatCurrency(dailyServicePrice)}</Text>
                  </div>
                  <Divider className="my-2" />
                  <div className="flex justify-between items-center">
                    <Text>Số ngày đặt sân</Text>
                    <Text>x {selectedDates.length}</Text>
                  </div>
                  <div className="flex justify-between items-center font-medium text-blue-600">
                    <Text>Tổng chi phí dịch vụ ({selectedDates.length} ngày)</Text>
                    <Text>{formatCurrency(totalServicePrice)}</Text>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          {/* <div className="flex justify-between font-medium">
            <Text>Tạm tính</Text>
            <Text>{formatCurrency(subtotal)}</Text>
          </div> */}
          
          {voucherDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <Text>
                <TagOutlined className="mr-1" />
                Giảm giá voucher
              </Text>
              <Text>-{formatCurrency(voucherDiscountValue)}</Text>
            </div>
          )}
          
          {refundedPointDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <Text>
                <GiftOutlined className="mr-1" />
                Điểm tích lũy ({refundedPoint} điểm)
              </Text>
              <Text>-{formatCurrency(refundedPointDiscount)}</Text>
            </div>
          )}
        </div>
        
        <Divider className="my-3" />
        
        <div className="flex justify-between items-center">
          <Text strong className="text-lg">Tổng cộng</Text>
          <div className="text-right">
            <Tag color="blue" className="text-lg px-3 py-1">
              <DollarOutlined className="mr-1" />
              {formatCurrency(grandTotal)}
            </Tag>
            {selectedDates.length > 1 && (
              <div className="text-xs text-gray-500 mt-1">
                {formatCurrency(grandTotal / datesCount)}/ngày × {datesCount} ngày
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <Card className="shadow-sm border border-gray-200">
      <Title level={4} className="mb-4">Thông tin thanh toán</Title>
      {renderStepContent()}
    </Card>
  );
};

export default BookingPaymentSummary; 