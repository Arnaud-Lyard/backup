import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Alert, AlertActions } from './';

describe('Alert', () => {
  it('Should render alert properly', () => {
    render(
      <Alert size="xs" open={true} onClose={() => {}}>
        Alerte
      </Alert>
    );
  });

  it('Should add class to outline button', () => {
    const alert = screen.getByText('Alerte');
    expect(alert.className).toContain('sm:max-w-xs');
  });
});

describe('Alert actions', () => {
  it('Should render alert action properly', () => {
    render(<AlertActions>Alerte</AlertActions>);
  });
});
