import { useState, useEffect } from 'react';

export const LogItem = ({ schedule, onToggle, isSaving = false }) => {
  const [isChecked, setIsChecked] = useState(schedule.current_log?.is_taken || false);

  useEffect(() => {
    setIsChecked(schedule.current_log?.is_taken || false);
  }, [schedule.current_log]);

  const handleToggle = async () => {
    const newValue = !isChecked;
    setIsChecked(newValue);
    try {
      await onToggle(schedule, newValue);
    } catch (err) {
      setIsChecked(!newValue);
    }
  };

  return (
    <div 
      className={`p-4 rounded-2xl border flex justify-between items-center transition-all duration-200 ${
        isChecked 
          ? 'bg-blue-50 border-blue-100 shadow-sm' 
          : 'bg-white border-slate-100 shadow-sm hover:border-blue-200 active:scale-[0.99]'
      }`}
    >
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-2">
          <span className={`font-bold text-base truncate ${isChecked ? 'text-blue-800' : 'text-slate-800'}`}>
            {schedule.medicine.name}
          </span>
          <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
            {schedule.scheduled_time.substring(0, 5)}
          </span>
        </div>
      </div>

      <div className="flex items-center shrink-0 ml-auto">
        <label className="relative flex items-center cursor-pointer p-2">
          <input 
            type="checkbox"
            className="peer sr-only"
            checked={isChecked}
            onChange={handleToggle}
            disabled={isSaving}
          />
          <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[10px] after:left-[10px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
        </label>
      </div>
    </div>
  );
};
