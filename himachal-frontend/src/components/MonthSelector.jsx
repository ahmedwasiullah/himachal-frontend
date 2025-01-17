import React, { useEffect, useState } from 'react';
import styles from '../styles/MonthSelector.module.css';
export function MonthSelector(props) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const [month, setMonth] = useState(
    props.selected?.month ? props.selected.month - 1 : currentMonth
  );
  const [year, setYear] = useState(
    props.selected?.year ?? currentYear
  );

  const setActiveMonthBgColor = (r, color) => {
    r.style.setProperty('--month-active-bg-color', color);
  };

  useEffect(() => {
    const r = document.querySelector(':root');
    if (props.bgColorMonthActive) {
      setActiveMonthBgColor(r, props.bgColorMonthActive);
    }
    if (props.bgColorMonthHover) {
      r.style.setProperty('--month-hover-bg-color', props.bgColorMonthHover);
    }
    if (props.borderRadiusMonth) {
      r.style.setProperty('--month-border-radius', props.borderRadiusMonth);
    }
    if (props.bgColorPicker) {
      r.style.setProperty('--picker-bg-color', props.bgColorPicker);
    }
    if (props.textColor) {
      r.style.setProperty('--text-color', props.textColor);
    }
    if (props.size === 'small') {
      r.style.setProperty('--picker-padding', '1rem');
      r.style.setProperty('--year-display-margin-top', '0.5rem');
      r.style.setProperty('--year-display-margin-bottom', '0.5rem');
      r.style.setProperty('--month-select-padding', '0.5rem');
    }
  }, [props]);

  const changeYear = (newYear) => {
    if (newYear >= currentYear - 1 && newYear <= currentYear) {
      setYear(newYear);
      // Adjust the month if switching to the current year and the selected month exceeds the current month
      if (newYear === currentYear && month > currentMonth) {
        setMonth(currentMonth);
      }
    }
  };

  const getMonthNames = (locale = 'en', format = 'short') => {
    const formatter = new Intl.DateTimeFormat(locale, {
      month: format,
      timeZone: 'IST',
    });
    const months = Array.from({ length: 12 }, (_, i) => new Date(2023, i, 1));
    return months.map((date) => formatter.format(date));
  };

  const changeMonth = (newMonth) => {
    if (year === currentYear && newMonth > currentMonth) {
      return; // Prevent selecting future months in the current year
    }
    setMonth(newMonth);
    props.setIsOpen(false);
    props.onChange({
      month: newMonth + 1,
      year: year,
      monthName: new Date(year, newMonth).toLocaleString(props.lang || 'en', {
        month: 'long',
      }),
      monthShortName: new Date(year, newMonth).toLocaleString(
        props.lang || 'en',
        { month: 'short' }
      ),
    });
  };

  return (
    <div className={styles.pickerContainer}>
      <div className={styles.yearContainer}>
        <button
          className={styles.button}
          aria-label="Previous Year"
          onClick={() => {changeYear(year - 1)
            console.log(year);
          }}
          disabled={year <= currentYear - 1} // Disable if already at the earliest year
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke={props.textColor || '#000'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <span aria-description="Year selected" className={styles.bold1}>
          {year}
        </span>
        <button
          className={styles.button}
          aria-label="Next Year"
          onClick={() => changeYear(year + 1)}
          disabled={year >= currentYear} // Disable if already at the latest year
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke={props.textColor || '#000'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
      <div className={styles.monthsContainer}>
        {getMonthNames(props.lang).map((monthName, index) => {
          const isDisabled =
            year === currentYear && index > currentMonth; // Disable future months

          return (
            <button
              key={index}
              className={`${styles.month} ${styles.button} ${
                index === month && props.selected?.year === year
                  ? styles.active
                  : ''
              }`}
              onClick={() => changeMonth(index)}
              disabled={isDisabled} // Disable button if future month
            >
              {monthName}
            </button>
          );
        })}
      </div>
    </div>
  );
}
