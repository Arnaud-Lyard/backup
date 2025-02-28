import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { Fieldset } from './Fieldset';

describe('Fieldset', () => {
  it('Should render fieldset properly', () => {
    render(<Fieldset></Fieldset>);
  });
});
