import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { Switch } from './Switch';

describe('Switch', () => {
  it('Should render switch properly', () => {
    render(<Switch></Switch>);
  });
});
