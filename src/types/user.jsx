// No direct equivalent of TypeScript interfaces in JavaScript, but we can define the structure using constructor functions or classes.

function User(id, name, email, role, hasAccess, lastLogin, avatar, loginCount, isEmailVerified, profile, preferences, createdAt, updatedAt) {
  this.id = id;
  this.name = name;
  this.email = email;
  this.role = role; // "user" or "admin"
  this.hasAccess = hasAccess;
  this.lastLogin = lastLogin; // optional
  this.avatar = avatar; // optional
  this.loginCount = loginCount;
  this.isEmailVerified = isEmailVerified;
  this.profile = profile || {}; // optional
  this.preferences = preferences || {}; // optional
  this.createdAt = createdAt;
  this.updatedAt = updatedAt;
}

function UserFormData(name, email, password, role, hasAccess) {
  this.name = name;
  this.email = email;
  this.password = password; // optional
  this.role = role; // "user" or "admin"
  this.hasAccess = hasAccess;
}

