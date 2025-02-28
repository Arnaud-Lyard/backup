import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { SidebarLayout } from './SidebarLayout';

describe('SidebarLayout', () => {
  it('Should render sidebar layout properly', () => {
    render(<SidebarLayout navbar="" sidebar=""></SidebarLayout>);
  });
});
