import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Owner/Sidebar';
import Topbar from '@/components/Owner/Topbar';
import Footer from '@/components/Owner/Footer';
import { useAppSelector } from '@/hooks/reduxHooks';
import { MenuOutlined } from '@ant-design/icons';
import { Drawer, Button } from 'antd';

// Loading component
const Loading = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
  </div>
);

// Breakpoints
const MOBILE_BREAKPOINT = 769;
const TABLET_BREAKPOINT = 1100;

export const OwnerLayout: React.FC = () => {
  const { isLoading } = useAppSelector(state => state.user);
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const [mobileView, setMobileView] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Check if screen requires auto-collapsed sidebar
  const checkScreenSize = useCallback(() => {
    const width = window.innerWidth;
    return width < TABLET_BREAKPOINT;
  }, []);

  // Handle window resize
  const handleResize = useCallback(() => {
    const width = window.innerWidth;
    const isMobile = width < MOBILE_BREAKPOINT;
    const isSmall = width < TABLET_BREAKPOINT;
    
    setMobileView(isMobile);
    setIsSmallScreen(isSmall);

    // Auto collapse on small screens
    if (isSmall && !sidebarCollapsed) {
      setSidebarCollapsed(true);
    }
  }, [sidebarCollapsed]);

  // Set up resize listener
  useEffect(() => {
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Toggle sidebar handler
  const handleToggleSidebar = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
    
    // If we're trying to expand on a small screen, keep it collapsed
    if (!collapsed && isSmallScreen) {
      setSidebarCollapsed(true);
    }
  };

  // Show loading while authentication is being checked
  if (isLoading) {
    return <Loading />;
  }

  return (
    <Suspense fallback={<Loading />}>
      <div className="flex h-screen overflow-hidden bg-[#f5f6fa]">
        {/* Mobile menu button - visible only on small screens */}
        {mobileView && (
          <div className="fixed top-4 left-4 z-[1001]">
            <Button 
              type="primary" 
              icon={<MenuOutlined />} 
              onClick={() => setDrawerVisible(true)}
              className="flex items-center justify-center shadow-md"
            />
          </div>
        )}

        {/* Sidebar for desktop - using flex not fixed position */}
        {!mobileView && (
          <div className={`flex-shrink-0 h-full shadow-md sidebar-transition z-[1000] ${
            sidebarCollapsed ? 'w-20' : 'w-60'
          }`}>
            <Sidebar 
              onToggle={handleToggleSidebar}
              autoCollapsed={checkScreenSize()}
            />
          </div>
        )}

        {/* Drawer sidebar for mobile */}
        {mobileView && (
          <Drawer
            placement="left"
            closable={true}
            onClose={() => setDrawerVisible(false)}
            open={drawerVisible}
            width={240}
            styles={{ body: { padding: 0 } }}
            zIndex={1002}
          >
            <Sidebar 
              onToggle={(collapsed) => {
                setSidebarCollapsed(collapsed);
                if (!collapsed) setDrawerVisible(false);
              }}
              isMobile={true}
            />
          </Drawer>
        )}

        {/* Main content area - using flex-grow */}
        <div className="flex-grow flex flex-col overflow-hidden owner-layout-transition">
          {/* Topbar */}
          <div className="sticky top-0 z-[999] w-full bg-white shadow-sm">
            <Topbar />
          </div>
          
          {/* Main content with scrolling */}
          <div className="flex-1 overflow-auto">
            <main className="p-3 sm:p-4">
              <div className="min-h-[calc(100vh-160px)] overflow-x-auto">
                <Outlet />
              </div>
            </main>
            
            {/* Footer */}
            <Footer />
          </div>
        </div>
      </div>
    </Suspense>
  );
};