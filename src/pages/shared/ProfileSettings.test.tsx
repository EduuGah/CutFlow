import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileSettings } from './ProfileSettings';
import * as AuthContext from '../../contexts/AuthContext';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../config/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { full_name: 'John Doe', phone: '11999998888' }, error: null }),
      update: vi.fn().mockReturnThis(),
    })),
  },
}));

describe('ProfileSettings Phone Masking', () => {
  it('applies the phone mask correctly to inputs', async () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: { id: '123' } as any,
      profile: {
        id: '123',
        email: 'john@example.com',
        full_name: 'John Doe',
        role: 'CUSTOMER',
        created_at: '2024',
      },
      isLoading: false,
      refreshProfile: vi.fn(),
      session: null,
    });

    render(<ProfileSettings />);

    const phoneInput = await screen.findByPlaceholderText('(00) 00000-0000') as HTMLInputElement;
    
    fireEvent.change(phoneInput, { target: { value: '11988887777' } });
    expect(phoneInput.value).toBe('(11) 98888-7777');

    fireEvent.change(phoneInput, { target: { value: '1188887777' } });
    expect(phoneInput.value).toBe('(11) 8888-7777');
    
    fireEvent.change(phoneInput, { target: { value: 'a11b988c88d777e7' } });
    expect(phoneInput.value).toBe('(11) 98888-7777');
  });
});
