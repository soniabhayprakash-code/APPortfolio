// routes/api.js
const express = require('express');
const router = express.Router();
const { Contact, Visitor, Project, Blog } = require('../models');
const validator = require('validator');
const nodemailer = require('nodemailer');

// ─── Email Transporter ────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ─── CONTACT FORM ─────────────────────────────────────────────────────
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address.' });
    }
    if (name.length > 100 || subject.length > 200 || message.length > 2000) {
      return res.status(400).json({ success: false, message: 'Content too long.' });
    }

    // Save to DB
    const contact = await Contact.create({
      name: validator.escape(name),
      email: validator.normalizeEmail(email),
      subject: validator.escape(subject),
      message: validator.escape(message),
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Send Email Notification
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        await transporter.sendMail({
          from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
          to: process.env.EMAIL_TO || process.env.EMAIL_USER,
          subject: `[Portfolio] New Message: ${subject}`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
              <h2 style="color:#6ee7b7">New Portfolio Contact</h2>
              <table style="width:100%;border-collapse:collapse">
                <tr><td style="padding:8px;font-weight:bold">From:</td><td>${name} &lt;${email}&gt;</td></tr>
                <tr><td style="padding:8px;font-weight:bold">Subject:</td><td>${subject}</td></tr>
                <tr><td style="padding:8px;font-weight:bold">Message:</td><td>${message}</td></tr>
                <tr><td style="padding:8px;font-weight:bold">Time:</td><td>${new Date().toLocaleString()}</td></tr>
              </table>
            </div>
          `
        });
      } catch (emailErr) {
        console.error('Email error (non-critical):', emailErr.message);
      }
    }

    res.json({ success: true, message: 'Message received! I\'ll get back to you soon.', id: contact._id });
  } catch (err) {
    console.error('Contact error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ─── VISITOR TRACKING ─────────────────────────────────────────────────
router.post('/track', async (req, res) => {
  try {
    await Visitor.create({
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      page: req.body.page || '/',
      referrer: req.body.referrer || req.get('Referrer') || ''
    });
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false });
  }
});

// ─── PROJECTS (Public) ────────────────────────────────────────────────
router.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── BLOG (Public) ────────────────────────────────────────────────────
router.get('/blog', async (req, res) => {
  try {
    const posts = await Blog.find({ published: true }).sort({ createdAt: -1 }).select('-content');
    res.json({ success: true, data: posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/blog/:slug', async (req, res) => {
  try {
    const post = await Blog.findOneAndUpdate(
      { slug: req.params.slug, published: true },
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── RESUME DOWNLOAD ──────────────────────────────────────────────────
router.get('/resume', (req, res) => {
  const resumePath = require('path').join(__dirname, '..', 'public', 'resume.pdf');
  res.download(resumePath, 'Abhay_Prakash_Resume.pdf', (err) => {
    if (err) res.status(404).json({ message: 'Resume not found. Please upload resume.pdf to public/' });
  });
});

// ─── ADMIN ────────────────────────────────────────────────────────────
// Simple token-based auth middleware
const adminAuth = (req, res, next) => {
  const token = req.headers['x-admin-token'];
  if (token !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  next();
};

router.get('/admin/messages', adminAuth, async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/admin/analytics', adminAuth, async (req, res) => {
  try {
    const [totalVisitors, todayVisitors, totalMessages, unreadMessages] = await Promise.all([
      Visitor.countDocuments(),
      Visitor.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } }),
      Contact.countDocuments(),
      Contact.countDocuments({ read: false })
    ]);
    res.json({ success: true, data: { totalVisitors, todayVisitors, totalMessages, unreadMessages } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/admin/messages/:id/read', adminAuth, async (req, res) => {
  try {
    await Contact.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/admin/projects', adminAuth, async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.post('/admin/blog', adminAuth, async (req, res) => {
  try {
    const post = await Blog.create(req.body);
    res.json({ success: true, data: post });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
