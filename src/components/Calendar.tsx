import React, { useState, useEffect } from 'react';

interface DateRangePickerProps {
  onDateChange: (selectedRange: [string, string], weekendsInRange: string[]) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ onDateChange }) => {
  const today = new Date();
  const [fromDate, setFromDate] = useState<Date | null>(today);
  const [toDate, setToDate] = useState<Date | null>(today);
  const [showCalendars, setShowCalendars] = useState(false);
  const [fromMonth, setFromMonth] = useState<number>(new Date().getMonth());
  const [fromYear, setFromYear] = useState<number>(new Date().getFullYear());
  const [toMonth, setToMonth] = useState<number>(new Date().getMonth());
  const [toYear, setToYear] = useState<number>(new Date().getFullYear());
  const [weekends, setWeekends] = useState<Date[]>([]);

  useEffect(() => {
    updateWeekends(fromDate, toDate);
  }, [fromDate, toDate]);

  const predefinedRanges = [
    {
        label: 'This Month',
        getDates: () => {
            const now = new Date();
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            return { from: start, to: end };
        }
    },
    {
        label: 'Next Week',
        getDates: () => {
            const now = new Date();
            const dayOfWeek = now.getDay();
            const start = new Date(now.setDate(now.getDate() + (7 - dayOfWeek)));
            const end = new Date(start.getTime() + 4 * 24 * 60 * 60 * 1000); // next Monday to Friday (exclude weekend)
            return { from: start, to: end };
        }
    },
    {
        label: 'Previous Week',
        getDates: () => {
            const now = new Date();
            const dayOfWeek = now.getDay();
            const start = new Date(now.setDate(now.getDate() - (dayOfWeek + 7)));
            const end = new Date(start.getTime() + 4 * 24 * 60 * 60 * 1000);
            return { from: start, to: end };
        }
    },
    {
        label: 'Last 7 Days',
        getDates: () => {
            const today = new Date();
            const start = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
            return { from: start, to: today };
        }
    },
    {
        label: 'Last Month',
        getDates: () => {
            const now = new Date();
            const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const end = new Date(now.getFullYear(), now.getMonth(), 0);
            return { from: start, to: end };
        }
    }
];
  const applyPredefinedRange = (range: { from: Date; to: Date }) => {
    setFromDate(range.from);
    setToDate(range.to);
    setFromMonth(range.from.getMonth());
    updateWeekends(range.from, range.to);
  };

  const toggleCalendars = () => setShowCalendars(!showCalendars);

  const handleDateSelection = (date: Date, isFromDate: boolean) => {
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  
    if (isWeekend) {
      return; 
    }
  
    if (isFromDate) {
      
      if (fromDate && date.getTime() === fromDate.getTime()) {
        
        setFromDate(null);
        setFromMonth(new Date().getMonth()); 
        setFromYear(new Date().getFullYear()); 
        setToDate(null); 
        setToMonth(new Date().getMonth() + 1); 
        setToYear(new Date().getFullYear());
      } else {
        setFromDate(date);
        setFromMonth(date.getMonth());
        setFromYear(date.getFullYear());
  
       
        if (!toDate || date > toDate) {
          setToDate(date);
          setToMonth(date.getMonth() + 1); 
          setToYear(date.getFullYear());
        }
      }
    } else {
      
      if (toDate && date.getTime() === toDate.getTime()) {
        
        setToDate(null);
        setToMonth(fromMonth + 1); 
        setToYear(fromYear);
      } else if (date >= (fromDate || new Date())) {
        
        setToDate(date);
        setToMonth(date.getMonth());
        setToYear(date.getFullYear());
      }
    }
  
   
    updateWeekends(fromDate, toDate);
  };
  

  const updateWeekends = (startDate: Date | null, endDate: Date | null) => {
    if (!startDate || !endDate) {
      setWeekends([]);
      return;
    }
  
    const weekendsList: Date[] = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      if (d.getDay() === 0 || d.getDay() === 6) {
        weekendsList.push(new Date(d));
      }
    }
    setWeekends(weekendsList);
  
   
    const selectedRange: [string, string] = [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]];
    const weekendsInRange = weekendsList.map(date => date.toISOString().split('T')[0]);
  
    onDateChange(selectedRange, weekendsInRange);
  };
  

  const isDateInRange = (date: Date) => {
    if (!fromDate || !toDate) return false;
    return date >= fromDate && date <= toDate && date.getDay() !== 0 && date.getDay() !== 6; // Exclude weekends
  };

  const renderCalendar = (isFromDate: boolean) => {
    const currentMonth = isFromDate ? fromMonth : toMonth;
    const currentYear = isFromDate ? fromYear : toYear;

    const startDay = new Date(currentYear, currentMonth, 1);
    const endDay = new Date(currentYear, currentMonth + 1, 0);

    const firstWeekDay = startDay.getDay();
    const totalDays = endDay.getDate();

    const days: JSX.Element[] = [];

    for (let i = 0; i < firstWeekDay; i++) {
      days.push(<td key={`empty-${i}`} />);
    }

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const isSelected = isDateInRange(date);
      const isFromDay = isFromDate && fromDate?.toDateString() === date.toDateString();
      const isToDay = !isFromDate && toDate?.toDateString() === date.toDateString();
      const isDisabled = !isFromDate && fromDate && date < fromDate;

      days.push(
        <td
          key={day}
          className={`text-center ${isWeekend ? 'text-danger' : ''} ${isSelected ? 'bg-primary text-white' : ''} ${
            isFromDay || isToDay ? 'border border-warning' : ''
          } ${isDisabled ? 'text-muted' : ''}`}
          onClick={!isDisabled ? () => handleDateSelection(date, isFromDate) : undefined}
          style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
        >
          {day}
        </td>
      );
    }

    const rows: JSX.Element[] = [];
    for (let i = 0; i < days.length; i += 7) {
      rows.push(<tr key={i}>{days.slice(i, i + 7)}</tr>);
    }

    return (
      <table className="table table-bordered" style={{ width: '100%', height: '250px' }}>
        <thead>
          <tr>
            <th colSpan={7}>
              <select
                value={currentMonth}
                onChange={(e) => {
                  const newMonth = Number(e.target.value);
                  if (isFromDate) {
                    setFromMonth(newMonth);
                  } else {
                    setToMonth(newMonth);
                  }
                }}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>

              <select
                value={currentYear}
                onChange={(e) => {
                  const newYear = Number(e.target.value);
                  if (isFromDate) {
                    setFromYear(newYear);
                  } else {
                    setToYear(newYear);
                  }
                }}
              >
                {Array.from({ length: 50 }, (_, i) => (
                  <option key={i} value={today.getFullYear() - 25 + i}>
                    {today.getFullYear() - 25 + i}
                  </option>
                ))}
              </select>
            </th>
          </tr>
          <tr>
            <th>Sun</th>
            <th>Mon</th>
            <th>Tue</th>
            <th>Wed</th>
            <th>Thu</th>
            <th>Fri</th>
            <th>Sat</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    );
  };

  const renderWeekend = (date: Date) => {
    const dayName = date.getDay() === 0 ? 'Sun' : 'Sat';
    return `${date.toLocaleDateString()} (${dayName})`;
  };

  return (
    <div className="container mt-5">
      <div className="input-group mx-5" onClick={toggleCalendars} style={{ cursor: 'pointer', maxWidth: '300px' }}>
        <input
          type="text"
          className="form-control mx-0"
          value={`${fromDate ? fromDate.toLocaleDateString() : ''} - ${toDate ? toDate.toLocaleDateString() : ''}`}
          readOnly
        />
        <span className="input-group-text">
          <i className="bi bi-calendar"></i>
        </span>
      </div>

      {showCalendars && (
        <div className="mt-3">
          <div className="row">
            <div className="col-md-3">
              <h5>From Date</h5>
              {renderCalendar(true)}
            </div>
            <div className="col-md-3">
              <h5>To Date</h5>
              {renderCalendar(false)}
            </div>
          </div>
          <button className="btn btn-primary me-5 mx-0 mt-1" onClick={() => setShowCalendars(false)}>
            Confirm
          </button>
        </div>
      )}

      <div className="mt-4">
        <div className="d-flex flex-wrap">
          {predefinedRanges.map((range, idx) => (
            <button key={idx} className="btn btn-outline-primary me-2 mb-2" onClick={() => applyPredefinedRange(range.getDates())}>
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {!showCalendars && weekends.length > 0 && (
  <div>
    <h6 className="mt-5">Weekends</h6>
    <div className="d-flex flex-wrap" style={{ overflowY: 'scroll', height: '150px' }}>
      {weekends.map((weekendDate, index) => (
        <div key={index} className="badge bg-secondary m-1" style={{ color: 'red', textTransform: 'uppercase' }}>
          {renderWeekend(weekendDate)}
        </div>
      ))}
    </div>
  </div>
)}

    </div>
  );
};

export default DateRangePicker;
