import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { Table } from './Table';

describe('Table', () => {
  it('Should render table properly', () => {
    render(<Table></Table>);
  });
});
