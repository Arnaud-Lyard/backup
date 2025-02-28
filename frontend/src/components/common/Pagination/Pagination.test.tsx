import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('Should render pagination properly', () => {
    render(<Pagination></Pagination>);
  });
});
