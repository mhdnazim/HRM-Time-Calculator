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
  isBreakTimeSufficient: boolean;
  expectedExitTime: string;
  productiveHours: number;
  timeLeftForTargetHours: number;
  isProductiveComplete: boolean;
  workType: 'full-day' | 'hlop' | 'qlop';
  targetBreakTime: number;
  targetProductiveHours: number;
}

export function calculateBreakTime(timeLogs: string, workType: 'full-day' | 'hlop' | 'qlop' = 'full-day'): BreakCalculationResult {
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

  // Set targets based on work type
  let targetBreakTime: number;
  let targetProductiveHours: number;
  
  switch (workType) {
    case 'hlop':
      targetBreakTime = 15 * 60; // 15 minutes
      targetProductiveHours = 4 * 3600; // 4 hours
      break;
    case 'qlop':
      targetBreakTime = 30 * 60; // 30 minutes
      targetProductiveHours = 6 * 3600; // 6 hours
      break;
    case 'full-day':
    default:
      targetBreakTime = 45 * 60; // 45 minutes
      targetProductiveHours = 8 * 3600; // 8 hours
      break;
  }
  
  const remainingBreakTime = Math.max(0, targetBreakTime - totalBreakTime);
  const isBreakTimeSufficient = totalBreakTime >= targetBreakTime;
  const isOverLimit = totalBreakTime > (targetBreakTime + 15 * 60); // Warning if way over minimum

  // Calculate expected exit time
  let expectedExitTime = 'N/A';
  if (firstInTime !== null) {
    // Expected exit time is based on actual break time taken (must be at least minimum)
    const actualBreakTime = Math.max(totalBreakTime, targetBreakTime);
    expectedExitTime = formatClockTime(firstInTime + targetProductiveHours + actualBreakTime);
  }

  // Calculate productive hours
  let productiveHours = 0;
  let timeLeftForTargetHours = targetProductiveHours;
  let isProductiveComplete = false;

  if (firstInTime !== null) {
    // Use the last logged time if the last entry is "Out", otherwise use current time
    const lastEvent = events[events.length - 1];
    const calculationTime = lastEvent && lastEvent.type === 'out' 
      ? lastEvent.timeInSeconds 
      : getCurrentTimeInSeconds();
    
    productiveHours = (calculationTime - firstInTime) - totalBreakTime;
    
    if (productiveHours >= targetProductiveHours) {
      isProductiveComplete = true;
      timeLeftForTargetHours = 0;
    } else {
      timeLeftForTargetHours = targetProductiveHours - productiveHours;
    }
  }

  return {
    totalBreakTime,
    firstInTime,
    remainingBreakTime,
    isOverLimit,
    isBreakTimeSufficient,
    expectedExitTime,
    productiveHours,
    timeLeftForTargetHours,
    isProductiveComplete,
    workType,
    targetBreakTime,
    targetProductiveHours
  };
}
