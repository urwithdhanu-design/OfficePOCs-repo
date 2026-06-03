import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NavLink } from '../NavLink';

const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>
  );
};

describe('NavLink', () => {
  it('renders link with correct text', () => {
    renderWithRouter(<NavLink to="/about">About</NavLink>);
    
    expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument();
  });

  it('renders with correct href', () => {
    renderWithRouter(<NavLink to="/contact">Contact</NavLink>);
    
    expect(screen.getByRole('link')).toHaveAttribute('href', '/contact');
  });

  it('applies base className', () => {
    renderWithRouter(
      <NavLink to="/test" className="base-class">
        Test
      </NavLink>
    );
    
    expect(screen.getByRole('link')).toHaveClass('base-class');
  });

  it('applies activeClassName when route is active', () => {
    renderWithRouter(
      <NavLink to="/" className="base-class" activeClassName="active-class">
        Home
      </NavLink>,
      { route: '/' }
    );
    
    expect(screen.getByRole('link')).toHaveClass('active-class');
  });

  it('does not apply activeClassName when route is not active', () => {
    renderWithRouter(
      <NavLink to="/other" className="base-class" activeClassName="active-class">
        Other
      </NavLink>,
      { route: '/' }
    );
    
    expect(screen.getByRole('link')).not.toHaveClass('active-class');
  });

  it('renders children correctly', () => {
    renderWithRouter(
      <NavLink to="/test">
        <span>Link Content</span>
      </NavLink>
    );
    
    expect(screen.getByText('Link Content')).toBeInTheDocument();
  });
});
