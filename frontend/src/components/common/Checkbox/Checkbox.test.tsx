import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('Should render checkbox properly', () => {
    render(<Checkbox name="checkbox">Checkbox</Checkbox>);
  });
});
