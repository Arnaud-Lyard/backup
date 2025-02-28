import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { Input } from './Input';

describe('Input', () => {
  it('Should render input properly', () => {
    render(<Input></Input>);
  });
});
