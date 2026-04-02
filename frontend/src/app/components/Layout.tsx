import { Outlet, useLocation, useNavigate } from 'react-router';
import { Home, PlusCircle, BarChart3 } from 'lucide-react';
import { AppProvider } from '../context';

const NAV_ITEMS = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/new-task', icon: PlusCircle, label: 'New Task' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Hide the nav bar if user is doing a focus session 
  const isFocusSession = location.pathname === '/focus';
  if (isFocusSession) return <AppProvider><Outlet /></AppProvider>;

  return (
    <AppProvider>
    <div className="min-h-screen bg-background flex flex-col" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <div className="flex-1 overflow-y-auto pb-24">
        {/* This is where the page content gets injected */}
        <Outlet />
      </div>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-2 py-2 z-50">
        <div className="max-w-md mx-auto flex justify-around items-center">
          {NAV_ITEMS.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                  isActive ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <item.icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                <span className="text-[11px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
    </AppProvider>
  );
}