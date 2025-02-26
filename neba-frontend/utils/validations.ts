import passwordValidator from 'password-validator';
import { toast } from 'react-hot-toast';

// Define error types for validation functions
interface LoginErrors {
  email?: string;
  password?: string;
}

interface ChangePasswordErrors {
  newPassword?: string;
  currentPassword?: string;
}

interface RegisterErrors {
  name?: string;
  email?: string;
  password?: string;
}

interface ForgotPasswordErrors {
  email?: string;
}

interface ResetPasswordErrors {
  password?: string;
  confirmPassword?: string;
}

// Login validation
export const loginValidate = (email: string, password: string): LoginErrors => {
  const errors: LoginErrors = {};
  const schema = new passwordValidator();
  schema
    .is()
    .has()
    .uppercase() // Must have uppercase letters
    .has()
    .lowercase() // Must have lowercase letters
    .has()
    .digits() // Must have digits
    .has()
    .symbols();

  if (!email) {
    errors.email = 'Email is required';
    toast.error('Email is required');
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.email = 'Invalid email format';
    toast.error('Invalid email format');
  } else if (!password) {
    errors.password = 'Password is required';
    toast.error('Password is required');
  } else if (password.length < 8) {
    errors.password = 'Password must be 8 characters long.';
    toast.error('Password must be 8 characters long.');
  } else if (!schema.validate(password)) {
    errors.password = 'Password must contain uppercase, lowercase, special letters, and digits.';
    toast.error('Password must contain uppercase, lowercase, special letters, and digits.');
  }

  return errors;
};

// Change password validation
export const changePasswordValidate = (newPassword: string, currentPassword: string): ChangePasswordErrors => {
  const errors: ChangePasswordErrors = {};
  const schema = new passwordValidator();
  schema
    .is()
    .has()
    .uppercase() // Must have uppercase letters
    .has()
    .lowercase() // Must have lowercase letters
    .has()
    .digits() // Must have digits
    .has()
    .symbols();

  if (!newPassword) {
    errors.newPassword = 'New password is required';
    toast.error('New password is required');
  } else if (newPassword.length < 8) {
    errors.newPassword = 'New password must be 8 characters long.';
    toast.error('New password must be 8 characters long.');
  } else if (!schema.validate(newPassword)) {
    errors.newPassword = 'New password must contain uppercase, lowercase, special letters, and digits.';
    toast.error('New password must contain uppercase, lowercase, special letters, and digits.');
  }

  if (!currentPassword) {
    errors.currentPassword = 'Current password is required';
    toast.error('Current password is required');
  }

  return errors;
};

// Sign up validation
export const registerValidate = (name: string, email: string, password: string): RegisterErrors => {
  const errors: RegisterErrors = {};
  const schema = new passwordValidator();
  schema
    .is()
    .has()
    .uppercase() // Must have uppercase letters
    .has()
    .lowercase() // Must have lowercase letters
    .has()
    .digits() // Must have digits
    .has()
    .symbols();

  if (!name) {
    errors.name = 'Name is required';
    toast.error('Name is required');
  } else if (!email) {
    errors.email = 'Email is required';
    toast.error('Email is required');
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.email = 'Invalid email format';
    toast.error('Invalid email format');
  } else if (!password) {
    errors.password = 'Password is required';
    toast.error('Password is required');
  } else if (password.length < 8) {
    errors.password = 'Password must be 8 characters long.';
    toast.error('Password must be 8 characters long.');
  } else if (!schema.validate(password)) {
    errors.password = 'Password must contain uppercase, lowercase, special letters, and digits.';
    toast.error('Password must contain uppercase, lowercase, special letters, and digits.');
  }

  return errors;
};

// Forgot password validation
export const forgotPasswordValidate = (email: string): ForgotPasswordErrors => {
  const errors: ForgotPasswordErrors = {};

  if (!email) {
    errors.email = 'Email is required';
    toast.error('Email is required');
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.email = 'Invalid email format';
    toast.error('Invalid email format');
  }

  return errors;
};

// Reset password validation
export const resetPasswordValidate = (password: string, confirmPassword: string): ResetPasswordErrors => {
  const errors: ResetPasswordErrors = {};
  const schema = new passwordValidator();
  schema
    .is()
    .has()
    .uppercase() // Must have uppercase letters
    .has()
    .lowercase() // Must have lowercase letters
    .has()
    .digits() // Must have digits
    .has()
    .symbols();

  if (!password) {
    errors.password = 'Password is required';
    toast.error('Password is required');
  } else if (password.length < 8) {
    errors.password = 'Password must be 8 characters long.';
    toast.error('Password must be 8 characters long.');
  } else if (!schema.validate(password)) {
    errors.password = 'Password must contain uppercase, lowercase, special letters, and digits.';
    toast.error('Password must contain uppercase, lowercase, special letters, and digits.');
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
    toast.error('Passwords do not match');
  }

  return errors;
};

// movie validation
interface AddMovieErrors {
  title?: string;
  releaseDate?: string;
  description?: string;
  posterUrl?: string;
  backdropUrl?: string;
  genres?: string;
  videoUrl?: string;
  runtime?: string;
  budget?: string;
  revenue?: string;
}

export const addMovieValidate = (
  title: string,
  videoUrl: string,
  description: string,
  posterUrl: string,
  backdropUrl: string,
  genres: string[],
  releaseDate?: string,
) => {
  const errors: AddMovieErrors = {};

  if (!title) {
    errors.title = 'Title is required';
    toast.error('Title is required');
    return errors;
  }

 if (releaseDate && !/^\d{4}-\d{2}-\d{2}$/.test(releaseDate)) {
    errors.releaseDate = 'Release Date must be in the format yyyy-mm-dd';
    toast.error('Release Date must be in the format yyyy-mm-dd');
    return errors;
  } else if (releaseDate && !isValidDate(releaseDate)) {
    errors.releaseDate = 'Invalid release date';
    toast.error('Invalid release date');
    return errors;
  }

  if (!description) {
    errors.description = 'Description is required';
    toast.error('Description is required');
    return errors;
  }

  if (!videoUrl) {
    errors.videoUrl = 'Video Url is required';
    toast.error('Video Url is required');
  } else if (!isValidUrl(videoUrl)) {
    errors.videoUrl = 'Video Url is invalid';
    toast.error('Video Url is invalid');
  }


  if (!posterUrl) {
    errors.posterUrl = 'Poster URL is required';
    toast.error('Poster URL is required');
    return errors;
  } else if(!isValidUrl(posterUrl)) {
    errors.posterUrl = 'Poster URL is invalid';
    toast.error('Poster URL is invalid');
    return errors;
  }

  if (!backdropUrl) {
    errors.backdropUrl = 'Backdrop URL is required';
    toast.error('Backdrop URL is required');
    return errors;
  } else if(!isValidUrl(backdropUrl)) {
    errors.backdropUrl = 'Backdrop URL is invalid';
    toast.error('Backdrop URL is invalid');
    return errors;
  }

  if (genres.length === 0) {
    errors.genres = 'At least one genre is required';
    toast.error('At least one genre is required');
    return errors;
  }

  return errors;
};

const isValidUrl = (urlString: string): boolean => {
  try {
    new URL(urlString);
    return true;
  } catch (e) {
    return false;
  }
};

const isValidDate = (dateString: string): boolean => {
  const dateParts = dateString.split('-');
  const year = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10);
  const day = parseInt(dateParts[2], 10);

  // Check month and day ranges
  if (month < 1 || month > 12) {
    return false;
  }

  // Days in each month
  const daysInMonth = [31, (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  return day > 0 && day <= daysInMonth[month - 1];
};
