import LogoIcon from '@/assets/Logo.svg'
import { useNavigate } from 'react-router-dom'
import { PhoneOutlined, MailOutlined, EnvironmentOutlined, FacebookOutlined, InstagramOutlined, YoutubeOutlined } from '@ant-design/icons'
import LogoBCT from '@/assets/images.png'

const Footer = () => {
  const navigate = useNavigate()

  const handleNavigateHome = () => {
    navigate('/')
  }

  return (
    <footer className="bg-[#2C3E50] text-white">
      {/* Main footer content */}
      <div className="w-full px-4 pt-10 pb-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <img 
              src={LogoIcon} 
              alt="HI5PORT" 
              className="w-44 md:w-56 h-auto cursor-pointer mb-6" 
              onClick={handleNavigateHome} 
            />
            <div className="space-y-3 text-sm">
              <p className="flex items-start">
                <EnvironmentOutlined className="text-lg mr-2 mt-1" />
                <span>A3.11 Block A Tòa nhà Sky Center 5B Phổ Quang, Phường 2, Quận Tân Bình, Thành phố Hồ Chí Minh, Việt Nam</span>
              </p>
              <p className="flex items-center">
                <PhoneOutlined className="text-lg mr-2" />
                <a href="tel:0904438369" className="hover:text-blue-300">0904438369</a>
              </p>
              <p className="flex items-center">
                <MailOutlined className="text-lg mr-2" />
                <a href="mailto:info@vietcas.vn" className="hover:text-blue-300">info@vietcas.vn</a>
              </p>
              <div className="flex space-x-4 pt-2">
                <a href="#" className="hover:text-blue-400 text-xl">
                  <FacebookOutlined />
                </a>
                <a href="#" className="hover:text-pink-400 text-xl">
                  <InstagramOutlined />
                </a>
                <a href="#" className="hover:text-red-500 text-xl">
                  <YoutubeOutlined />
                </a>
              </div>
            </div>
          </div>

          {/* Rules & Policies */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quy định và chính sách</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-blue-300">Hướng dẫn sử dụng</a></li>
              <li><a href="#" className="hover:text-blue-300">Quy chế Hoạt động ứng dụng</a></li>
              <li><a href="#" className="hover:text-blue-300">Thông tin về thanh toán</a></li>
              <li><a href="#" className="hover:text-blue-300">Chính sách bảo mật thông tin cá nhân</a></li>
              <li><a href="#" className="hover:text-blue-300">Thông tin chăm sóc khách hàng</a></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-blue-300">Trang chủ</a></li>
              <li><a href="#" className="hover:text-blue-300">Danh cho đối tác</a></li>
              <li><a href="#" className="hover:text-blue-300">Tin tức</a></li>
              <li><a href="#" className="hover:text-blue-300">Về chúng tôi</a></li>
              <li><a href="#" className="hover:text-blue-300">Liên hệ</a></li>
            </ul>
          </div>

          {/* Registration */}
          <div>
            <h3 className="text-lg font-bold mb-4">Đã đăng ký</h3>
            <img 
              src={LogoBCT} 
              alt="Đã đăng ký Bộ Công Thương" 
              className="w-40 h-auto"
            />
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto border-t border-white-500">
        <div className="w-full px-4 py-4">
          <p className="text-center text-xs text-gray-400">
            Copyright © 2023 – <span className="text-red-500 font-semibold">Hi5port</span>. All rights reserved. Designed by <a href="https://aegona.com" className="text-blue-400 hover:underline">Aegona</a>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer