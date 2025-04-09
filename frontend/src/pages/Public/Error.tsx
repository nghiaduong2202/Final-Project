import { useNavigate } from "react-router-dom";
import { Button, Result } from "antd";
import { motion } from "framer-motion";

const ErrorPage = () => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col justify-center items-center px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl"
      >
        <Result
          status="404"
          title={
            <motion.h1 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="text-3xl md:text-4xl font-bold text-gray-800"
            >
              Không tìm thấy trang
            </motion.h1>
          }
          subTitle={
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="text-gray-600 mt-2 text-base md:text-lg"
            >
              Chúng tôi không thể tìm thấy trang bạn đang tìm kiếm. Trang có thể đã bị xóa, di chuyển hoặc chưa tồn tại.
            </motion.p>
          }
          extra={
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.6 }}
              className="mt-6"
            >
              <Button 
                type="primary" 
                size="large"
                onClick={handleNavigate}
                className="bg-blue-500 hover:bg-blue-600 border-none shadow-lg hover:shadow-xl transition-all duration-300 h-12 px-8"
              >
                Trở về trang chủ
              </Button>
            </motion.div>
          }
        />
      </motion.div>
    </div>
  );
};

export default ErrorPage;
