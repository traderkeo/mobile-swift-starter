import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

// Mock the useColorScheme hook (used by NativeWind Button)
jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: () => 'light',
}));

// Mock Ionicons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

describe('Button', () => {
  it('renders children correctly', () => {
    const { getByText } = render(<Button>Click me</Button>);
    expect(getByText('Click me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button onPress={onPress}>Press</Button>);

    fireEvent.press(getByText('Press'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button onPress={onPress} disabled>
        Disabled
      </Button>
    );

    fireEvent.press(getByText('Disabled'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows loading indicator when loading', () => {
    const { queryByText } = render(<Button loading>Loading</Button>);

    // Text should not be visible when loading
    expect(queryByText('Loading')).toBeNull();
  });

  it('does not call onPress when loading', () => {
    const onPress = jest.fn();
    render(
      <Button onPress={onPress} loading testID="loading-button">
        Loading
      </Button>
    );

    // Button should be disabled during loading
    expect(onPress).not.toHaveBeenCalled();
  });
});
