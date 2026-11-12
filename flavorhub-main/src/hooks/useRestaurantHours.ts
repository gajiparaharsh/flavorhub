import { useMemo } from 'react';

interface DayHours {
  open: string;
  close: string;
  label: string;
}

// Restaurant operating hours (24-hour format)
const RESTAURANT_HOURS: Record<number, DayHours> = {
  0: { open: '11:00', close: '21:00', label: 'Sunday' },      // Sunday
  1: { open: '10:00', close: '22:00', label: 'Monday' },      // Monday
  2: { open: '10:00', close: '22:00', label: 'Tuesday' },     // Tuesday
  3: { open: '10:00', close: '22:00', label: 'Wednesday' },   // Wednesday
  4: { open: '10:00', close: '22:00', label: 'Thursday' },    // Thursday
  5: { open: '10:00', close: '22:00', label: 'Friday' },      // Friday
  6: { open: '11:00', close: '23:00', label: 'Saturday' },    // Saturday
};

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}${minutes > 0 ? `:${minutes.toString().padStart(2, '0')}` : ''}${period}`;
}

export function useRestaurantHours() {
  return useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const todayHours = RESTAURANT_HOURS[currentDay];
    const openMinutes = timeToMinutes(todayHours.open);
    const closeMinutes = timeToMinutes(todayHours.close);
    
    const isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
    
    // Calculate time until open/close
    let statusMessage: string;
    if (isOpen) {
      const minutesUntilClose = closeMinutes - currentMinutes;
      if (minutesUntilClose <= 60) {
        statusMessage = `Closes in ${minutesUntilClose} min`;
      } else {
        statusMessage = `Open until ${formatTime(todayHours.close)}`;
      }
    } else {
      // Check if we're before opening or after closing
      if (currentMinutes < openMinutes) {
        statusMessage = `Opens at ${formatTime(todayHours.open)}`;
      } else {
        // After closing, show tomorrow's opening
        const tomorrowDay = (currentDay + 1) % 7;
        const tomorrowHours = RESTAURANT_HOURS[tomorrowDay];
        statusMessage = `Opens ${tomorrowHours.label} at ${formatTime(tomorrowHours.open)}`;
      }
    }

    // Format hours for display
    const formattedHours = {
      weekdays: `${formatTime(RESTAURANT_HOURS[1].open)} - ${formatTime(RESTAURANT_HOURS[1].close)}`,
      saturday: `${formatTime(RESTAURANT_HOURS[6].open)} - ${formatTime(RESTAURANT_HOURS[6].close)}`,
      sunday: `${formatTime(RESTAURANT_HOURS[0].open)} - ${formatTime(RESTAURANT_HOURS[0].close)}`,
    };

    return {
      isOpen,
      statusMessage,
      todayHours: {
        open: formatTime(todayHours.open),
        close: formatTime(todayHours.close),
      },
      formattedHours,
      currentDay: todayHours.label,
    };
  }, []);
}
