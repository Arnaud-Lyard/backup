import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { Dropdown } from './Dropdown';

describe('Dropdown', () => {
  it('Should render dropdown properly', () => {
    render(<Dropdown></Dropdown>);
  });
});
