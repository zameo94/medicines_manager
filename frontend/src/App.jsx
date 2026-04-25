import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import MedicinesPage from './pages/MedicinesPage';
import MedicineDetailPage from './pages/MedicineDetailPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/medicines" element={<MedicinesPage />} />
          <Route path="/medicines/:id" element={<MedicineDetailPage />} />
          <Route path="/schedules" element={<MedicinesPage />} />
          <Route path="/logs" element={<MedicinesPage />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;