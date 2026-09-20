import "@testing-library/jest-dom";
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AuthGuard } from './AuthGuard';
import { useAuth } from '../../contexts/AuthContext';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('AuthGuard', () => {
  it('renders loading spinner when loading is true', () => {
    (useAuth as any).mockReturnValue({ loading: true, user: null });
    
    const { container } = render(
      <MemoryRouter>
        <AuthGuard />
      </MemoryRouter>
    );

    // The spinner SVG should be present
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('redirects to login when user is null and loading is false', () => {
    (useAuth as any).mockReturnValue({ loading: false, user: null });
    
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route element={<AuthGuard />}>
            <Route path="/protected" element={<div>Protected Content</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders child routes when user is authenticated', () => {
    (useAuth as any).mockReturnValue({ loading: false, user: { id: '1' } });
    
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route element={<AuthGuard />}>
            <Route path="/protected" element={<div>Protected Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
