import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createEventInDb, getEventBySlug } from '../events';
import { db } from '@/lib/db';
// events schema import removed as it was unused
import { EventAppConfig } from '@/lib/types';

// Mock the DB
vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
    transaction: vi.fn((cb) => cb({
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{ updatedId: 'test-event' }])
    })),
  },
}));

const mockConfig: EventAppConfig = {
  id: 'test-id',
  eventId: 'test-event',
  version: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  primaryGoals: [],
  attendeeProfileFields: [],
  matchmakingConfig: { enabled: false, inputSignals: [], matchTypes: [], meetingDurations: [] },
  sessionConfig: { tracksEnabled: false, maxConcurrentSessions: 1, sessionTypes: [] },
  engagementConfig: { chatEnabled: false, qnaEnabled: false, pollsEnabled: false, liveFeedEnabled: false },
  relationshipFeatures: { relationshipScoresVisible: false, warmPathHintsEnabled: false, introRequestsEnabled: false },
  branding: { primaryColor: '#000', accentColor: '#fff', toneKeywords: [] },
  content: { eventName: 'Test Event' }
};

describe('Event Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createEventInDb', () => {
    it('should create an event successfully', async () => {
      process.env.DATABASE_URL = 'postgres://mock';
      
      const result = await createEventInDb('test-event', mockConfig, 'architect', 'user-1');
      
      expect(db.transaction).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should throw error if DB fails', async () => {
      process.env.DATABASE_URL = 'postgres://mock';
      vi.mocked(db.transaction).mockRejectedValueOnce(new Error('DB Error'));

      await expect(createEventInDb('test-event', mockConfig, 'architect', 'user-1'))
        .rejects.toThrow('DB Error');
    });
  });

  describe('getEventBySlug', () => {
    it('should return null if event not found', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([])
          })
        })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const result = await getEventBySlug('non-existent');
      expect(result).toBeNull();
    });

    it('should return event with config if found', async () => {
       vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
                slug: 'test-event',
                config: mockConfig
            }])
          })
        })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const result = await getEventBySlug('test-event');
      expect(result).not.toBeNull();
      expect(result?.slug).toBe('test-event');
    });
  });
});
