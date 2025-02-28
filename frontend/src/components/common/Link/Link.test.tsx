import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { Link } from './Link';

describe('Link', () => {
  it('Should render link properly', () => {
    render(<Link href="#"></Link>);
  });
});
