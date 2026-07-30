import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

vi.mock('embla-carousel-react', () => {
  const mockApi = {
    canScrollPrev: () => false,
    canScrollNext: () => false,
    scrollPrev: () => {},
    scrollNext: () => {},
    scrollTo: () => {},
    selectedScrollSnap: () => 0,
    scrollSnapList: () => [0],
    on: () => {},
    off: () => {},
    reInit: () => {},
  };
  return {
    default: () => [() => {}, mockApi],
  };
});