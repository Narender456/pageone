// No need to import React in JavaScript
// Interfaces are not directly translatable to JavaScript, but we can define the structure using objects

// StatCard structure
const StatCard = {
  title: '',
  value: '',
  change: '',
  icon: function(className) {} // Placeholder for a component type
};

// Activity structure
const Activity = {
  user: '',
  email: '',
  action: '',
  amount: '', // Optional, can be undefined
  time: '',
  avatar: '', // Optional, can be undefined
  initials: ''
};

// Order structure
const Order = {
  id: '',
  customer: '',
  email: '',
  status: 'completed', // Default value, can be one of the specified strings
  amount: '',
  date: ''
};

// NavigationItem structure
const NavigationItem = {
  title: '',
  url: '',
  icon: function(className) {} // Placeholder for a component type
};

