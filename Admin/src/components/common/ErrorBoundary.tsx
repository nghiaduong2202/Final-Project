import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button } from 'antd';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Cập nhật state để hiển thị UI dự phòng trong lần render tiếp theo
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Bạn có thể log lỗi vào dịch vụ báo cáo lỗi ở đây
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Nếu có fallback được cung cấp, sử dụng nó
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Mặc định fallback UI
      return (
        <Result
          status="error"
          title="Đã xảy ra lỗi"
          subTitle={this.state.error?.message || 'Một lỗi không mong muốn đã xảy ra.'}
          extra={[
            <Button type="primary" key="refresh" onClick={() => window.location.reload()}>
              Tải lại trang
            </Button>,
          ]}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;