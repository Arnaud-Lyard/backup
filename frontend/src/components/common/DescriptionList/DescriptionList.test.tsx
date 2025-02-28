import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { DescriptionList } from './DescriptionList';

describe('Description List', () => {
  it('Should render description list properly', () => {
    render(<DescriptionList>Checkbox</DescriptionList>);
  });
});
