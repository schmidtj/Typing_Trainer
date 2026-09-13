import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { App } from '../App';

// Mock Web Audio soundManager
vi.mock('../audio/soundManager', () => ({
  soundManager: {
    playKeypress: vi.fn(),
    playSpace: vi.fn(),
    playError: vi.fn(),
    playComboMilestone: vi.fn(),
    playLevelComplete: vi.fn(),
    playCoin: vi.fn(),
    playFeedAnimal: vi.fn(),
    setVolume: vi.fn(),
    setMuted: vi.fn(),
  },
}));

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the header and navigation buttons', () => {
    render(<App />);

    expect(screen.getAllByText(/Cozy Animal Island/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Levels/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Sanctuary/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Arcade/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Metrics/i })).toBeDefined();
  });

  it('navigates to Sanctuary view when clicking Sanctuary tab', () => {
    render(<App />);

    const sanctuaryButton = screen.getByRole('button', { name: /Sanctuary/i });
    fireEvent.click(sanctuaryButton);

    expect(screen.getByText(/Cozy Animal Sanctuary/i)).toBeDefined();
    expect(screen.getAllByText(/Barnaby Bunny/i).length).toBeGreaterThan(0);
  });

  it('navigates to Arcade view when clicking Arcade tab', () => {
    render(<App />);

    const arcadeButton = screen.getByRole('button', { name: /Arcade/i });
    fireEvent.click(arcadeButton);

    expect(screen.getByText(/Berry Catch Arcade/i)).toBeDefined();
    expect(screen.getByText(/Breezy Breeze/i)).toBeDefined();
  });

  it('navigates to Metrics view when clicking Metrics tab', () => {
    render(<App />);

    const metricsButton = screen.getByRole('button', { name: /Metrics/i });
    fireEvent.click(metricsButton);

    expect(screen.getByText(/Performance & Metrics/i)).toBeDefined();
    expect(screen.getByText(/Keyboard Accuracy Heatmap/i)).toBeDefined();
  });
});
