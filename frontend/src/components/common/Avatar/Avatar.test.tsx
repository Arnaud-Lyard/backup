import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('Should render avatar properly', () => {
    render(<Avatar>Alerte</Avatar>);
  });
});
