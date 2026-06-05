// models/Contact.js
const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name too long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject too long']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message too long']
  },
  ip: { type: String },
  userAgent: { type: String },
  read: { type: Boolean, default: false },
  replied: { type: Boolean, default: false }
}, { timestamps: true });

const Contact = mongoose.model('Contact', contactSchema);

// models/Visitor.js
const visitorSchema = new mongoose.Schema({
  ip: { type: String },
  userAgent: { type: String },
  page: { type: String, default: '/' },
  referrer: { type: String },
  country: { type: String },
  device: { type: String }
}, { timestamps: true });

const Visitor = mongoose.model('Visitor', visitorSchema);

// models/Project.js
const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  tags: [{ type: String }],
  github: { type: String },
  demo: { type: String },
  image: { type: String },
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 }
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);

// models/Blog.js
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String },
  content: { type: String, required: true },
  tags: [{ type: String }],
  published: { type: Boolean, default: false },
  views: { type: Number, default: 0 }
}, { timestamps: true });

const Blog = mongoose.model('Blog', blogSchema);

module.exports = { Contact, Visitor, Project, Blog };
