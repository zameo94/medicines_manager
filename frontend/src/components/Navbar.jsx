import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-blue-600 text-white shadow-lg shadow-blue-100 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Link 
              to="/" 
              className={`p-2 rounded-xl transition-all ${isActive('/') ? 'bg-white text-blue-600' : 'bg-white/20 text-white hover:bg-white/30'}`}
              title="Home"
            >
              <HomeIcon />
            </Link>
            <Link 
              to="/medication-logs/main" 
              className={`p-2 rounded-xl transition-all ${isActive('/medication-logs/main') ? 'bg-white text-blue-600' : 'bg-white/20 text-white hover:bg-white/30'}`}
              title="Registro Farmaci"
            >
              <DashboardIcon />
            </Link>
            <span className="font-black tracking-tighter text-xl hidden sm:block ml-2 uppercase">Medicine Manager</span>
          </div>

          <div className="flex gap-1 sm:gap-4">
            <NavLink to="/medicines" active={isActive('/medicines')}>Medicine</NavLink>
            <NavLink to="/medication-schedules" active={isActive('/medication-schedules')}>Orari</NavLink>
            <NavLink to="/medication-logs" active={isActive('/medication-logs')}>Storico</NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, children, active }) => (
  <Link 
    to={to} 
    className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${
      active 
        ? 'bg-white text-blue-600 shadow-sm' 
        : 'text-blue-100 hover:bg-white/10 hover:text-white'
    }`}
  >
    {children}
  </Link>
);

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M11.47 3.84a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.06l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 0 0 1.061 1.06l8.69-8.69Z" />
    <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75v4.5a.75.75 0 0 1-.75.75H5.125A1.875 1.875 0 0 1 3.25 19.875v-6.134a4.563 4.563 0 0 1 .1-.306l8.15-8.153Z" />
  </svg>
);

const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M2.625 6.75a1.125 1.125 0 0 1 1.125-1.125h12.75a1.125 1.125 0 0 1 1.125 1.125v12.75A1.125 1.125 0 0 1 16.5 20.625H3.75a1.125 1.125 0 0 1-1.125-1.125V6.75ZM22.5 4.875c0-.621-.504-1.125-1.125-1.125h-5.25a.75.75 0 0 0 0 1.5h5.25c.207 0 .375.168.375.375v5.25a.75.75 0 0 0 1.5 0v-5.25Zm0 14.25c0 .621-.504 1.125-1.125 1.125h-5.25a.75.75 0 0 1 0-1.5h5.25a.375.375 0 0 0 .375-.375v-5.25a.75.75 0 0 1 1.5 0v5.25Z" clipRule="evenodd" />
    <path d="M5.25 9a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5H6a.75.75 0 0 1-.75-.75Zm0 3.75a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5H6a.75.75 0 0 1-.75-.75Zm0 3.75a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5H6a.75.75 0 0 1-.75-.75Z" />
  </svg>
);

export default Navbar;
