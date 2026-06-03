// Input validation helpers
const validateEmail = (email) => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const validateGroupInput = (data) => {
  const errors = [];
  
  if (!data.name || !data.name.trim()) {
    errors.push('Group name is required');
  }
  if (!data.description || !data.description.trim()) {
    errors.push('Description is required');
  }
  if (!data.subject || !data.subject.trim()) {
    errors.push('Subject is required');
  }
  if (data.maxMembers && (data.maxMembers < 2 || data.maxMembers > 500)) {
    errors.push('Max members must be between 2 and 500');
  }
  
  return errors;
};

const validateDiscussionInput = (data) => {
  const errors = [];
  
  if (!data.title || !data.title.trim()) {
    errors.push('Title is required');
  }
  if (!data.content || !data.content.trim()) {
    errors.push('Content is required');
  }
  
  return errors;
};

const validateAuthInput = (data) => {
  const errors = [];
  
  if (!data.email || !validateEmail(data.email)) {
    errors.push('Valid email is required');
  }
  if (!data.password || !validatePassword(data.password)) {
    errors.push('Password must be at least 6 characters');
  }
  if (data.name && !data.name.trim()) {
    errors.push('Name must not be empty');
  }
  
  return errors;
};

module.exports = {
  validateEmail,
  validatePassword,
  validateGroupInput,
  validateDiscussionInput,
  validateAuthInput,
};
