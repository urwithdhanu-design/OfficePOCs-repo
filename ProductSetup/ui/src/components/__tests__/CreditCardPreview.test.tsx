import { render, screen } from '@testing-library/react';
import { CreditCardPreview } from '../CreditCardPreview';
import { ProductFeature } from '@/types/product';

const mockFeatures: ProductFeature[] = [
  {
    id: 'feature-1',
    name: 'Cashback Rewards',
    code: 'CASHBACK_01',
    description: 'Earn cashback on purchases',
    category: 'rewards',
  },
  {
    id: 'feature-2',
    name: 'Travel Insurance',
    code: 'TRAVEL_INS_01',
    description: 'Comprehensive travel coverage',
    category: 'insurance',
  },
];

describe('CreditCardPreview', () => {
  it('renders with Lloyds brand', () => {
    render(
      <CreditCardPreview
        brands={["lloyds"]}
        productName="Gold Card"
        features={[]}
      />
    );
    
    expect(screen.getByText('Lloyds')).toBeInTheDocument();
    expect(screen.getByText('Gold Card')).toBeInTheDocument();
  });

  it('renders with Halifax brand', () => {
    render(
      <CreditCardPreview
        brands={["halifax"]}
        productName="Platinum"
        features={[]}
      />
    );
    
    expect(screen.getByText('Halifax')).toBeInTheDocument();
  });

  it('renders with BOS brand', () => {
    render(
      <CreditCardPreview
        brands={["bos"]}
        productName="Premium Card"
        features={[]}
      />
    );
    
    expect(screen.getByText('Bank of Scotland')).toBeInTheDocument();
  });

  it('renders with MBNA brand', () => {
    render(
      <CreditCardPreview
        brands={["mbna"]}
        productName="Rewards Plus"
        features={[]}
      />
    );
    
    expect(screen.getByText('MBNA')).toBeInTheDocument();
  });

  it('shows default product name when not provided', () => {
    render(
      <CreditCardPreview
        brands={["lloyds"]}
        productName=""
        features={[]}
      />
    );
    
    expect(screen.getByText('Credit Card')).toBeInTheDocument();
  });

  it('displays "No features added yet" when features array is empty', () => {
    render(
      <CreditCardPreview
        brands={["lloyds"]}
        productName="Test Card"
        features={[]}
      />
    );
    
    expect(screen.getByText('No features added yet')).toBeInTheDocument();
  });

  it('renders feature list correctly', () => {
    render(
      <CreditCardPreview
        brands={["lloyds"]}
        productName="Test Card"
        features={mockFeatures}
      />
    );
    
    expect(screen.getByText('Cashback Rewards')).toBeInTheDocument();
    expect(screen.getByText('CASHBACK_01')).toBeInTheDocument();
    expect(screen.getByText('Travel Insurance')).toBeInTheDocument();
    expect(screen.getByText('TRAVEL_INS_01')).toBeInTheDocument();
  });

  it('shows Active Features heading', () => {
    render(
      <CreditCardPreview
        brands={["lloyds"]}
        productName="Test Card"
        features={mockFeatures}
      />
    );
    
    expect(screen.getByText('Active Features')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <CreditCardPreview
        brands={["lloyds"]}
        productName="Test Card"
        features={[]}
        className="custom-class"
      />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders card number placeholder', () => {
    render(
      <CreditCardPreview
        brands={["lloyds"]}
        productName="Test Card"
        features={[]}
      />
    );
    
    expect(screen.getByText('•••• •••• •••• ••••')).toBeInTheDocument();
  });

  it('renders valid thru placeholder', () => {
    render(
      <CreditCardPreview
        brands={["lloyds"]}
        productName="Test Card"
        features={[]}
      />
    );
    
    expect(screen.getByText('••/••')).toBeInTheDocument();
  });

  it('shows brand navigation when multiple brands selected', () => {
    render(
      <CreditCardPreview
        brands={["lloyds", "halifax"]}
        productName="Multi-Brand Card"
        features={[]}
      />
    );
    
    expect(screen.getByText('2 brands selected')).toBeInTheDocument();
  });
});
