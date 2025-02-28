import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { StackedLayout } from './StackedLayout';

describe('StackedLayout', () => {
  it('Should render stacked layout properly', () => {
    render(<StackedLayout navbar="" sidebar=""></StackedLayout>);
  });
});
