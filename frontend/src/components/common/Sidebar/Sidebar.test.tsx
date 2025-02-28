import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { Sidebar } from './Sidebar';

describe('Sidebar', () => {
  it('Should render sidebar properly', () => {
    render(<Sidebar></Sidebar>);
  });
});
