import React from 'react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock genérico para íconos MUI
const MockIcon = ({ iconName, ...props }) => (
  <span data-testid={`icon-${iconName}`} {...props} />
);

Object.defineProperty(global.HTMLMediaElement.prototype, 'play', {
  configurable: true,
  value: vi.fn(() => Promise.resolve())
});

// Mock de MUI Icons
vi.mock('@mui/icons-material', () => ({
  Person: (props) => <MockIcon iconName="Person" {...props} />,
  Email: (props) => <MockIcon iconName="Email" {...props} />,
  Lock: (props) => <MockIcon iconName="Lock" {...props} />,
  HowToReg: (props) => <MockIcon iconName="HowToReg" {...props} />,
  Assignment: (props) => <MockIcon iconName="Assignment" {...props} />,
  KeyboardArrowLeft: (props) => <MockIcon iconName="KeyboardArrowLeft" {...props} />,
  KeyboardArrowRight: (props) => <MockIcon iconName="KeyboardArrowRight" {...props} />,
  Menu: (props) => <MockIcon iconName="Menu" {...props} />,
  Close: (props) => <MockIcon iconName="Close" {...props} />,
}));

// Mock de API
vi.mock('@services/api', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    default: {
      ...actual.default,
      post: vi.fn().mockResolvedValue({ data: {} }),
      get: vi.fn().mockResolvedValue({ data: {} }),
      put: vi.fn().mockResolvedValue({ data: {} }),
      delete: vi.fn().mockResolvedValue({ data: {} })
    }
  };
});

// Mock de react-router-dom (configuración completa)
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    Link: ({ children, to }) => <a href={to}>{children}</a>,
    NavLink: ({ children, to }) => <a href={to}>{children}</a>,
    useLocation: () => ({ pathname: '/' })
  };
});

// Mock de AuthContext
vi.mock('@context/AuthContext', () => ({
  AuthContext: {
    Provider: ({ children }) => children,
    Consumer: ({ children }) => children({})
  },
  useAuth: () => ({
    login: vi.fn(),
    logout: vi.fn(),
    user: { name: 'Test User', balance: 1000 }
  })
}));

// Configuración adicional para testing-library
beforeEach(() => {
  vi.clearAllMocks();
});