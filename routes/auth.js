const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const verifyToken = require('./validate-token');
const User = require('../models/User');

router.post('/register', async (req, res) => {
  try {
    const isEmailExist = await User.findOne({ email: req.body.email });

    if (isEmailExist) {
      return res.status(400).json({
        error: {
          code: 400,
          message: 'Email already in use.',
        },
      });
    }

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt);

    const user = new User({
      email: req.body.email,
      password,
    });

    await user.save();

    res.json({ email: req.body.email });
  } catch (error) {
    res.status(400).json({ error });
  }
});

router.post('/login', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).json({ error: { code: 400, message: 'User not found.' } });

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).json({ error: { code: 400, message: 'Password incorrect.' } });

  const token = jwt.sign(
    {
      email: user.email,
      id: user._id,
    },
    process.env.TOKEN_SECRET,
    { expiresIn: '8h' }
  );

  res.header('Authorization', token).json({ token });
});

router.get('/auth', verifyToken, async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    const user = await User.findById(decoded.id).select(['email']);

    if (!user) res.status(400).json({ message: 'User not found.' });

    res.json({ id: user._id, email: user.email });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token.' });
  }
});

module.exports = router;
