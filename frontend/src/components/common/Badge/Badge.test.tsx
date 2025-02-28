import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { Badge } from './Badge';

describe('Badge', () => {
  it('Should render badge properly', () => {
    render(<Badge></Badge>);
  });
});
