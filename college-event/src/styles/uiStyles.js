// Shared UI Styles for consistent design across all pages

export const pageContainerStyle = {
  minHeight: 'calc(100vh - 80px)',
  width: '100%',
  backgroundColor: '#f7fafc',
  padding: '40px 20px',
};

export const contentWrapperStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  width: '100%',
};

export const pageHeaderStyle = {
  marginBottom: '32px',
};

export const pageTitleStyle = {
  fontSize: '36px',
  fontWeight: '700',
  color: '#1a202c',
  marginBottom: '8px',
  lineHeight: '1.2',
};

export const pageSubtitleStyle = {
  fontSize: '16px',
  color: '#718096',
  lineHeight: '1.6',
};

// Card Styles
export const cardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
  padding: '24px',
  marginBottom: '20px',
  transition: 'all 0.2s ease',
};

export const cardHoverStyle = {
  ...cardStyle,
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
  transform: 'translateY(-2px)',
};

// Button Styles
export const primaryButtonStyle = {
  padding: '12px 24px',
  fontSize: '16px',
  fontWeight: '600',
  color: '#ffffff',
  backgroundColor: '#667eea',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
};

export const secondaryButtonStyle = {
  ...primaryButtonStyle,
  backgroundColor: '#ffffff',
  color: '#667eea',
  border: '2px solid #667eea',
};

export const dangerButtonStyle = {
  ...primaryButtonStyle,
  backgroundColor: '#e53e3e',
};

export const buttonHoverStyle = {
  backgroundColor: '#5568d3',
  transform: 'translateY(-1px)',
  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
};

// Input Styles
export const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  fontSize: '15px',
  border: '2px solid #e2e8f0',
  borderRadius: '8px',
  backgroundColor: '#ffffff',
  color: '#1a202c',
  transition: 'all 0.2s ease',
  boxSizing: 'border-box',
  outline: 'none',
};

export const inputFocusStyle = {
  borderColor: '#667eea',
  boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
};

export const selectStyle = {
  ...inputStyle,
  cursor: 'pointer',
  appearance: 'none',
  backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%234a5568\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  paddingRight: '40px',
};

// Label Styles
export const labelStyle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#2d3748',
  marginBottom: '8px',
  display: 'block',
};

// Error Styles
export const errorTextStyle = {
  color: '#e53e3e',
  fontSize: '13px',
  marginTop: '6px',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
};

export const errorBannerStyle = {
  backgroundColor: '#fed7d7',
  border: '1px solid #fc8181',
  color: '#c53030',
  padding: '12px 16px',
  borderRadius: '8px',
  fontSize: '14px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '20px',
};

// List/Grid Styles
export const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '20px',
  marginTop: '24px',
};

export const listItemStyle = {
  ...cardStyle,
  textDecoration: 'none',
  color: 'inherit',
  cursor: 'pointer',
  display: 'block',
};

export const listItemHoverStyle = {
  ...cardHoverStyle,
};

// Badge Styles
export const badgeStyle = {
  display: 'inline-block',
  padding: '4px 12px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase',
};

export const badgeColors = {
  STUDENT: { bg: '#bee3f8', text: '#2c5282' },
  ORGANIZER: { bg: '#fed7aa', text: '#c05621' },
  ADMIN: { bg: '#fbb6ce', text: '#97266d' },
  ACTIVE: { bg: '#c6f6d5', text: '#22543d' },
  INACTIVE: { bg: '#fed7d7', text: '#742a2a' },
  PAID: { bg: '#c6f6d5', text: '#22543d' },
  UNPAID: { bg: '#feebc8', text: '#7c2d12' },
};

// Loading Style
export const loadingStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '60px 20px',
  fontSize: '16px',
  color: '#718096',
};

// Empty State Style
export const emptyStateStyle = {
  textAlign: 'center',
  padding: '60px 20px',
  color: '#718096',
};

// Search Input Style
export const searchInputStyle = {
  ...inputStyle,
  marginBottom: '24px',
  fontSize: '16px',
};

// Pagination Styles
export const paginationStyle = {
  display: 'flex',
  gap: '12px',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: '32px',
  flexWrap: 'wrap',
};

export const paginationButtonStyle = {
  padding: '8px 16px',
  border: '2px solid #e2e8f0',
  borderRadius: '8px',
  cursor: 'pointer',
  backgroundColor: '#ffffff',
  color: '#4a5568',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'all 0.2s ease',
};

export const paginationButtonActiveStyle = {
  ...paginationButtonStyle,
  backgroundColor: '#667eea',
  color: '#ffffff',
  borderColor: '#667eea',
};

// Stats Card Style
export const statsCardStyle = {
  ...cardStyle,
  textAlign: 'center',
  padding: '32px',
};

export const statsNumberStyle = {
  fontSize: '36px',
  fontWeight: '700',
  color: '#667eea',
  marginBottom: '8px',
};

export const statsLabelStyle = {
  fontSize: '14px',
  color: '#718096',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

