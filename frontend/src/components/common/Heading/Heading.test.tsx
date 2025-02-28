import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { Heading } from './Heading';

describe('Heading', () => {
  it('Should render heading properly', () => {
    render(<Heading></Heading>);
  });
});
