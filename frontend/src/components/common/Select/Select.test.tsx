import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { Select } from './Select';

describe('Select', () => {
  it('Should render select properly', () => {
    render(<Select></Select>);
  });
});
