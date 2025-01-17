import { useEffect, useState } from 'react';
// @ts-ignore
import {MonthInput } from 'react-lite-month-picker';
import { MonthSelector } from './MonthSelector';
function MPicker({datePicked}) {

  const currentYear = new Date().getFullYear(); // Get the current year
  const currentMonth = new Date().getMonth() + 1;

  const [selectedMonthData, setSelectedMonthData] = useState({
    month: currentMonth,
    year: currentYear,
  });
  const[size,setSize]=useState('small')

const setDateProps=(datesData)=>{
     setSelectedMonthData(datesData);
};

  useEffect(()=>{
    datePicked(selectedMonthData);
  }
  ,[selectedMonthData]);

  const [isPickerOpen, setIsPickerOpen] = useState(false);

  return (
    <>
      <div className='combinedMonthPicker'>
        <div className='btnMonthInput'>
        <MonthInput 
          selected={selectedMonthData}
          setShowMonthPicker={setIsPickerOpen}
          showMonthPicker={isPickerOpen}
          size={size}
        />
        {isPickerOpen ? (
          <MonthSelector
            setIsOpen={setIsPickerOpen}
            selected={selectedMonthData}
            onChange={setDateProps}
            size={size}
           
          />

        ) : null}
        </div>
      </div>
    </>
  );
}

export default MPicker;