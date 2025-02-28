import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { Divider } from './Divider';

describe('Divider', () => {
  it('Should render divider properly', () => {
    render(<Divider></Divider>);
  });
});
