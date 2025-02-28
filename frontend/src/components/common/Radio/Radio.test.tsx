import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { Radio, RadioGroup } from './Radio';

describe('Radio', () => {
  it('Should render radio properly', () => {
    render(
      <RadioGroup>
        <Radio value="radio"></Radio>
      </RadioGroup>
    );
  });
});
