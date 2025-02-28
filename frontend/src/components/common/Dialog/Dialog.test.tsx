import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { Dialog } from './Dialog';

describe('Dialog', () => {
  it('Should render dialog properly', () => {
    render(
      <Dialog open={true} onClose={() => {}}>
        Modale
      </Dialog>
    );
  });
});
