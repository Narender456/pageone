// No direct equivalent for interfaces in JavaScript, but we can define the structure using classes or plain objects.

class User {
  constructor(id, name, email, role, hasAccess, loginCount, isEmailVerified, createdAt, updatedAt, avatar = null, lastLogin = null, profile = {}, preferences = {}) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.role = role; // "user" or "admin"
    this.hasAccess = hasAccess;
    this.avatar = avatar;
    this.lastLogin = lastLogin;
    this.loginCount = loginCount;
    this.isEmailVerified = isEmailVerified;
    this.profile = profile; // { phone, address, dateOfBirth, bio }
    this.preferences = preferences; // { theme, notifications: { email, push } }
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

class AuthContextType {
  constructor(user = null, isLoading = false) {
    this.user = user;
    this.isLoading = isLoading;
  }

  async login(email, password) {
    // Implement login logic here
    return true; // Placeholder return value
  }

  logout() {
    // Implement logout logic here
  }

  async register(userData) {
    // Implement registration logic here
    return true; // Placeholder return value
  }

  async updateProfile(data) {
    // Implement profile update logic here
    return true; // Placeholder return value
  }
}

class LoginFormData {
  constructor(email, password) {
    this.email = email;
    this.password = password;
  }
}

