import { Routes, Route } from 'react-router-dom';
import { PlayerLayout } from './layouts/PlayerLayout';
import { OwnerLayout } from './layouts/OwnerLayout';
import { PublicLayout } from './layouts/PublicLayout';

import ProtectedRoute from '@/components/LoginModal/ProtectedRoute';

// Public pages
import ErrorPage from '@/pages/Public/Error';
import HomePage from '@/pages/Public/Home';
import UserProfile from '@/pages/Public/UserProfile';
import DetailFacility from '@/pages/Public/DetailFacility';
import ResultSearch from '@/pages/Public/ResultSearch';
import HelpCenter from '@/pages/Public/Help-center/HelpCenter';
import FAQ from '@/pages/Public/Help-center/FAQ';
import ContactSupport from '@/pages/Public/Help-center/ContactSupport';
import EventList from '@/pages/Public/EventAndTournament/EventList';
import EventDetail from '@/pages/Public/EventAndTournament/EventDetail';
import PlaymateList from '@/pages/Public/PLaymate/PlaymateList';
import PlaymateDetail from '@/pages/Public/PLaymate/PlaymateDetail';

// Player pages
import BookingPage from '@/pages/Player/Booking/Booking';
import HistoryBooking from '@/pages/Player/HistoryBooking/HistoryBooking';
import BookingDetail from '@/pages/Player/BookingDetail/BookingDetail';
import BookingReview from '@/pages/Player/BookingReview/BookingReview';
import FavoriteList from '@/pages/Player/FavoriteList/FavoriteList';
import ResultBookingVNPay from '@/pages/Player/Booking/ResultBookingVNPay';
import PlaymateCreate from '@/pages/Player/Playmate/PlaymateCreate';
import PlaymateManage from '@/pages/Player/Playmate/PlaymateManage';
import EventParticipate from '@/pages/Player/EventParticipate/EventParticipate';
import ResultBookingbyPoint from '@/pages/Player/Booking/ResultBookingbyPoint';

// Owner pages
import PlaySchedule from '@/pages/Owner/PlaySchedule/PlaySchedule';
import Dashboard from '@/pages/Owner/Dashboard/Dashboard';
import SupportContact from '@/pages/Owner/SupportContact/SupportContact';

import FacilityManagement from '@/pages/Owner/FacilityManagement/FacilityManagement';
import CreateFacility from '@/pages/Owner/FacilityManagement/CreateFacility/CreateFacility';

import FieldGroupManagement from '@/pages/Owner/FieldManagement/FieldGroupManagement';
import CreateFieldGroup from '@/pages/Owner/FieldManagement/CreateFieldGroup/CreateFieldGroup';

import ServiceManagement from '@/pages/Owner/ServiceManagement/ServiceManagement';
import CreateService from '@/pages/Owner/ServiceManagement/CreateService';

import VoucherManagement from '@/pages/Owner/VoucherManagement/VoucherManagement';
import CreateVoucher from '@/pages/Owner/VoucherManagement/CreateVoucher';

import EventManagement from '@/pages/Owner/EventManagement/EventManagement';
import CreateEvent from '@/pages/Owner/EventManagement/CreateEvent';

import Banking from '@/pages/Owner/Banking/Banking';

import ChatManagement from '@/pages/Owner/ChatManagement/ChatManagement';

import ReportManagement from '@/pages/Owner/ReportManagement/ReportManagement';

import ReviewManagement from '@/pages/Owner/ReviewManagement/ReviewManagement';


const AppRouter: React.FC = () => {

  return (
    <Routes>
      {/* public routes */}
      <Route element={<PublicLayout />}>
        <Route path='/' element={<HomePage />} />
        <Route path='/facility/:facilityId' element={<DetailFacility />} />
        <Route path='/result-search' element={<ResultSearch />} />
        <Route path='/help-center' element={<HelpCenter />} />
        <Route path='/faq' element={<FAQ />} />
        <Route path='/contact-support' element={<ContactSupport />} />
        <Route path='/events' element={<EventList />} />
        <Route path='/event/:eventId' element={<EventDetail />} />
        <Route path='/error' element={<ErrorPage />} />
        <Route path='/user/playmate' element={<PlaymateList />} />   
        <Route path='/user/playmate/:id' element={<PlaymateDetail />} />   
      </Route> 

      {/* player routes */}
      <Route element={
        <ProtectedRoute requiredRole="player">
          <PlayerLayout />
        </ProtectedRoute>
      }>
        <Route path='/user/booking/:facilityId' element={<BookingPage />} />
        <Route path='/user/booking/result-booking-vnpay' element={<ResultBookingVNPay />} />
        <Route path='/user/booking/result-booking-by-point' element={<ResultBookingbyPoint />} />
        <Route path='/user/history-booking' element={<HistoryBooking />} />
        <Route path='/user/booking/detail/:bookingId' element={<BookingDetail />} />
        <Route path='/user/booking/review/:bookingId' element={<BookingReview />} />
        <Route path='/user/favorite' element={<FavoriteList />} />          
        <Route path='/user/playmate/create' element={<PlaymateCreate />} />   
        <Route path='/user/playmate/manage' element={<PlaymateManage />} />         
        <Route path='/user/profile' element={<UserProfile />} />
        <Route path='/user/events/manage' element={<EventParticipate />} />
      </Route>

      {/* owner routes */}
      <Route element={
        <ProtectedRoute requiredRole="owner">
          <OwnerLayout />
        </ProtectedRoute>
      }>
        <Route path='/owner/play-schedule' element={<PlaySchedule />} />
        <Route path='/owner' element={<Dashboard />} />

        <Route path='/owner/facility-management' element={<FacilityManagement />} />
        <Route path='/owner/create-facility' element={<CreateFacility />} />           

        <Route path='/owner/field-group-management' element={<FieldGroupManagement />} />
        <Route path='/owner/create-field-group' element={<CreateFieldGroup />} />        

        <Route path='/owner/service-management' element={<ServiceManagement />} />
        <Route path='/owner/create-service' element={<CreateService />} />

        <Route path='/owner/voucher-management' element={<VoucherManagement />} />
        <Route path='/owner/create-voucher' element={<CreateVoucher />} />

        <Route path='/owner/event-management' element={<EventManagement />} />
        <Route path='/owner/create-event' element={<CreateEvent />} />  

        <Route path='/owner/review-management' element={<ReviewManagement />} />  

        <Route path='/owner/banking' element={<Banking />} />

        <Route path='/owner/chat' element={<ChatManagement />} />
        <Route path='/owner/contact-support' element={<SupportContact />} />

        <Route path='/owner/report-management' element={<ReportManagement />} />           
                
        <Route path='/owner/profile' element={<UserProfile />} />
      </Route>

      {/* Fallback Route */}
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
};

export default AppRouter;
