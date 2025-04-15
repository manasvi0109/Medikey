import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { MediKeyLogo } from "@/assets/icons/MediKeyLogo";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FolderClosed,
  BarChart2,
  Users,
  Calendar,
  Bot,
  AlertTriangle,
  Menu,
  X,
  Bell,
  Settings,
  LogOut,
  Smartphone
} from "lucide-react";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();

  // Close menu when location changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Prevent body scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const navItems = [
    {
      href: "/dashboard",
      icon: <LayoutDashboard size={18} />,
      label: "Dashboard",
    },
    {
      href: "/records",
      icon: <FolderClosed size={18} />,
      label: "My Records",
    },
    {
      href: "/analytics",
      icon: <BarChart2 size={18} />,
      label: "Health Analytics",
    },
    {
      href: "/family",
      icon: <Users size={18} />,
      label: "Family Vault",
    },
    {
      href: "/appointments",
      icon: <Calendar size={18} />,
      label: "Appointments",
    },
    {
      href: "/assistant",
      icon: <Bot size={18} />,
      label: "AI Assistant",
    },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed inset-x-0 top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="p-1 mr-2 rounded-md"
              onClick={() => setIsOpen(true)}
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </Button>
            <div className="flex items-center">
              <MediKeyLogo className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-lg font-semibold text-gray-800">MediKey</span>
            </div>
          </div>
          <div className="flex items-center">
            <Button variant="ghost" size="sm" className="p-1 rounded-full mr-2">
              <Bell className="h-5 w-5 text-gray-600" />
            </Button>
            <Avatar>
              <AvatarImage src="" alt={user?.username} />
              <AvatarFallback className="bg-primary-100 text-primary-800">
                {user?.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-gray-900 bg-opacity-50 z-20 md:hidden transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Menu */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-30 md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 border-b border-gray-200 px-4">
            <div className="flex items-center">
              <MediKeyLogo className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-lg font-semibold text-gray-800">MediKey</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="p-1 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5 text-gray-600" />
            </Button>
          </div>

          <nav className="flex-1 px-2 py-4 overflow-y-auto">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <a
                    className={cn(
                      "flex items-center px-4 py-2 text-sm font-medium rounded-md",
                      location === item.href
                        ? "text-primary-600 bg-primary-50"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <span
                      className={cn(
                        "mr-3",
                        location === item.href ? "text-primary-600" : "text-gray-500"
                      )}
                    >
                      {item.icon}
                    </span>
                    {item.label}
                  </a>
                </Link>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Emergency Access
              </h3>
              <div className="mt-2 bg-red-50 dark:bg-red-900/20 rounded-md p-3">
                <Link href="/emergency">
                  <a className="flex items-center text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                    <AlertTriangle className="mr-3 h-4 w-4 text-red-600 dark:text-red-400" />
                    Emergency Mode
                  </a>
                </Link>
                <p className="mt-1 text-xs text-red-500 dark:text-red-400">Instant access to vital information</p>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Mobile Access
              </h3>
              <div className="mt-2 bg-primary-50 dark:bg-primary-900/20 rounded-md p-3">
                <Link href="/mobile-access">
                  <a className="flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                    <Smartphone className="mr-3 h-4 w-4 text-primary-600 dark:text-primary-400" />
                    Access on Phone
                  </a>
                </Link>
                <p className="mt-1 text-xs text-primary-500 dark:text-primary-400">Scan QR code to use MediKey on your phone</p>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-gray-200 mx-2">
              <div className="flex items-center px-2">
                <Avatar>
                  <AvatarImage src="" alt={user?.username} />
                  <AvatarFallback className="bg-primary-100 text-primary-800">
                    {user?.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-800">{user?.username}</p>
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <Link href="/profile">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </Link>
                <Button variant="outline" size="sm" className="flex-1" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </Button>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
