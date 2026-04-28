import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import MedicinesPage from './pages/medicines/MedicinesPage';
import MedicineDetailPage from './pages/medicines/MedicineDetailPage';
import SchedulesPage from './pages/schedules/SchedulesPage';
import ScheduleDetailPage from './pages/schedules/ScheduleDetailPage';
import MainLogsPage from './pages/logs/MainLogsPage';
import LogsPage from './pages/logs/LogsPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/medicines" element={<MedicinesPage />} />
          <Route path="/medicines/:id" element={<MedicineDetailPage />} />
          <Route path="/medication-schedules" element={<SchedulesPage />} />
          <Route path="/medication-schedules/:id" element={<ScheduleDetailPage />} />
          <Route path="/medication-logs" element={<LogsPage />} />
          <Route path="/medication-logs/main" element={<MainLogsPage />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
