import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Form, Steps, Alert, Modal, Typography, Button, message
} from 'antd';
import { 
  ArrowLeftOutlined, ArrowRightOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { BookingFormData, RecurringType, RecurringConfig } from '@/types/booking.type';
import { bookingService } from '@/services/booking.service';
import { AvailableFieldGroup } from '@/types/field.type';
import { Service } from '@/types/service.type';
import { Sport } from '@/types/sport.type';

// Component imports
import BookingStepInfo from './components/BookingStepInfo';
import BookingStepField from './components/BookingStepField';
import BookingStepServices from './components/BookingStepServices';
import BookingStepPayment from './components/BookingStepPayment';
import RecurringModal from './components/RecurringModal';

const { Title, Text } = Typography;

// Constants
const WEEKDAYS = [
  { value: 8, label: 'Chủ nhật' },
  { value: 2, label: 'Thứ 2' },
  { value: 3, label: 'Thứ 3' },
  { value: 4, label: 'Thứ 4' },
  { value: 5, label: 'Thứ 5' },
  { value: 6, label: 'Thứ 6' },
  { value: 7, label: 'Thứ 7' }
];

// Add a function to convert between dayjs day value and our custom values
const convertDayjsDayToCustomDay = (dayjsDay: number): number => {
  // dayjs: 0 (Sunday) to 6 (Saturday)
  // custom: 2 (Monday) to 8 (Sunday)
  return dayjsDay === 0 ? 8 : dayjsDay + 1;
};

const convertCustomDayToDayjsDay = (customDay: number): number => {
  // custom: 2 (Monday) to 8 (Sunday)
  // dayjs: 0 (Sunday) to 6 (Saturday)
  return customDay === 8 ? 0 : customDay - 1;
};

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const { facilityId } = useParams();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(900); // 15 minutes in seconds
  const [formData, setFormData] = useState<Partial<BookingFormData>>({});
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [selectedDates, setSelectedDates] = useState<dayjs.Dayjs[]>([]);
  const [recurringType, setRecurringType] = useState<RecurringType>(RecurringType.DAILY);
  const [selectedWeekday, setSelectedWeekday] = useState<string>('');
  const [additionalWeekdays, setAdditionalWeekdays] = useState<number[]>([]);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<number>(1);
  const [recurrenceEndType, setRecurrenceEndType] = useState<'never' | 'on_date' | 'after_occurrences'>('never');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<dayjs.Dayjs | null>(null);
  const [recurrenceEndOccurrences, setRecurrenceEndOccurrences] = useState<number>(13);
  const [customRecurringOptions, setCustomRecurringOptions] = useState<{ value: string; label: string; type: RecurringType }[]>([]);
  const [previousRecurringOption, setPreviousRecurringOption] = useState<string>('none');
  
  // State for API data
  const [availableFieldGroups, setAvailableFieldGroups] = useState<AvailableFieldGroup[]>([]);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [uniqueSports, setUniqueSports] = useState<Sport[]>([]);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  // State for cancel confirm modal
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Maximum date constraints - 1 month from today
  const maxBookingDate = dayjs().add(1, 'month');

  // State lưu trữ thông tin giờ hoạt động của cơ sở
  const [operatingTimes, setOperatingTimes] = useState<{
    openTime1: string | null;
    closeTime1: string | null;
    openTime2: string | null;
    closeTime2: string | null;
    openTime3: string | null;
    closeTime3: string | null;
  }>({
    openTime1: null,
    closeTime1: null,
    openTime2: null,
    closeTime2: null,
    openTime3: null,
    closeTime3: null
  });

  // Fetch sports when component mounts
  useEffect(() => {
    const fetchSports = async () => {
      try {
        if (facilityId) {
          const sports = await bookingService.getSportsByFacility(facilityId);
          setUniqueSports(sports);
        }
      } catch (error) {
        console.error('Error fetching sports:', error);
        setError('Không thể tải dữ liệu thể thao. Vui lòng thử lại sau.');
      }
    };
    
    fetchSports();
  }, [facilityId]);

  useEffect(() => {
    if (currentStep > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 0) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentStep]);

  // Auto-update recurring dates when form data changes
  useEffect(() => {
    if (formData.isRecurring) {
      switch(recurringType) {
        case RecurringType.DAILY:
          form.setFieldsValue({ recurringOption: 'daily' });
          break;
        case RecurringType.WEEKLY:
          form.setFieldsValue({ recurringOption: 'weekly' });
          break;
        default:
          form.setFieldsValue({ recurringOption: 'custom' });
          break;
      }
    } else {
      form.setFieldsValue({ recurringOption: 'none' });
    }
  }, [recurringType, formData.isRecurring, form]);

  // Generate recurring dates based on selected date and recurring type
  const generateRecurringDates = (baseDate: dayjs.Dayjs, type: RecurringType) => {
    if (!baseDate) return [];
    
    const dates: dayjs.Dayjs[] = [baseDate];
    let endDate: dayjs.Dayjs;
    
    // Determine end date based on recurrence end type
    if (recurrenceEndType === 'on_date' && recurrenceEndDate) {
      endDate = recurrenceEndDate;
    } else if (recurrenceEndType === 'after_occurrences') {
      endDate = dayjs().add(3, 'month'); // Temporary large value
    } else {
      // Default constraint: 30 days from the base date
      endDate = baseDate.add(30, 'day'); 
      
      // Make sure we don't exceed the absolute maximum (60 days from today)
      const absoluteMaxDate = dayjs().add(60, 'day');
      if (endDate.isAfter(absoluteMaxDate)) {
        endDate = absoluteMaxDate;
      }
    }
    
    // Generate recurring dates based on type
    if (type === RecurringType.DAILY) {
      generateDailyDates(baseDate, endDate, dates);
    } else if (type === RecurringType.WEEKLY) {
      generateWeeklyDates(baseDate, endDate, dates);
    } else if (type === RecurringType.MONTHLY_BY_DAY) {
      generateMonthlyByDayDates(baseDate, endDate, dates);
    } else if (type === RecurringType.MONTHLY_BY_DATE) {
      generateMonthlyByDateDates(baseDate, endDate, dates);
    } else if (type === RecurringType.SAME_WEEK) {
      generateSameWeekDates(baseDate, dates);
    }
    
    // Limit to max occurrences if specified
    if (recurrenceEndType === 'after_occurrences') {
      dates.splice(recurrenceEndOccurrences); // Limit to exactly the number of occurrences
    }
    
    // Sort dates chronologically
    dates.sort((a, b) => a.valueOf() - b.valueOf());
    
    // Log for debugging
    console.log('Generated dates:', dates.map(d => d.format('DD/MM/YYYY')));
    
    // Update the selected dates state
    setSelectedDates(dates);
    
    return dates;
  };
  
  // Generate daily recurring dates
  const generateDailyDates = (baseDate: dayjs.Dayjs, endDate: dayjs.Dayjs, dates: dayjs.Dayjs[]) => {
    let currentDate = baseDate;
    
    for (let i = 1; i < (recurrenceEndType === 'after_occurrences' ? recurrenceEndOccurrences : 100); i++) {
      currentDate = currentDate.add(recurrenceFrequency, 'day');
      if (currentDate.isAfter(endDate)) break;
      dates.push(currentDate);
    }
  };
  
  // Generate weekly recurring dates
  const generateWeeklyDates = (baseDate: dayjs.Dayjs, endDate: dayjs.Dayjs, dates: dayjs.Dayjs[]) => {
    let currentDate = baseDate;
    
    for (let i = 1; i < (recurrenceEndType === 'after_occurrences' ? recurrenceEndOccurrences : 100); i++) {
      currentDate = currentDate.add(recurrenceFrequency, 'week');
      if (currentDate.isAfter(endDate)) break;
      dates.push(currentDate);
    }

    // Add additional weekdays if selected
    if (additionalWeekdays.length > 0) {
      const baseDayOfWeek = baseDate.day();
      const additionalDates: dayjs.Dayjs[] = [];
      
      additionalWeekdays.forEach(weekday => {
        if (weekday !== baseDayOfWeek) {
          let additionalDate = baseDate.day(weekday);
          
          // If we've gone backwards in time, go forward a week
          if (additionalDate.isBefore(baseDate)) {
            additionalDate = additionalDate.add(1, 'week');
          }
          
          // Add recurring instances of this additional weekday
          while (additionalDate.isBefore(endDate)) {
            additionalDates.push(additionalDate);
            additionalDate = additionalDate.add(recurrenceFrequency, 'week');
          }
        }
      });

      // Add and sort all dates
      dates.push(...additionalDates);
      dates.sort((a, b) => a.valueOf() - b.valueOf());
    }
  };
  
  // Generate monthly recurring dates by day of week
  const generateMonthlyByDayDates = (baseDate: dayjs.Dayjs, endDate: dayjs.Dayjs, dates: dayjs.Dayjs[]) => {
    let currentDate = baseDate;
    const weekOfMonth = Math.ceil(baseDate.date() / 7);
    const dayOfWeek = baseDate.day();
    
    for (let i = 1; i < (recurrenceEndType === 'after_occurrences' ? recurrenceEndOccurrences : 100); i++) {
      const nextMonth = currentDate.add(recurrenceFrequency, 'month');
      
      // Find the same day in the next month (e.g., 3rd Sunday)
      let targetDate = nextMonth.startOf('month');
      // Adjust to the first occurrence of the day of week
      if (targetDate.day() > dayOfWeek) {
        targetDate = targetDate.add(7 - (targetDate.day() - dayOfWeek), 'day');
      } else {
        targetDate = targetDate.add(dayOfWeek - targetDate.day(), 'day');
      }
      // Adjust to the correct week of month
      targetDate = targetDate.add(weekOfMonth - 1, 'week');
      
      if (targetDate.isAfter(endDate)) break;
      dates.push(targetDate);
      currentDate = nextMonth;
    }
  };
  
  // Generate monthly recurring dates by date of month
  const generateMonthlyByDateDates = (baseDate: dayjs.Dayjs, endDate: dayjs.Dayjs, dates: dayjs.Dayjs[]) => {
    let currentDate = baseDate;
    const dayOfMonth = baseDate.date();
    
    for (let i = 1; i < (recurrenceEndType === 'after_occurrences' ? recurrenceEndOccurrences : 100); i++) {
      const nextMonth = currentDate.add(recurrenceFrequency, 'month');
      const daysInMonth = nextMonth.daysInMonth();
      
      // Handle cases where the target date might not exist in shorter months
      const targetDay = Math.min(dayOfMonth, daysInMonth);
      const targetDate = nextMonth.date(targetDay);
      
      if (targetDate.isAfter(endDate)) break;
      dates.push(targetDate);
      currentDate = nextMonth;
    }
  };

  // Generate all remaining days in the current week
  const generateSameWeekDates = (baseDate: dayjs.Dayjs, dates: dayjs.Dayjs[]) => {
    // Clear any existing dates except the base date
    dates.splice(1);
    
    console.log("Base date:", baseDate.format('DD/MM/YYYY'), "Day of week:", baseDate.day());
    
    // Get the day of week in our custom format (2-8)
    const baseDayjsDay = baseDate.day(); // 0-6 where 0 is Sunday
    const baseCustomDay = convertDayjsDayToCustomDay(baseDayjsDay);
    
    // If the first day is Sunday (8 in our custom format), we don't add any more days
    // since it's already the last day of the week in Vietnamese convention
    if (baseCustomDay === 8) {
      console.log("First day is Sunday, no more days to add");
      return;
    }
    
    // Add days from day after baseDate up to Saturday (day 7 in our custom format)
    for (let customDay = baseCustomDay + 1; customDay <= 7; customDay++) {
      // Convert back to dayjs day format (0-6)
      const dayjsDay = convertCustomDayToDayjsDay(customDay);
      
      // Get the date for this day in the current week
      let targetDate = baseDate.clone();
      targetDate = targetDate.day(dayjsDay);
      
      // If the date went to the previous week, move to next week
      if (targetDate.isBefore(baseDate)) {
        targetDate = targetDate.add(1, 'week');
      }
      
      // Add the date if it's after our base date
      if (targetDate.isAfter(baseDate)) {
        dates.push(targetDate);
        console.log("Added day:", targetDate.format('DD/MM/YYYY'), 
                   "Custom day:", customDay, 
                   "Dayjs day:", dayjsDay, 
                   "Weekday:", getWeekdayName(targetDate));
      }
    }
    
    // Now explicitly handle Sunday (day 8 or 0)
    const sundayDayjsDay = 0; // Sunday in dayjs
    let sundayDate = baseDate.clone().day(sundayDayjsDay);
    
    // If Sunday is before our base date, get the next week's Sunday
    if (sundayDate.isBefore(baseDate)) {
      sundayDate = sundayDate.add(1, 'week');
    }
    
    // Check if this Sunday is still in the same week as our base date
    // or is the next immediate Sunday after our base date
    const baseWeekEnd = baseDate.clone().endOf('week');
    if (sundayDate.isSame(baseWeekEnd, 'day') || 
        (sundayDate.isAfter(baseDate) && sundayDate.diff(baseDate, 'day') <= 7)) {
      dates.push(sundayDate);
      console.log("Added Sunday:", sundayDate.format('DD/MM/YYYY'), 
                 "Custom day: 8", 
                 "Dayjs day: 0", 
                 "Weekday:", getWeekdayName(sundayDate));
    }
    
    // Sort dates chronologically
    dates.sort((a, b) => a.valueOf() - b.valueOf());
    
    console.log("Final selected dates:", dates.map(d => 
      `${d.format('DD/MM/YYYY')} (${getWeekdayName(d)})`
    ));
  };

  // Handle date change in the form
  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      form.setFieldsValue({ date });
      setSelectedWeekday(getWeekdayName(date));
      
      // Always add the selected date to the array, even for non-recurring bookings
      if (!selectedDates.some(d => d.isSame(date, 'day'))) {
        if (formData.isRecurring && recurringType !== RecurringType.NONE) {
          // If recurring, update the recurring dates with the new date but same pattern
          const newDates = generateRecurringDates(date, recurringType);
          setSelectedDates(newDates);
          
          // Update form data to keep the recurring configuration consistent
          const updatedFormData = {
            ...formData,
            date,
            isRecurring: true,
            recurringConfig: {
              ...formData.recurringConfig,
              startDate: date,
              type: recurringType
            }
          };
          setFormData(updatedFormData);
        } else {
          // If not recurring, just set this single date
          setSelectedDates([date]);
        }
      }
    } else {
      setSelectedWeekday('');
    }
  };

  // Fetch available field groups based on selected criteria
  const fetchAvailableFieldGroups = async () => {
    try {
      setLoading(true);
      
      const values = await form.validateFields(['sportId', 'date', 'timeRange']);
      
      if (!facilityId || !values.sportId || !values.date || !values.timeRange) {
        message.error('Vui lòng chọn đầy đủ thông tin thể thao, ngày và giờ');
        setLoading(false);
        return;
      }
      
      // Prepare the dates array
      const dates = selectedDates.map(date => date.format('YYYY-MM-DD'));
      
      // Get start time and end time
      const startTime = values.timeRange[0].format('HH:mm');
      const endTime = values.timeRange[1].format('HH:mm');
      
      // Call the API to get available field groups
      const fieldGroups = await bookingService.getAvailableFieldGroups(
        facilityId,
        values.sportId,
        dates,
        startTime,
        endTime
      );
      
      setAvailableFieldGroups(fieldGroups);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching available field groups:', error);
      message.error('Không thể tải dữ liệu sân có sẵn. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  // Direct API call for available services
  const getAvailableServices = async (facilityId: string, bookingId: string) => {
    try {
      console.log(`Fetching services with facilityId=${facilityId}, bookingId=${bookingId}`);
      setLoading(true);
      const services = await bookingService.getAvailableServices(facilityId, bookingId);
      console.log('Available services:', services);
      setAvailableServices(services);
      setLoading(false);
      return services;
    } catch (error) {
      console.error('Error fetching available services:', error);
      message.error('Không thể tải dịch vụ khả dụng. Vui lòng thử lại sau.');
      setLoading(false);
      return [];
    }
  };

  // Hàm tiện ích để đảm bảo timeRange luôn là dayjs objects
  const ensureDayjsTimeRange = (timeRange: unknown): [dayjs.Dayjs, dayjs.Dayjs] | null => {
    if (!timeRange || !Array.isArray(timeRange) || timeRange.length < 2) {
      return null;
    }
    
    // Đảm bảo các phần tử là dayjs objects
    const start = dayjs.isDayjs(timeRange[0]) ? timeRange[0] : dayjs(timeRange[0]);
    const end = dayjs.isDayjs(timeRange[1]) ? timeRange[1] : dayjs(timeRange[1]);
    
    if (!start.isValid() || !end.isValid()) {
      return null;
    }
    
    return [start, end];
  };

  // Create draft booking
  const createDraftBooking = async () => {
    try {
      setLoading(true);
      
      // Sử dụng formData đã lưu thay vì validate lại form
      console.log("Create draft booking with formData:", formData);
      
      // Kiểm tra và đảm bảo timeRange là đúng định dạng
      const timeRange = ensureDayjsTimeRange(formData.timeRange);
      if (!timeRange) {
        message.error('Thời gian đặt sân không hợp lệ');
        console.error('Invalid timeRange in formData:', formData.timeRange);
        setLoading(false);
        return null;
      }
      
      // Get start and end time
      const startTime = timeRange[0].format('HH:mm');
      const endTime = timeRange[1].format('HH:mm');
      
      // Ensure selectedDates is not empty
      if (!selectedDates || selectedDates.length === 0) {
        message.error('Vui lòng chọn ngày đặt sân');
        setLoading(false);
        return null;
      }
      
      // Ensure sportId is valid
      if (!formData.sportId) {
        message.error('Vui lòng chọn loại hình thể thao');
        setLoading(false);
        return null;
      }
      
      // Lấy fieldSelections từ form để hỗ trợ lựa chọn sân độc lập cho từng ngày
      const fieldSelections = form.getFieldValue('fieldSelections') || {};
      console.log('Field selections from form:', fieldSelections);
      
      // Get fallback fieldId
      const fallbackFieldId = form.getFieldValue('fieldId');
      if (!fallbackFieldId) {
        console.error('Missing fieldId in form');
        
        // Try to get fieldId from fieldGroup
        if (formData.fieldGroupId) {
          const fieldGroup = availableFieldGroups.find(g => String(g.id) === String(formData.fieldGroupId));
          if (fieldGroup && fieldGroup.bookingSlot && fieldGroup.bookingSlot.length > 0) {
            const firstActiveField = fieldGroup.bookingSlot[0].fields.find(f => f.status === 'active');
            if (firstActiveField) {
              console.log('Using first active field as fallback:', firstActiveField.id);
              
              // Prepare booking slots with per-date field selection or fallback
              const bookingSlots = selectedDates.map(date => {
                const dateStr = date.format('YYYY-MM-DD');
                // Use the field selected for this date, or the fallback
                const fieldId = fieldSelections[dateStr] ? Number(fieldSelections[dateStr]) : firstActiveField.id;
                
                return {
                  date: dateStr,
                  fieldId: fieldId
                };
              });
              
              console.log("Booking slots with per-date selection:", bookingSlots);
              
              // Create draft booking
              const response = await bookingService.createDraftBooking(
                startTime,
                endTime,
                bookingSlots,
                formData.sportId
              );
              
              console.log("Draft booking response:", response);
              
              // Store the booking ID and payment ID
              setBookingId(response.id);
              setPaymentId(response.payment.id);
              
              setLoading(false);
              return response.id;
            }
          }
        }
        
        message.error('Không tìm thấy sân khả dụng. Vui lòng thử lại.');
        setLoading(false);
        return null;
      }
      
      // Prepare booking slots with per-date field selection
      const bookingSlots = selectedDates.map(date => {
        const dateStr = date.format('YYYY-MM-DD');
        // Use the specific field selected for this date, or fallback to the default
        const fieldId = fieldSelections[dateStr] ? Number(fieldSelections[dateStr]) : Number(fallbackFieldId);
        
        return {
          date: dateStr,
          fieldId: fieldId
        };
      });
      
      console.log("Booking slots with per-date selection:", bookingSlots);
      console.log("Request body:", {
        startTime,
        endTime,
        bookingSlots,
        sportId: formData.sportId
      });
      
      // Create draft booking
      const response = await bookingService.createDraftBooking(
        startTime,
        endTime,
        bookingSlots,
        formData.sportId
      );
      
      console.log("Draft booking response:", response);
      
      // Store the booking ID and payment ID
      setBookingId(response.id);
      setPaymentId(response.payment.id);
      
      setLoading(false);
      return response.id;
    } catch (error) {
      console.error('Error creating draft booking:', error);
      
      // Hiển thị thông báo lỗi chi tiết hơn
      if (error instanceof Error) {
        message.error(`Không thể tạo đơn đặt sân: ${error.message}`);
      } else {
        message.error('Không thể tạo đơn đặt sân. Vui lòng thử lại sau.');
      }
      
      setLoading(false);
      return null;
    }
  };

  // Update booking slot
  const updateBookingSlot = async () => {
    try {
      setLoading(true);
      
      if (!bookingId) {
        message.error('Không tìm thấy đơn đặt sân');
        setLoading(false);
        return false;
      }
      
      // Sử dụng formData đã lưu thay vì validate lại form
      console.log("Update booking slot with formData:", formData);
      
      // Kiểm tra và đảm bảo timeRange là đúng định dạng
      const timeRange = ensureDayjsTimeRange(formData.timeRange);
      if (!timeRange) {
        message.error('Thời gian đặt sân không hợp lệ');
        console.error('Invalid timeRange in formData:', formData.timeRange);
        setLoading(false);
        return false;
      }
      
      // Lấy fieldSelections từ form để hỗ trợ lựa chọn sân độc lập cho từng ngày
      const fieldSelections = form.getFieldValue('fieldSelections') || {};
      console.log('Field selections from form:', fieldSelections);
      
      // Ensure fallback fieldId is available if needed
      const fallbackFieldId = Number(formData.fieldId);
      if (!fallbackFieldId || isNaN(fallbackFieldId)) {
        message.error('ID sân không hợp lệ');
        console.error('Invalid fallback fieldId:', formData.fieldId);
        setLoading(false);
        return false;
      }
      
      // Ensure selectedDates is not empty
      if (!selectedDates || selectedDates.length === 0) {
        message.error('Vui lòng chọn ngày đặt sân');
        setLoading(false);
        return false;
      }
      
      // Prepare booking slots - now using the specific field for each date
      const bookingSlots = selectedDates.map(date => {
        const dateStr = date.format('YYYY-MM-DD');
        // Use the specific field selected for this date, or fallback to the default
        const fieldId = fieldSelections[dateStr] ? Number(fieldSelections[dateStr]) : fallbackFieldId;
        
        return {
          date: dateStr,
          fieldId: fieldId
        };
      });
      
      console.log("Updated booking slots:", bookingSlots);
      
      // Update booking slots
      const response = await bookingService.updateBookingSlot(bookingId, bookingSlots);
      console.log("Update booking slot response:", response);
      
      // Update payment ID if needed
      if (response.payment && response.payment.id) {
        setPaymentId(response.payment.id);
      }
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Error updating booking slot:', error);
      
      // Hiển thị thông báo lỗi chi tiết hơn
      if (error instanceof Error) {
        message.error(`Không thể cập nhật thông tin sân: ${error.message}`);
      } else {
        message.error('Không thể cập nhật thông tin sân. Vui lòng thử lại sau.');
      }
      
      setLoading(false);
      return false;
    }
  };

  // Update additional services
  const updateAdditionalServices = async () => {
    try {
      setLoading(true);
      
      if (!bookingId) {
        message.error('Không tìm thấy đơn đặt sân');
        console.error('Missing bookingId for updating additional services');
        setLoading(false);
        return false;
      }
      
      // Get current services from form - use getFieldValue instead of validateFields
      // since services is optional and validation might fail
      const services = form.getFieldValue('services') || [];
      console.log('Services from form:', services);
      
      if (!Array.isArray(services) || services.length === 0) {
        // If no services are selected, just continue without calling API
        console.log('No services selected, skipping API call');
        setLoading(false);
        return true;
      }
      
      // Prepare additional services using quantity as requested by the API
      const additionalServices = services.map((service) => ({
        serviceId: service.serviceId,
        quantity: service.quantity
      }));
      
      console.log('Updating additional services with:', additionalServices);
      
      // Update additional services
      const response = await bookingService.updateAdditionalServices(bookingId, additionalServices);
      console.log('Update additional services response:', response);
      
      // Update payment ID if needed
      if (response.payment && response.payment.id) {
        setPaymentId(response.payment.id);
      }
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Error updating additional services:', error);
      if (error instanceof Error) {
        message.error(`Không thể cập nhật dịch vụ: ${error.message}`);
      } else {
        message.error('Không thể cập nhật dịch vụ. Vui lòng thử lại sau.');
      }
      setLoading(false);
      return false;
    }
  };

  // Process payment
  const processPayment = async () => {
    try {
      setLoading(true);
      
      if (!paymentId) {
        message.error('Không tìm thấy thông tin thanh toán');
        setLoading(false);
        return;
      }
      
      const values = await form.validateFields(['paymentMethod', 'voucherId']);
      
      // Process payment
      const response = await bookingService.processPayment(
        paymentId,
        values.paymentMethod,
        values.voucherId
      );      
      
      // For online payment, redirect to payment URL
      if (response.paymentUrl) {
        window.location.href = response.paymentUrl;
      } else {
        message.error('Không nhận được đường dẫn thanh toán');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error processing payment:', error);
      message.error('Không thể xử lý thanh toán. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  // Navigation and form submission handlers
  const handleNext = async () => {
    try {
      setError(null);
      
      if (currentStep === 0) {
        // Step 0: Validate thông tin cơ bản và fetch available fields
        const basicValues = await form.validateFields(['sportId', 'date', 'timeRange']);
        console.log("Step 0 basic values:", basicValues);
        
        // Kiểm tra và chuyển đổi timeRange
        const timeRange = ensureDayjsTimeRange(basicValues.timeRange);
        if (!timeRange) {
          message.error('Thời gian đặt sân không hợp lệ');
          return;
        }
        
        // Cập nhật timeRange với giá trị đã chuyển đổi
        basicValues.timeRange = timeRange;
        
        // Lưu trữ thông tin vào formData và state
        const updatedFormData = { ...formData, ...basicValues };
        setFormData(updatedFormData);
        console.log("Updated formData after step 0:", updatedFormData);
        
        // Gọi API để lấy danh sách sân
        await fetchAvailableFieldGroups();        
       
      } else if (currentStep === 1) {
        // Step 1: Lấy giá trị fieldGroupId và fieldId từ form mà không strict validate
        const fieldValues = form.getFieldsValue(['fieldGroupId', 'fieldId']);
        console.log("Step 1 field values:", fieldValues);
        
        // Đảm bảo chúng ta có fieldGroupId
        if (!fieldValues.fieldGroupId) {
          message.error('Vui lòng chọn loại sân');
          return;
        }
        
        // Lấy lại fieldId từ form - phòng trường hợp chưa được cập nhật
        const formFieldId = form.getFieldValue('fieldId');
        if (formFieldId && !fieldValues.fieldId) {
          fieldValues.fieldId = formFieldId;
        }
        
        // Get field selection from fieldGroup if fieldId is still missing
        if (!fieldValues.fieldId && fieldValues.fieldGroupId) {
          const fieldGroup = availableFieldGroups.find(g => String(g.id) === String(fieldValues.fieldGroupId));
          if (fieldGroup && fieldGroup.bookingSlot && fieldGroup.bookingSlot.length > 0) {
            // Find first active field in first slot
            const firstActiveField = fieldGroup.bookingSlot[0].fields.find(f => f.status === 'active');
            if (firstActiveField) {
              console.log('Using first active field as default:', firstActiveField.id);
              fieldValues.fieldId = firstActiveField.id;
              form.setFieldValue('fieldId', firstActiveField.id);
            }
          }
        }
        
        if (!fieldValues.fieldId) {
          message.error('Không tìm thấy sân khả dụng. Vui lòng thử lại.');
          return;
        }
        
        // Cập nhật formData bằng cách kết hợp với dữ liệu hiện có
        const updatedFormData = { ...formData, ...fieldValues };
        setFormData(updatedFormData);
        console.log("Updated formData after step 1:", updatedFormData);
        
        // First time creating draft booking or update existing
        if (!bookingId) {
          // Create a new draft booking and get the bookingId
          const createdBookingId = await createDraftBooking();
          if (!createdBookingId) {
            message.error('Không thể tạo đơn đặt sân');
            return; // Stop if creation fails
          }
          
          // Wait briefly to ensure bookingId is set in state
          setTimeout(async () => {
            if (facilityId && createdBookingId) {
              console.log(`Fetching services after createDraftBooking with facilityId=${facilityId}, bookingId=${createdBookingId}`);
              try {
                const services = await getAvailableServices(facilityId, createdBookingId);
                console.log('Available services:', services);
                setAvailableServices(services);
              } catch (error) {
                console.error('Error fetching services after create:', error);
                message.error('Không thể tải dịch vụ. Vui lòng thử lại sau.');
              }
            } else {
              console.error('Missing IDs after create:', { facilityId, createdBookingId });
            }
          }, 500);
        } else {
          // Update existing booking
          const updateSuccess = await updateBookingSlot();
          if (!updateSuccess) return;
          
          // Fetch services after updating
          try {
            const services = await getAvailableServices(facilityId || '', bookingId);
            console.log('Available services after update:', services);
            setAvailableServices(services);
          } catch (error) {
            console.error('Error fetching services after update:', error);
            message.error('Không thể tải dịch vụ. Vui lòng thử lại sau.');
          }
        }
        
      } else if (currentStep === 2) {
        // Step 2: Get services from form (do not validate as services are optional)
        const serviceValues = form.getFieldValue('services') || [];
        
        // Cập nhật formData
        const updatedFormData = { ...formData, services: serviceValues };
        setFormData(updatedFormData);
        console.log("Updated formData after step 2:", updatedFormData);
        
        // Going to payment step - update services if any
        const success = await updateAdditionalServices();
        if (!success) return;
        
      } else if (currentStep === 3) {
        // Step 3: Validate payment information
        const paymentValues = await form.validateFields(['paymentMethod']);
        
        // Cập nhật formData
        const updatedFormData = { ...formData, ...paymentValues };
        setFormData(updatedFormData);
        console.log("Updated formData after step 3:", updatedFormData);
      }
      
      // Move to next step
      setCurrentStep(prev => prev + 1);
    } catch (error) {
      console.error('Validation failed:', error);
      
      // Hiển thị thông báo lỗi chi tiết hơn
      if (error instanceof Error) {
        message.error(`Lỗi xác thực: ${error.message}`);
      } else {
        message.error('Có lỗi xảy ra. Vui lòng thử lại.');
      }
    }
  };

  const handlePrev = async () => {
    // Preserve form values when going back
    const currentValues = form.getFieldsValue();
    setFormData(prev => ({ ...prev, ...currentValues }));
    
    // Nếu đang ở step 1 và sắp quay về step 0 và đã có bookingId
    if (currentStep === 1 && bookingId) {
      try {
        setLoading(true);
        console.log(`Deleting draft booking with ID: ${bookingId}`);
        await bookingService.deleteBookingDraft(bookingId);
        
        // Reset booking data
        setBookingId(null);
        setPaymentId(null);
        
        // Reset field-related form data
        form.setFieldsValue({
          fieldId: undefined,
          fieldGroupId: undefined,
          services: []
        });
        
        // Reset available field groups để khi chuyển sang step 1 lại phải fetch lại
        setAvailableFieldGroups([]);
        
        // Reset data related to booking
        setFormData(prev => ({
          ...prev,
          fieldId: undefined,
          fieldGroupId: undefined,
          services: []
        }));
        
        setLoading(false);
        console.log('Draft booking deleted successfully and data reset');
      } catch (error) {
        console.error('Error deleting draft booking:', error);
        setLoading(false);
        
        // Hiển thị thông báo lỗi nhưng vẫn cho phép quay lại step đầu
        message.warning('Không thể xóa đơn đặt sân nháp, nhưng bạn vẫn có thể quay lại bước trước.');
      }
    }
    
    // Move to previous step
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmitBooking = async () => {
    await processPayment();
    setShowConfirmModal(false);
  };

  // Recurring booking handlers
  const handleRecurringConfigChange = (config: Partial<RecurringConfig>) => {
    form.setFieldsValue({ recurringConfig: config });
  };

  const handleRecurringTypeChange = (type: RecurringType) => {
    setRecurringType(type);
    setAdditionalWeekdays([]);
    
    if (form.getFieldValue('date')) {
      const dates = generateRecurringDates(form.getFieldValue('date'), type);
      setSelectedDates(dates);
    }
    
    handleRecurringConfigChange({ type });
  };

  const handleRecurrenceFrequencyChange = (value: number) => {
    setRecurrenceFrequency(value);
    
    if (form.getFieldValue('date')) {
      const dates = generateRecurringDates(form.getFieldValue('date'), recurringType);
      setSelectedDates(dates);
    }
  };

  const handleRecurrenceEndTypeChange = (type: 'never' | 'on_date' | 'after_occurrences') => {
    setRecurrenceEndType(type);
    
    if (form.getFieldValue('date')) {
      const dates = generateRecurringDates(form.getFieldValue('date'), recurringType);
      setSelectedDates(dates);
    }
  };

  const handleRecurrenceEndDateChange = (date: dayjs.Dayjs | null) => {
    setRecurrenceEndDate(date);
    
    if (form.getFieldValue('date') && date) {
      const dates = generateRecurringDates(form.getFieldValue('date'), recurringType);
      setSelectedDates(dates);
    }
  };

  const handleRecurrenceEndOccurrencesChange = (value: number) => {
    setRecurrenceEndOccurrences(value);
    
    if (form.getFieldValue('date')) {
      const dates = generateRecurringDates(form.getFieldValue('date'), recurringType);
      setSelectedDates(dates);
    }
  };

  const handleRecurringModalOk = () => {
    // Get the current base date
    const baseDate = form.getFieldValue('date');
    
    // Ensure there's a selected date
    if (!baseDate) {
      message.error('Vui lòng chọn ngày đặt sân trước');
      return;
    }
    
    // Generate dates based on current recurring settings
    const generatedDates = generateRecurringDates(baseDate, recurringType);
    
    // Update selected dates
    setSelectedDates(generatedDates);
    
    // Create recurring config
    const config: RecurringConfig = {
      type: recurringType,
      startDate: baseDate,
      endDate: generatedDates[generatedDates.length - 1],
      daysOfWeek: additionalWeekdays.length > 0 ? additionalWeekdays : [baseDate.day()],
      frequency: recurrenceFrequency,
      endType: recurrenceEndType,
      endOccurrences: recurrenceEndOccurrences
    };
    
    // Only add endDate if the endType is on_date and we have a valid date
    if (recurrenceEndType === 'on_date' && recurrenceEndDate) {
      config.endDate = recurrenceEndDate;
    }
    
    // Update form data
    handleRecurringConfigChange(config);
    form.setFieldsValue({ isRecurring: true });
    
    // Close the modal
    setShowRecurringModal(false);
  };

  const handleOpenRecurringModal = () => {
    // Save the current recurring option before opening the modal
    setPreviousRecurringOption(form.getFieldValue('recurringOption'));
    
    // Show the modal
    setShowRecurringModal(true);
  };

  const handleRecurringModalCancel = () => {
    // Restore the previous recurring option when canceling
    form.setFieldsValue({ recurringOption: previousRecurringOption });
    setFormData(prev => ({
      ...prev,
      recurringOption: previousRecurringOption
    }));
    
    // Close the modal
    setShowRecurringModal(false);
  };

  // Utility functions
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getWeekdayName = (date: dayjs.Dayjs | null): string => {
    if (!date) return '';
    
    // Convert from dayjs day (0-6) to our custom day (2-8)
    const customDay = convertDayjsDayToCustomDay(date.day());
    
    return WEEKDAYS.find(day => day.value === customDay)?.label || '';
  };

  const calculateTotalPrice = () => {
    // Get current field price from the booking's payment data
    let fieldPrice = 0;
    let servicePrice = 0;
    const discount = 0;
    
    // If we have payment data, use those values
    if (formData.fieldGroupId) {
      const fieldGroup = availableFieldGroups.find(g => String(g.id) === String(formData.fieldGroupId));
      if (fieldGroup) {
        fieldPrice = fieldGroup.basePrice * selectedDates.length;
      }
    }
    
    // Calculate service price from selected services
    if (Array.isArray(formData.services) && formData.services.length > 0) {
      servicePrice = formData.services.reduce((total, service) => {
        const serviceInfo = availableServices.find(s => s.id === service.serviceId);
        return total + (serviceInfo?.price || 0) * service.quantity;
      }, 0);
    }
    
    return fieldPrice + servicePrice - discount;
  };

  // Function to save a custom recurring option
  const saveCustomRecurringOption = (label: string) => {
    // Generate a unique value for this custom option
    const value = `custom_${Date.now()}`;
    
    // Create a new option object
    const newOption = {
      value,
      label,
      type: recurringType
    };
    
    // Add the new option to the list of custom options
    setCustomRecurringOptions(prev => [...prev, newOption]);
    
    // Update the form with the new recurring option
    form.setFieldsValue({ recurringOption: value });
    
    // Update the formData state
    setFormData(prev => ({
      ...prev,
      recurringOption: value
    }));
  };

  // Update handleRecurringOptionChange to handle custom options
  const handleRecurringOptionChange = (value: string) => {
    // Check if this is a custom option
    if (value.startsWith('custom_')) {
      // Find the custom option
      const customOption = customRecurringOptions.find(option => option.value === value);
      if (customOption) {
        // Apply the recurring type from the custom option
        handleRecurringTypeChange(customOption.type);
        
        // Generate dates
        if (form.getFieldValue('date')) {
          generateRecurringDates(form.getFieldValue('date'), customOption.type);
        }
      }
    }
    
    // Update the form value
    form.setFieldsValue({ recurringOption: value });
    
    // Update formData
    setFormData(prev => ({
      ...prev,
      recurringOption: value
    }));
  };

  // Hàm hủy đặt sân hiện tại
  const deleteCurrentBooking = async () => {
    if (!bookingId) return;
    
    try {
      setLoading(true);
      console.log(`Deleting current booking with ID: ${bookingId}`);
      await bookingService.deleteBookingDraft(bookingId);
      
      // Reset booking data
      setBookingId(null);
      setPaymentId(null);
      
      // Reset field-related form data
      form.resetFields();
      
      // Reset available field groups
      setAvailableFieldGroups([]);
      
      // Reset available services
      setAvailableServices([]);
      
      // Reset selected dates if any
      setSelectedDates([]);
      
      // Reset form data
      setFormData({});
      
      setLoading(false);
      message.success('Đã hủy đơn đặt sân');
      
      // Quay về trang facility
      navigate(`/facility/${facilityId}`);
    } catch (error) {
      console.error('Error deleting current booking:', error);
      setLoading(false);
      message.error('Không thể hủy đơn đặt sân. Vui lòng thử lại sau.');
    }
  };

  // Cleanup khi người dùng rời khỏi trang
  useEffect(() => {
    return () => {
      // Chỉ thực hiện cleanup khi đơn còn đang ở trạng thái draft (chưa thanh toán)
      if (bookingId) {
        console.log(`Cleaning up draft booking with ID: ${bookingId}`);
        bookingService.deleteBookingDraft(bookingId).catch(error => {
          console.error('Error cleaning up draft booking:', error);
        });
      }
    };
  }, [bookingId]);

  // Tự động fetch field groups khi vào step 1 nhưng không có dữ liệu
  useEffect(() => {
    const step1 = 1; // Định nghĩa hằng số để tránh lỗi linter
    if (currentStep === step1 && availableFieldGroups.length === 0) {
      const fetchData = async () => {
        try {
          // Kiểm tra xem có đủ thông tin để gọi API không
          const values = form.getFieldsValue(['sportId', 'date', 'timeRange']);
          if (values.sportId && values.date && values.timeRange && 
              values.timeRange[0] && values.timeRange[1]) {
            console.log('Auto fetching field groups on entering step 1 with empty data');
            await fetchAvailableFieldGroups();
          }
        } catch (error) {
          console.error('Error auto-fetching field groups:', error);
        }
      };
      
      fetchData();
    }
  }, [currentStep, availableFieldGroups.length, form, fetchAvailableFieldGroups]);

  // Fetch giờ hoạt động của cơ sở khi component mount
  useEffect(() => {
    const fetchOperatingTimes = async () => {
      try {
        if (facilityId) {
          const times = await bookingService.getActiveOperatingTime(facilityId);
          setOperatingTimes(times);
          console.log('Facility operating times:', times);
        }
      } catch (error) {
        console.error('Error fetching facility operating times:', error);
        message.error('Không thể lấy thông tin giờ hoạt động. Một số tính năng validate có thể không hoạt động chính xác.');
      }
    };
    
    fetchOperatingTimes();
  }, [facilityId]);

  // Validate thời gian chơi dựa trên ngày hiện tại và giờ hoạt động của cơ sở
  const validateTimeRange = (_: unknown, timeRange: [dayjs.Dayjs, dayjs.Dayjs] | null): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!timeRange) {
        reject('Vui lòng chọn thời gian');
        return;
      }

      const [startTime, endTime] = timeRange;
      
      // Kiểm tra thời gian chơi tối thiểu là 30 phút
      const durationMinutes = endTime.diff(startTime, 'minute');
      if (durationMinutes < 30) {
        reject('Thời gian chơi tối thiểu là 30 phút');
        return;
      }

      const selectedDate = dayjs(form.getFieldValue('date'));
      const today = dayjs().startOf('day');
      const isToday = selectedDate.isSame(today, 'day');

      // Nếu ngày được chọn là hôm nay, kiểm tra thời gian bắt đầu phải sau thời gian hiện tại ít nhất 15 phút
      if (isToday) {
        const now = dayjs();
        const bufferTime = now.add(15, 'minute');
        
        if (startTime.isBefore(bufferTime)) {
          reject('Thời gian bắt đầu phải sau thời điểm hiện tại ít nhất 15 phút');
          return;
        }
      }

      // Kiểm tra thời gian có nằm trong giờ hoạt động của cơ sở không
      if (operatingTimes && operatingTimes.openTime1 && operatingTimes.closeTime1) {
        const openTime = dayjs(operatingTimes.openTime1, 'HH:mm:ss');
        const closeTime = dayjs(operatingTimes.closeTime1, 'HH:mm:ss');
        
        const startTimeOfDay = dayjs().hour(startTime.hour()).minute(startTime.minute()).second(0);
        const endTimeOfDay = dayjs().hour(endTime.hour()).minute(endTime.minute()).second(0);
        
        // Điều kiện đã được sửa để cho phép thời gian kết thúc bằng với thời gian đóng cửa
        if (startTimeOfDay.isBefore(openTime) || (endTimeOfDay.isAfter(closeTime) && !endTimeOfDay.isSame(closeTime, 'minute'))) {
          reject(`Thời gian phải nằm trong khung giờ hoạt động từ ${openTime.format('HH:mm')} đến ${closeTime.format('HH:mm')}`);
          return;
        }
      }

      resolve();
    });
  };

  const steps = [
    {
      title: 'Thông tin đặt sân',
      content: (
        <BookingStepInfo
          form={form}
          formData={formData}
          sports={uniqueSports}
          handleDateChange={handleDateChange}
          selectedWeekday={selectedWeekday}
          selectedDates={selectedDates}
          setSelectedDates={setSelectedDates}
          setShowRecurringModal={handleOpenRecurringModal}
          setRecurringType={handleRecurringTypeChange}
          generateRecurringDates={generateRecurringDates}
          getWeekdayName={getWeekdayName}
          maxBookingDate={maxBookingDate}
          customRecurringOptions={customRecurringOptions}
          onRecurringOptionChange={handleRecurringOptionChange}
          validateTimeRange={validateTimeRange}
          operatingTimes={operatingTimes}
        />
      )
    },
    {
      title: 'Chọn sân',
      content: (
        <BookingStepField
          form={form}
          formData={formData}
          fieldGroups={availableFieldGroups}
          formatCurrency={formatCurrency}
        />
      )
    },
    {
      title: 'Dịch vụ',
      content: (
        <BookingStepServices
          form={form}
          formData={formData}
          services={availableServices}
        />
      )
    },
    {
      title: 'Thanh toán',
      content: (
        <BookingStepPayment
          form={form}
          formData={formData}
          fieldGroups={availableFieldGroups}
          services={availableServices}
          sports={uniqueSports}
          selectedDates={selectedDates}
          formatCurrency={formatCurrency}
          calculateTotalPrice={calculateTotalPrice}
        />
      )
    }
  ];

  // Modal components
  const cancelConfirmModal = (
    <Modal
      title="Xác nhận hủy đặt sân"
      open={showCancelModal}
      onOk={deleteCurrentBooking}
      onCancel={() => setShowCancelModal(false)}
      confirmLoading={loading}
      okText="Xác nhận hủy"
      cancelText="Quay lại đặt sân"
      okButtonProps={{ danger: true }}
    >
      <p>Bạn có chắc chắn muốn hủy đơn đặt sân này không?</p>
      <p>Tất cả thông tin bạn đã nhập sẽ bị xóa và không thể khôi phục.</p>
    </Modal>
  );

  return (
    <div className="w-full px-4 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-4 md:mb-6">
          <a onClick={() => navigate('/')} className="text-blue-600 hover:text-blue-800">Trang chủ</a>
          <span className="mx-2">/</span>
          <a onClick={() => navigate(`/facility/${facilityId}`)} className="text-blue-600 hover:text-blue-800">Thông tin cơ sở</a>
          <span className="mx-2">/</span>
          <span>Đặt sân</span>
        </div>
        
        {/* Title and Timer */}
        <div className="flex justify-between items-center mb-4 md:mb-6 flex-wrap gap-2">
          <Title level={2} className="m-0 text-xl md:text-2xl">Đặt sân</Title>
          {currentStep > 0 && (
            <div className="flex items-center">
              <ClockCircleOutlined className="mr-2 text-red-500" />
              <Text className="text-red-500">Thời gian còn lại: {formatTime(timeRemaining)}</Text>
            </div>
          )}
        </div>
        
        {/* Error message */}
        {error && (
          <Alert
            message="Lỗi"
            description={error}
            type="error"
            showIcon
            className="mb-4"
            closable
            onClose={() => setError(null)}
          />
        )}
        
        {/* Steps */}
        <Steps
          current={currentStep}
          items={steps.map(item => ({ key: item.title, title: item.title }))}
          className="mb-6 md:mb-8"
        />
        
        {/* Step Content */}
        <div className="mb-6 md:mb-8 bg-white p-4 md:p-6 rounded-lg shadow-md">
          {steps[currentStep].content}
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button 
            onClick={handlePrev}
            disabled={currentStep === 0}
            icon={<ArrowLeftOutlined />}
          >
            Quay lại
          </Button>
          
          <div className="flex gap-2">
            {bookingId && (
              <Button 
                danger
                onClick={() => setShowCancelModal(true)}
                icon={<CloseCircleOutlined />}
              >
                Hủy đặt sân
              </Button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <Button 
                type="primary" 
                onClick={handleNext}
                loading={loading}
              >
                Tiếp theo <ArrowRightOutlined />
              </Button>
            ) : (
              <Button 
                type="primary" 
                onClick={() => setShowConfirmModal(true)}
                loading={loading}
              >
                Xác nhận đặt sân <CheckCircleOutlined />
              </Button>
            )}
          </div>
        </div>
        
        {/* Confirm Modal */}
        <Modal
          title="Xác nhận đặt sân"
          open={showConfirmModal}
          onOk={handleSubmitBooking}
          onCancel={() => setShowConfirmModal(false)}
          confirmLoading={loading}
          okText="Xác nhận"
          cancelText="Hủy"
        >
          <p>Bạn có chắc chắn muốn đặt sân với thông tin đã chọn?</p>
          <p>Tổng số tiền: <span className="text-blue-600 font-bold">{formatCurrency(calculateTotalPrice())}</span></p>
          {formData.paymentMethod !== 'cash' && (
            <Alert
              message="Lưu ý"
              description="Bạn sẽ được chuyển đến trang thanh toán sau khi xác nhận."
              type="info"
              showIcon
              className="mt-4"
            />
          )}
        </Modal>

        {/* Recurring Modal */}
        <RecurringModal
          visible={showRecurringModal}
          onOk={handleRecurringModalOk}
          onCancel={handleRecurringModalCancel}
          recurringType={recurringType}
          recurrenceFrequency={recurrenceFrequency}
          recurrenceEndType={recurrenceEndType}
          recurrenceEndDate={recurrenceEndDate}
          recurrenceEndOccurrences={recurrenceEndOccurrences}
          additionalWeekdays={additionalWeekdays}
          selectedDates={selectedDates}
          handleRecurringTypeChange={handleRecurringTypeChange}
          handleRecurrenceFrequencyChange={handleRecurrenceFrequencyChange}
          handleRecurrenceEndTypeChange={handleRecurrenceEndTypeChange}
          handleRecurrenceEndDateChange={handleRecurrenceEndDateChange}
          handleRecurrenceEndOccurrencesChange={handleRecurrenceEndOccurrencesChange}
          getWeekdayName={getWeekdayName}
          form={form}
          handleAdditionalWeekdaysChange={setAdditionalWeekdays}
          saveCustomRecurringOption={saveCustomRecurringOption}
          generateRecurringDates={generateRecurringDates}
        />

        {/* Cancel Confirm Modal */}
        {cancelConfirmModal}
      </div>
    </div>
  );
};

export default BookingPage;
