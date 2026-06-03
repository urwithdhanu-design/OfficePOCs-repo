import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';

describe('Card', () => {
  it('renders card with content', () => {
    render(
      <Card>
        <CardContent>Card content</CardContent>
      </Card>
    );
    
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders complete card structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description text</CardDescription>
        </CardHeader>
        <CardContent>Main content</CardContent>
        <CardFooter>Footer content</CardFooter>
      </Card>
    );
    
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card description text')).toBeInTheDocument();
    expect(screen.getByText('Main content')).toBeInTheDocument();
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('applies custom className to Card', () => {
    render(<Card className="custom-card">Content</Card>);
    
    expect(screen.getByText('Content').parentElement).toHaveClass('custom-card');
  });

  it('applies custom className to CardHeader', () => {
    render(
      <Card>
        <CardHeader className="custom-header">Header</CardHeader>
      </Card>
    );
    
    expect(screen.getByText('Header')).toHaveClass('custom-header');
  });

  it('applies custom className to CardTitle', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle className="custom-title">Title</CardTitle>
        </CardHeader>
      </Card>
    );
    
    expect(screen.getByText('Title')).toHaveClass('custom-title');
  });

  it('applies custom className to CardContent', () => {
    render(
      <Card>
        <CardContent className="custom-content">Content</CardContent>
      </Card>
    );
    
    expect(screen.getByText('Content')).toHaveClass('custom-content');
  });

  it('applies custom className to CardFooter', () => {
    render(
      <Card>
        <CardFooter className="custom-footer">Footer</CardFooter>
      </Card>
    );
    
    expect(screen.getByText('Footer')).toHaveClass('custom-footer');
  });
});
