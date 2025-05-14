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
  Plus,
  X 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { NotificationBell } from "@/components/notification";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export default function WriterLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <div className="min-h-screen bg-purple-50/50 dark:bg-gray-950 flex flex-col">
      {/* Header */}
      <header 
        className={cn(
          "bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 transition-shadow duration-200",
          isScrolled && "shadow-sm"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Mobile Menu Button */}
            <div className="flex items-center">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon" className="mr-2">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between border-b p-4">
                      <div className="flex items-center gap-2">
                        <PenTool className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-500 text-transparent bg-clip-text">WriterlyRewarded</span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                    
                    {/* User Profile Card (Mobile) */}
                    <div className="p-4 border-b">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12 border-2 border-purple-200 dark:border-purple-700">
                          {user?.avatar ? (
                            <AvatarImage src={user.avatar} alt={user?.name || "User"} />
                          ) : (
                            <AvatarFallback className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                              {user?.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{user?.name}</h3>
                          <p className="text-xs text-purple-600 dark:text-purple-400 capitalize">Content Writer</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-4 px-2">
                      {menuItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-3 rounded-md transition-colors mb-1",
                            isActive(item.path)
                              ? "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </div>
                    
                    <div className="p-4 mt-4">
                      <Button 
                        variant="outline" 
                        className="w-full bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800 dark:hover:bg-purple-900/50"
                        onClick={() => {
                          navigate('/writer/articles/create');
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        New Article
                      </Button>
                    </div>
                    
                    <div className="mt-auto">
                      <Separator />
                      <div className="p-4">
                        <Button 
                          variant="outline" 
                          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-900/50"
                          onClick={logout}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              
              {/* Desktop Logo */}
              <Link to="/writer/dashboard" className="hidden md:flex items-center">
                <PenTool className="h-6 w-6 text-purple-600 dark:text-purple-400 mr-2" />
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-500 text-transparent bg-clip-text">WriterlyRewarded</span>
              </Link>
              
              {/* Mobile Logo */}
              <Link to="/writer/dashboard" className="md:hidden flex items-center">
                <PenTool className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-1" />
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-500 text-transparent bg-clip-text">WriterlyRewarded</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive(item.path)
                      ? "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              ))}
              
              <Button 
                variant="outline" 
                className="ml-2 bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800 dark:hover:bg-purple-900/50"
                onClick={() => navigate('/writer/articles/create')}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Article
              </Button>
            </nav>
            
            {/* User Menu */}
            <div className="flex items-center gap-2">
              <ThemeToggle variant="ghost" />
              <NotificationBell />
              
              <div className="hidden md:flex items-center">
                <Avatar className="h-8 w-8 border border-gray-200 dark:border-gray-700">
                  {user?.avatar ? (
                    <AvatarImage src={user.avatar} alt={user?.name || "User"} />
                  ) : (
                    <AvatarFallback className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                      {user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={logout}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                aria-label="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-4">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} ContentHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}