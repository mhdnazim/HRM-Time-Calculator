/**
 * Parse time string in format "HH:MM:SS AM/PM" to seconds since midnight
 */
export function parseTime(timeString: string): number {
  const [time, meridiem] = timeString.split(' ');
  let [h, m, s] = time.split(':').map(Number);
  
  if (meridiem === 'PM' && h < 12) h += 12;
  if (meridiem === 'AM' && h === 12) h = 0;
  
  return h * 3600 + m * 60 + s;
}

/**
 * Format seconds to "Xh Ym Zs" format
 */
export function formatTime(totalSeconds: number): string {
  if (totalSeconds < 0) totalSeconds = 0;
  
  const h = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  
  return `${h}h ${m}m ${s}s`;
}

/**
 * Format seconds to clock time "HH:MM:SS AM/PM"
 */
export function formatClockTime(totalSeconds: number): string {
  totalSeconds = totalSeconds % (24 * 3600);
  const h24 = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  
  const meridiem = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} ${meridiem}`;
}

/**
 * Get current time in seconds since midnight
 */
export function getCurrentTimeInSeconds(): number {
  const now = new Date();
  return now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
}

/**
 * Parse time log entries and calculate break times
 */
export interface TimeEntry {
  time: string;
  type: 'in' | 'out';
  timeInSeconds: number;
}

export interface BreakCalculationResult {
  totalBreakTime: number;
  firstInTime: number | null;
  remainingBreakTime: number;
  isOverLimit: boolean;
  expectedExitTime: string;
  productiveHours: number;
  timeLeftFor8Hours: number;
  isProductiveComplete: boolean;
}

export function calculateBreakTime(timeLogs: string): BreakCalculationResult {
  const lines = timeLogs.trim().split('\n').filter(line => line.trim());
  const events: TimeEntry[] = lines.map(line => {
    const [timeStr, typeStr] = line.split('\t').map(s => s.trim());
    return {
      time: timeStr,
      type: typeStr.toLowerCase() as 'in' | 'out',
      timeInSeconds: parseTime(timeStr)
    };
  });

  let totalBreakTime = 0;
  let firstInTime: number | null = null;

  // Find first "in" time
  for (const event of events) {
    if (event.type === 'in' && firstInTime === null) {
      firstInTime = event.timeInSeconds;
      break;
    }
  }

  // Calculate break times (out to in periods)
  for (let i = 0; i < events.length; i++) {
    if (events[i].type === 'out' && i + 1 < events.length && events[i + 1].type === 'in') {
      const outTime = events[i].timeInSeconds;
      const inTime = events[i + 1].timeInSeconds;
      totalBreakTime += inTime - outTime;
    }
  }

  const allowedBreakTime = 45 * 60; // 45 minutes in seconds
  const warningThreshold = allowedBreakTime + 15 * 60; // 60 minutes total
  const remainingBreakTime = allowedBreakTime - totalBreakTime;
  const isOverLimit = totalBreakTime > warningThreshold;

  // Calculate expected exit time
  let expectedExitTime = 'N/A';
  if (firstInTime !== null) {
    if (totalBreakTime <= allowedBreakTime) {
      expectedExitTime = formatClockTime(firstInTime + (8 * 3600 + 45 * 60));
    } else {
      expectedExitTime = formatClockTime(firstInTime + (8 * 3600) + totalBreakTime);
    }
  }

  // Calculate productive hours
  let productiveHours = 0;
  let timeLeftFor8Hours = 8 * 3600;
  let isProductiveComplete = false;

  if (firstInTime !== null) {
    const currentTime = getCurrentTimeInSeconds();
    productiveHours = (currentTime - firstInTime) - totalBreakTime;
    
    if (productiveHours >= 8 * 3600) {
      isProductiveComplete = true;
      timeLeftFor8Hours = 0;
    } else {
      timeLeftFor8Hours = (8 * 3600) - productiveHours;
    }
  }

  return {
    totalBreakTime,
    firstInTime,
    remainingBreakTime,
    isOverLimit,
    expectedExitTime,
    productiveHours,
    timeLeftFor8Hours,
    isProductiveComplete
  };
}
