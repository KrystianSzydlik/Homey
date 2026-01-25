import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Popover } from './index';

describe('Popover', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Uncontrolled Mode', () => {
    it('should be closed by default', () => {
      render(
        <Popover>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover>
      );

      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });

    it('should open when trigger is clicked', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should close when trigger is clicked again', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));
      expect(screen.getByText('Content')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Open' }));

      await waitFor(() => {
        expect(screen.queryByText('Content')).not.toBeInTheDocument();
      });
    });

    it('should respect defaultOpen prop', () => {
      render(
        <Popover defaultOpen>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Controlled Mode', () => {
    it('should be controlled by open prop', () => {
      const { rerender } = render(
        <Popover open={false}>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover>
      );

      expect(screen.queryByText('Content')).not.toBeInTheDocument();

      rerender(
        <Popover open={true}>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should call onOpenChange when trigger is clicked', async () => {
      const onOpenChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Popover open={false} onOpenChange={onOpenChange}>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover>
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      expect(onOpenChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Click Outside', () => {
    it('should close when clicking outside', async () => {
      const user = userEvent.setup();

      render(
        <div>
          <Popover defaultOpen>
            <Popover.Trigger>Open</Popover.Trigger>
            <Popover.Content>Content</Popover.Content>
          </Popover>
          <button>Outside</button>
        </div>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Outside' }));

      await waitFor(() => {
        expect(screen.queryByText('Content')).not.toBeInTheDocument();
      });
    });

    it('should not close when clicking inside content', async () => {
      const user = userEvent.setup();

      render(
        <Popover defaultOpen>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content>
            <button>Inside Button</button>
          </Popover.Content>
        </Popover>
      );

      await user.click(screen.getByRole('button', { name: 'Inside Button' }));

      expect(screen.getByText('Inside Button')).toBeInTheDocument();
    });
  });

  describe('Keyboard Handling', () => {
    it('should close when Escape is pressed', async () => {
      const user = userEvent.setup();

      render(
        <Popover defaultOpen>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('Content')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have aria-expanded on trigger', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover>
      );

      const trigger = screen.getByRole('button', { name: 'Open' });
      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      await user.click(trigger);

      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('should have aria-haspopup on trigger', () => {
      render(
        <Popover>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover>
      );

      const trigger = screen.getByRole('button', { name: 'Open' });
      expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    });

    it('should have role="dialog" on content', () => {
      render(
        <Popover defaultOpen>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Animation', () => {
    it('should animate in when opened', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover>
      );

      expect(screen.queryByText('Content')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Open' }));

      await waitFor(() => {
        expect(screen.getByText('Content')).toBeInTheDocument();
      });
    });

    it('should animate out when closed', async () => {
      const user = userEvent.setup();

      render(
        <Popover defaultOpen>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      await waitFor(
        () => {
          expect(screen.queryByText('Content')).not.toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });
  });
});

describe('Popover.Content', () => {
  it('should render in portal', () => {
    render(
      <div id="test-container">
        <Popover defaultOpen>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover>
      </div>
    );

    const content = screen.getByRole('dialog');
    // Content should not be inside the test container
    expect(document.getElementById('test-container')?.contains(content)).toBe(
      false
    );
  });

  it('should accept custom className', () => {
    render(
      <Popover defaultOpen>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Content className="custom-class">Content</Popover.Content>
      </Popover>
    );

    const content = screen.getByRole('dialog');
    expect(content).toHaveClass('custom-class');
  });
});

describe('Popover.CloseButton', () => {
  it('should close popover when clicked', async () => {
    const user = userEvent.setup();

    render(
      <Popover defaultOpen>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Content>
          <Popover.Header>
            <Popover.Title>Title</Popover.Title>
            <Popover.CloseButton />
          </Popover.Header>
          <Popover.Body>Body</Popover.Body>
        </Popover.Content>
      </Popover>
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should have accessible label', () => {
    render(
      <Popover defaultOpen>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Content>
          <Popover.CloseButton aria-label="Close popover" />
        </Popover.Content>
      </Popover>
    );

    expect(
      screen.getByRole('button', { name: 'Close popover' })
    ).toBeInTheDocument();
  });
});

describe('Popover Composition', () => {
  it('should work with header, title, and body', () => {
    render(
      <Popover defaultOpen>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Content>
          <Popover.Header>
            <Popover.Title>Popover Title</Popover.Title>
            <Popover.CloseButton />
          </Popover.Header>
          <Popover.Body>Body content</Popover.Body>
        </Popover.Content>
      </Popover>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Popover Title')).toBeInTheDocument();
    expect(screen.getByText('Body content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });

  it('should work with just content', () => {
    render(
      <Popover defaultOpen>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Content>Simple content</Popover.Content>
      </Popover>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Simple content')).toBeInTheDocument();
  });
});

describe('Edge Cases', () => {
  it('should throw error when compound components are used outside Popover', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<Popover.Trigger>Trigger</Popover.Trigger>);
    }).toThrow(
      'Popover compound components must be used within a Popover component'
    );

    consoleSpy.mockRestore();
  });
});
