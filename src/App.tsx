import React from 'react';
import DateRangePicker from './components/Calendar';

const App: React.FC = () => {
  const handleDateChange = (selectedRange: [string, string], weekendsInRange: string[]) => {
    console.log('Selected Range:', selectedRange);
    console.log('Weekends in Range:', weekendsInRange);
  };

  return (
    <div className="App">
      <DateRangePicker onDateChange={handleDateChange} />
    </div>
  );
}

export default App;
