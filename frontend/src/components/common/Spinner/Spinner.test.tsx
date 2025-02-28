import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('Should render spinner properly', () => {
    render(<Spinner />);
  });
});
