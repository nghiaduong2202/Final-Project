import React from 'react';

const PlaySchedule: React.FC = () => {
  return <div>PlaySchedule</div>;
};

export default PlaySchedule;


// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import DatePicker from 'react-datepicker';
// import "react-datepicker/dist/react-datepicker.css";
// import { ICONS } from '@/constants/owner/Content/content';

// interface ContentProps {
//   style?: React.CSSProperties;
// }

// interface Venue {
//   id: number;
//   name: string;
// }

// interface Sport {
//   id: number;
//   name: string;
// }

// const PlaySchedule: React.FC<ContentProps> = () => {
//   const navigate = useNavigate();
  
//   // States for dropdowns
//   const [venues, setVenues] = useState<Venue[]>([]);
//   const [sports, setSports] = useState<Sport[]>([]);
//   const [selectedVenue, setSelectedVenue] = useState<number | null>(null);
//   const [selectedSport, setSelectedSport] = useState<number | null>(null);

//   // States for search and date
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedDate, setSelectedDate] = useState(new Date());

//   // Time slots from 6:00 AM to 22:00 PM with 30-minute intervals
//   const timeSlots = Array.from({ length: 38 }, (_, i) => {
//     const hour = Math.floor(i / 2) + 4;
//     const minute = i % 2 === 0 ? '00' : '30';
//     return `${hour.toString().padStart(2, '0')}:${minute}`;
//   });

//   // Handlers for API calls (to be implemented)
//   const fetchVenues = async () => {
//     // TODO: Implement API call
//     setVenues([{ id: 1, name: 'Sân cầu lông Phạm Kha' }]);
//   };

//   const fetchSports = async () => {
//     // TODO: Implement API call
//     setSports([{ id: 1, name: 'Cầu lông' }]);
//   };

//   const handleSearch = (query: string) => {
//     setSearchQuery(query);
//     // TODO: Implement search logic
//   };

//   const handleTodayClick = () => {
//     setSelectedDate(new Date());
//   };

//   const handleBooking = () => {
//     // TODO: Navigate to booking page
//     navigate('/booking');
//   };

//   useEffect(() => {
//     fetchVenues();
//     fetchSports();
//   }, []);

//   return (
//     <div className="flex flex-col min-w-[320px] w-full bg-[#f5f6fa]">
//       <div className="px-5 py-8 flex-grow">
//         {/* Section 1: Dropdowns and Booking Button */}
//         <div className="flex justify-between flex-wrap items-start gap-4 mb-8">
//           <div className="flex flex-col gap-3.5 flex-grow max-w-[450px]">
//             {/* Cơ sở hoạt động */}
//             <div className="relative">
//               <select 
//                 className="w-full h-10 px-5 py-1 border-2 border-black/70 rounded-[15px] font-roboto text-base bg-white text-gray-700 font-medium appearance-none cursor-pointer hover:border-black focus:border-black focus:outline-none [&>*]:rounded-[10px]"
//                 onChange={(e) => setSelectedVenue(Number(e.target.value))}
//               >
//                 <option value="" className="text-gray-500">Chọn cơ sở hoạt động</option>
//                 {venues.map(venue => (
//                   <option key={venue.id} value={venue.id} className="text-black">{venue.name}</option>
//                 ))}
//               </select>
//               <img
//                 src={ICONS.DROP_DOWN}
//                 alt="dropdown" 
//                 className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none rotate-180"
//               />
//             </div>            
//             {/* Môn thể thao */}
//             <div className="relative">
//               <select 
//                 className="w-full h-10 px-5 py-1 border-2 border-black/70 rounded-[15px] font-roboto text-base bg-white text-gray-700 font-medium appearance-none cursor-pointer hover:border-black focus:border-black focus:outline-none"
//                 onChange={(e) => setSelectedSport(Number(e.target.value))}
//               >
//                 <option value="" className="text-gray-500">Chọn môn thể thao</option>
//                 {sports.map(sport => (
//                   <option key={sport.id} value={sport.id} className="text-black">{sport.name}</option>
//                 ))}
//               </select>
//               <img
//                 src={ICONS.DROP_DOWN}
//                 alt="dropdown"
//                 className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none rotate-180"
//               />
//             </div>
//           </div>
          
//           {/* Đặt sân */}
//           <button 
//             onClick={handleBooking}
//             className="px-4.5 py-2 bg-[#197dfe] text-white rounded font-roboto text-lg font-bold tracking-wider cursor-pointer mr-8 hover:bg-[#197dfe]/80"
//           >
//             Đặt sân
//           </button>
//         </div>

//         {/* Section 2: Search, Today Button, and DatePicker */}
//         <div className="flex flex-wrap items-center gap-4 mb-5">
//           <div className="relative flex-grow max-w-[450px]">
//             <input 
//               type="text" 
//               value={searchQuery}
//               onChange={(e) => handleSearch(e.target.value)}
//               placeholder="Tìm kiếm tên người chơi"
//               className="w-full h-[40px] px-[18px] border border-[#d5d5d5] rounded-[19px] font-nunito text-base" 
//             />
//             <img 
//               src={ICONS.SEARCH} 
//               alt="Search"
//               className="w-[22px] h-[22px] absolute right-[18px] top-1/2 -translate-y-1/2" 
//             />
//           </div>

//           {/* Hôm nay */}
//           <button 
//             onClick={handleTodayClick}
//             className="w-[110px] h-10 bg-white border border-black font-roboto text-base cursor-pointer rounded-[15px] hover:bg-gray-100"
//           >
//             Hôm nay
//           </button>

//           {/* DatePicker */}
//           <div className="relative max-w-[270px] bg-white">
//             <div className="flex items-center border border-black rounded-[15px] h-[40px] px-3">
//               <img
//                 src={ICONS.DROP_DOWN} 
//                 alt="Previous day"
//                 className="w-[13px] h-[8px] cursor-pointer -rotate-90"
//                 onClick={() => {
//                   const prevDay = new Date(selectedDate);
//                   prevDay.setDate(prevDay.getDate() - 1);
//                   setSelectedDate(prevDay);
//                 }}
//               />
//               <div className="flex items-center justify-center">
//                 <DatePicker
//                   selected={selectedDate}
//                   onChange={(date: Date | null) => date && setSelectedDate(date)}
//                   dateFormat="dd/MM/yyyy"
//                   className="max-w-[100px] text-center border-none focus:outline-none justify-center"
//                 />
//                 <img
//                   src={ICONS.DATE_PICKER}
//                   alt="Date picker"
//                   className="w-[20px] h-[20px] cursor-pointer mr-2.5"
//                   onClick={() => {
//                     const datePickerInput = document.querySelector('.react-datepicker__input-container input');
//                     if (datePickerInput) {
//                       (datePickerInput as HTMLElement).click();
//                     }
//                   }}
//                 />
//               </div>
//               <img
//                   src={ICONS.DROP_DOWN}
//                   alt="Next day" 
//                   className="w-[13px] h-[8px] cursor-pointer rotate-90"
//                   onClick={() => {
//                     const nextDay = new Date(selectedDate);
//                     nextDay.setDate(nextDay.getDate() + 1);
//                     setSelectedDate(nextDay);
//                   }}
//                 />
              
//             </div>
//           </div>
//         </div>

//         {/* History Link */}
//         <div className="flex justify-end mb-5 mr-8">
//           <a 
//             href="/history-booking" 
//             className="font-roboto text-sm font-bold text-[#f90000] underline cursor-pointer"
//           >
//             Lịch sử đặt sân
//           </a>
//         </div>

//         {/* Calendar/Schedule Grid */}
//         <div className="bg-white rounded-[20px] p-5 overflow-x-auto mr-3 w-full">
//           <div className="sticky top-0 bg-white z-10">
//             <div className="flex border-b border-[#e1e1e1]">
//               <div className="w-[91px] h-[38px] flex items-center justify-center font-roboto text-sm font-medium border-r border-[#e1e1e1]">
//                 Thời gian/Sân
//               </div>
//               {[1, 2, 3, 4, 5, 6, 7].map(court => (
//                 <div key={court} className="w-[150px] h-[38px] font-semibold flex items-center justify-center border-r border-[#e1e1e1]">
//                   <div className="flex items-center gap-[5px]">
//                     <div className="w-2.5 h-2.5 bg-[#20b202] rounded-full"></div>
//                     <span>Sân {court}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="time-slots max-h-[600px] overflow-y-auto">
//             {timeSlots.map((time, index) => (
//               <div key={index} className="flex border-b border-[#e1e1e1]">
//                 <div className="w-[91px] h-[38px] flex items-center justify-center font-roboto text-sm border-r border-[#e1e1e1]">
//                   {time}
//                 </div>
//                 {[1, 2, 3, 4, 5, 6, 7].map(court => (
//                   <div 
//                     key={`${time}-${court}`} 
//                     className="w-[150px] h-[38px] flex items-center justify-center border-r border-[#e1e1e1] cursor-pointer hover:bg-gray-100"
//                   />
//                 ))}
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PlaySchedule;

