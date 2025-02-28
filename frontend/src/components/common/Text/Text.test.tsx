import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { Text } from './Text';

describe('Text', () => {
  it('Should render text properly', () => {
    render(<Text></Text>);
  });
});
