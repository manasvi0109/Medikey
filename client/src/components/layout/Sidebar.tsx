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
  Settings,
  LogOut
} from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

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
    <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <div className="flex items-center">
          <MediKeyLogo className="h-8 w-8 text-primary-600" />
          <span className="ml-2 text-lg font-semibold text-gray-800">MediKey</span>
        </div>
      </div>
      
      {/* Navigation */}
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
          <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Emergency Access
          </h3>
          <div className="mt-2 bg-red-50 rounded-md p-3">
            <Link href="/emergency">
              <a className="flex items-center text-sm font-medium text-red-600 hover:text-red-700">
                <AlertTriangle className="mr-3 h-4 w-4 text-red-600" />
                Emergency Mode
              </a>
            </Link>
            <p className="mt-1 text-xs text-red-500">Instant access to vital information for emergency personnel</p>
          </div>
        </div>
      </nav>
      
      {/* User Profile */}
      <div className="flex items-center p-4 border-t border-gray-200">
        <Avatar>
          <AvatarImage src="" alt={user?.username} />
          <AvatarFallback className="bg-primary-100 text-primary-800">
            {user?.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="ml-3 flex-1 overflow-hidden">
          <p className="text-sm font-medium text-gray-800 truncate">{user?.username}</p>
          <Button variant="ghost" size="sm" className="h-8 px-1 text-xs text-gray-500" onClick={logout}>
            <LogOut className="h-3 w-3 mr-1" /> Sign out
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
          <Settings className="h-4 w-4 text-gray-500" />
        </Button>
      </div>
    </aside>
  );
}
