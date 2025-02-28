import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';
import { Listbox } from './Listbox';

const ResizeObserverMock = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

vi.stubGlobal('ResizeObserver', ResizeObserverMock);

describe('Listbox', () => {
  it('Should render listbox properly', () => {
    render(<Listbox></Listbox>);
  });
});
