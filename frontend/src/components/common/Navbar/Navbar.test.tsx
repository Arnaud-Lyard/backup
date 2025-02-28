import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { Navbar } from './Navbar';

describe('Navbar', () => {
  it('Should render navbar properly', () => {
    render(<Navbar></Navbar>);
  });
});
