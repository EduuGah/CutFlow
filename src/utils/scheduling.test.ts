import { describe, it, expect } from 'vitest';
import { getAvailableTimeSlots, parseTime, formatTime } from './scheduling';

describe('Scheduling Utils', () => {
  describe('parseTime & formatTime', () => {
    it('should parse time strings to minutes correctly', () => {
      expect(parseTime('00:00')).toBe(0);
      expect(parseTime('08:30')).toBe(510);
      expect(parseTime('23:59')).toBe(1439);
    });

    it('should format minutes to time strings correctly', () => {
      expect(formatTime(0)).toBe('00:00');
      expect(formatTime(510)).toBe('08:30');
      expect(formatTime(1439)).toBe('23:59');
    });
  });

  describe('getAvailableTimeSlots', () => {
    const defaultSchedule = {
      start_time: '09:00',
      end_time: '18:00',
      lunch_start: '12:00',
      lunch_end: '13:00'
    };

    const mockDate = new Date('2024-10-10T00:00:00'); // Some future date

    it('should generate all slots when no conflicts', () => {
      const slots = getAvailableTimeSlots(
        mockDate,
        defaultSchedule,
        60, // 1 hour service
        [], // no bookings
        [], // no time-offs
        new Date('2024-10-09T10:00:00') // 'now' is yesterday
      );

      // 09:00, 09:30, 10:00, 10:30, 11:00 (ends 12:00)
      // 13:00, 13:30, 14:00, 14:30, 15:00, 15:30, 16:00, 16:30, 17:00 (ends 18:00)
      expect(slots).toContain('09:00');
      expect(slots).toContain('11:00');
      expect(slots).toContain('13:00');
      expect(slots).toContain('17:00');
      expect(slots).not.toContain('12:00'); // Lunch
      expect(slots).not.toContain('18:00'); // After hours
    });

    it('should block slots that overlap with lunch', () => {
      const slots = getAvailableTimeSlots(
        mockDate,
        defaultSchedule,
        90, // 1.5 hour service
        [],
        [],
        new Date('2024-10-09T10:00:00')
      );
      
      // 10:30 + 90mins = 12:00 (Valid)
      expect(slots).toContain('10:30');
      // 11:00 + 90mins = 12:30 (Invalid, overlaps 12-13)
      expect(slots).not.toContain('11:00');
      // 11:30 + 90mins = 13:00 (Invalid, overlaps 12-13)
      expect(slots).not.toContain('11:30');
    });

    it('should block slots overlapping with booked appointments', () => {
      const booked = [
        {
          start: new Date('2024-10-10T14:00:00'),
          end: new Date('2024-10-10T15:00:00')
        }
      ];

      const slots = getAvailableTimeSlots(
        mockDate,
        defaultSchedule,
        30,
        booked,
        [],
        new Date('2024-10-09T10:00:00')
      );

      expect(slots).toContain('13:30');
      expect(slots).not.toContain('14:00');
      expect(slots).not.toContain('14:30');
      expect(slots).toContain('15:00');
    });

    it('should ignore past times for "today"', () => {
      const today = new Date('2024-10-10T10:15:00'); // It's currently 10:15 AM
      
      const slots = getAvailableTimeSlots(
        today, // Target date is today
        defaultSchedule,
        30,
        [],
        [],
        today // "now" is the same day
      );

      // Should block past + 30 min margin (10:15 + 30 = 10:45)
      expect(slots).not.toContain('09:00');
      expect(slots).not.toContain('09:30');
      expect(slots).not.toContain('10:00');
      expect(slots).not.toContain('10:30');
      // 11:00 is > 10:45, so it's allowed
      expect(slots).toContain('11:00');
    });
  });
});
