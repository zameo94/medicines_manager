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
    <path d="M12.75 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM7.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM8.25 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM9.75 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM10.5 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM12.75 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM14.25 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" />
    <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3a.75.75 0 0 1 1.5 0v1.5h.75a3 3 0 0 1 3 3v12.75a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3h.75V3a.75.75 0 0 1 .75-.75Zm13.5 9h-16.5v9a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-9Z" clipRule="evenodd" />
  </svg>
);

export default Navbar;
