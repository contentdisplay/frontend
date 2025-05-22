import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Bell, 
  Award,
  User, 
  LogOut, 
  Menu,
  Wallet,
  X,
  TicketSlash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Changed to false for mobile

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/admin/dashboard",
    },
    {
      icon: LayoutDashboard,
      label: "Manage User Dashboard",
      path: "/admin/userdashboard",
    },
    {
      icon: Users,
      label: "Users",
      path: "/admin/users",
    },
    {
      icon: FileText,
      label: "Manage Articles",
      path: "/admin/content",
    },
    {
      icon: FileText,
      label: "Pending Articles",
      path: "/admin/approvals",
    },
    {
      icon: Award,
      label: "Promotions",
      path: "/admin/promotions",
    },
    {
      icon: TicketSlash,
      label: "Promocodes",
      path: "/admin/promocodes",
    },
    {
      icon: Bell,
      label: "Notifications",
      path: "/admin/notifications",
    },
    {
      icon: User,
      label: "Profile",
      path: "/admin/profile",
    },
    {
      icon: Wallet,
      label: "Manage Wallet & QR",
      path: "/admin/wallet-qr",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="lg:hidden"
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              <Link to="/admin/dashboard" className="flex items-center">
                <span className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400 truncate">
                  WritelyRewarded
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <ThemeToggle variant="ghost" />
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-600 dark:text-gray-300"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
              </Button>
              <div className="hidden sm:flex items-center gap-2">
                <div className="flex flex-col items-end">
                  <span className="font-medium text-sm truncate max-w-[120px]">
                    {user?.name || user?.username}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {user?.role}
                  </span>
                </div>
              </div>
              <div className="h-8 w-8 rounded-full overflow-hidden bg-blue-100 dark:bg-blue-900">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user?.name || "Admin"} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-6 w-6 m-1 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => logout()}
                className="text-gray-600 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                aria-label="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex flex-grow pt-16"> {/* Added pt-16 to account for fixed header */}
        {/* Sidebar */}
        <aside
          className={cn(
            "bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 w-64 fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out z-20 lg:relative lg:translate-x-0 h-screen",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="py-6 px-4 h-full overflow-y-auto">
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <Link 
                  key={item.path} 
                  to={item.path}
                  onClick={() => setSidebarOpen(false)} // Close sidebar on mobile after click
                  className={cn(
                    "group flex items-center px-2 py-3 text-sm font-medium rounded-md",
                    isActive(item.path)
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  )}
                >
                  <item.icon 
                    className={cn(
                      "mr-3 h-5 w-5",
                      isActive(item.path) ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                    )}
                  />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className={cn(
          "flex-grow p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white overflow-auto",
          sidebarOpen ? "lg:ml-64" : "lg:ml-0"
        )}>
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Admin Control Panel. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-10"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
}