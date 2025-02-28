import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Button } from './';

describe('Button', () => {
  it('Should render button properly', () => {
    render(<Button>Bouton1</Button>);
    render(<Button outline>Bouton2</Button>);
    render(<Button plain>Bouton3</Button>);
    render(<Button color="light">Bouton4</Button>);
  });

  it('Should add class to base button', () => {
    const button = screen.getByText('Bouton1');

    expect(button.className).toContain(
      'relative isolate inline-flex items-center justify-center gap-x-2 rounded-lg border text-base/6 font-semibold'
    );
    expect(button.className).toContain('border-transparent bg-[--btn-border]');

    fireEvent.focus(button);
    expect(button.className).toContain(
      'focus:outline-none data-[focus]:outline data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[focus]:outline-blue-500'
    );
  });

  it('Should add class to outline button', () => {
    const button = screen.getByText('Bouton2');
    expect(button.className).toContain(
      'relative isolate inline-flex items-center justify-center gap-x-2 rounded-lg border text-base/6 font-semibold'
    );

    expect(button.className).toContain(
      'border-zinc-950/10 text-zinc-950 data-[active]:bg-zinc-950/[2.5%] data-[hover]:bg-zinc-950/[2.5%]'
    );
  });

  it('Should add class to plain button', () => {
    const button = screen.getByText('Bouton3');
    expect(button.className).toContain(
      'relative isolate inline-flex items-center justify-center gap-x-2 rounded-lg border text-base/6 font-semibold'
    );

    expect(button.className).toContain(
      'border-transparent text-zinc-950 data-[active]:bg-zinc-950/5 data-[hover]:bg-zinc-950/5'
    );
  });

  it('Should add class to light color button', () => {
    const button = screen.getByText('Bouton4');

    expect(button.className).toContain(
      'relative isolate inline-flex items-center justify-center gap-x-2 rounded-lg border text-base/6 font-semibold'
    );

    expect(button.className).toContain(
      'text-zinc-950 [--btn-bg:white] [--btn-border:theme(colors.zinc.950/10%)] [--btn-hover-overlay:theme(colors.zinc.950/2.5%)] data-[active]:[--btn-border:theme(colors.zinc.950/15%)] data-[hover]:[--btn-border:theme(colors.zinc.950/15%)]'
    );
  });
});
