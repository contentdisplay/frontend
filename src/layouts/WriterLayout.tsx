// layouts/WriterLayout.tsx
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  FileText, 
  PenTool, 
  User, 
  LogOut, 
  Menu, 
  Wallet, 
  Bell, 
  Plus 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import NotificationBell from "@/components/notification/NotificationBall";

export default function WriterLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const menuItems = [
    {
      icon: Home,
      label: "Dashboard",
      path: "/writer/dashboard",
    },
    {
      icon: FileText,
      label: "My Articles",
      path: "/writer/articles",
    },
    {
      icon: Wallet,
      label: "Wallet",
      path: "/writer/wallet",
    },
    {
      icon: User,
      label: "Profile",
      path: "/writer/profile",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="mr-4 md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Link to="/writer/dashboard" className="flex items-center">
                <PenTool className="h-6 w-6 text-purple-600 dark:text-purple-400 mr-2" />
                <span className="text-xl font-bold text-purple-600 dark:text-purple-400">ContentHub Writer</span>
              </Link>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-950/30"
                onClick={() => navigate('/writer/articles/create')}
              >
                <Plus className="h-4 w-4 mr-1" />
                New Article
              </Button>
              
              <NotificationBell />
              <ThemeToggle variant="ghost" />
              
              <div className="hidden md:flex items-center">
                <div className="flex flex-col items-end">
                  <span className="font-medium">{user?.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</span>
                </div>
              </div>
              <div className="h-9 w-9 rounded-full overflow-hidden bg-purple-100 dark:bg-purple-800 ring-2 ring-purple-200 dark:ring-purple-700">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user?.name || "User"} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5 m-2 text-purple-600 dark:text-purple-300" />
                )}
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => logout()}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex flex-grow">
        {/* Sidebar */}
        <aside
          className={cn(
            "bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 w-64 fixed md:relative inset-y-0 left-0 transform transition-transform duration-300 ease-in-out z-20 md:translate-x-0 h-[calc(100vh-64px)] md:h-auto",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="py-6 px-4">
            {/* User Profile Card */}
            <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full overflow-hidden bg-purple-100 dark:bg-purple-800 ring-2 ring-purple-200 dark:ring-purple-700">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user?.name || "User"} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-7 w-7 m-2.5 text-purple-600 dark:text-purple-300" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-sm">{user?.name}</h3>
                  <p className="text-xs text-purple-600 dark:text-purple-400 capitalize">Content Writer</p>
                </div>
              </div>
            </div>
            
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <Link 
                  key={item.path} 
                  to={item.path}
                  className={cn(
                    "group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-all",
                    isActive(item.path)
                      ? "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                      : "text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  )}
                >
                  <item.icon 
                    className={cn(
                      "mr-3 h-5 w-5",
                      isActive(item.path) 
                        ? "text-purple-600 dark:text-purple-400" 
                        : "text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400"
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
          "flex-grow p-6 overflow-auto transition-all duration-300",
          !sidebarOpen ? "md:ml-0" : ""
        )}>
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} ContentHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}