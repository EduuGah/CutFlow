export interface TimeRange {
  start: Date;
  end: Date;
}

export interface ScheduleBlock {
  start_time: string;
  end_time: string;
  lunch_start: string | null;
  lunch_end: string | null;
}

export function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

export function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function getAvailableTimeSlots(
  targetDate: Date,
  schedule: ScheduleBlock,
  serviceDurationMinutes: number,
  bookedAppointments: TimeRange[],
  blockedTimes: TimeRange[],
  now: Date = new Date(), // Injectable for testing
  slotInterval: number = 30
): string[] {
  const startMins = parseTime(schedule.start_time);
  const endMins = parseTime(schedule.end_time);
  const lunchStartMins = schedule.lunch_start ? parseTime(schedule.lunch_start) : null;
  const lunchEndMins = schedule.lunch_end ? parseTime(schedule.lunch_end) : null;

  const slots: string[] = [];

  const bookedRanges = bookedAppointments.map(app => ({
    start: app.start.getHours() * 60 + app.start.getMinutes(),
    end: app.end.getHours() * 60 + app.end.getMinutes()
  }));

  const timeOffRanges = blockedTimes.map(timeOff => ({
    start: timeOff.start.getHours() * 60 + timeOff.start.getMinutes(),
    end: timeOff.end.getHours() * 60 + timeOff.end.getMinutes()
  }));

  let currentMins = startMins;

  const isToday = 
    targetDate.getDate() === now.getDate() && 
    targetDate.getMonth() === now.getMonth() && 
    targetDate.getFullYear() === now.getFullYear();

  const currentDayMins = now.getHours() * 60 + now.getMinutes();

  while (currentMins + serviceDurationMinutes <= endMins) {
    const slotStart = currentMins;
    const slotEnd = currentMins + serviceDurationMinutes;

    // Skip if in the past today (add 30 mins margin)
    if (isToday && slotStart <= currentDayMins + 30) {
      currentMins += slotInterval;
      continue;
    }

    const overlapsLunch = lunchStartMins !== null && lunchEndMins !== null &&
      (slotStart < lunchEndMins && slotEnd > lunchStartMins);

    const overlapsBooked = bookedRanges.some(booked => 
      (slotStart < booked.end && slotEnd > booked.start)
    );

    const overlapsTimeOff = timeOffRanges.some(blocked =>
      (slotStart < blocked.end && slotEnd > blocked.start)
    );

    if (!overlapsLunch && !overlapsBooked && !overlapsTimeOff) {
      slots.push(formatTime(slotStart));
    }

    currentMins += slotInterval;
  }

  return slots;
}
