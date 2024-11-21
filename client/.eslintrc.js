module.exports = {
    extends: ['react-app'],
    rules: {
      'react-hooks/exhaustive-deps': 'warn',
      'no-unused-vars': 'warn',
    },
    overrides: [
      {
        files: ['*.js', '*.jsx'],
        rules: {
          'no-unused-vars': ['warn', { 
            varsIgnorePattern: '^(React|AnimatePresence|FaSearch|user|Badge|motion|FaUsers|FaStar|Accordion|FaFilter|FaUserTie)$' 
          }]
        }
      }
    ]
  };