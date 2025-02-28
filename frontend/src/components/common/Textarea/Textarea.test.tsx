import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('Should render textarea properly', () => {
    render(<Textarea></Textarea>);
  });
});
