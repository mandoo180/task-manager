const express = require('express');
const router = new express.Router();
const User = require('../models/user');
const auth = require('../middleware/authentication');
const multer = require('multer');
const sharp = require('sharp');

// httpstatuses.com << refer to this site to check
router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (err) {
    res.status(400).send();
  }
});

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => {
      return token.token !== req.token;
    });
    await req.user.save();

    res.send();
  } catch (err) {
    res.status(500).send(err);
  }
});

router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();

    res.send();
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get('/users/me', auth, async (req, res) => {
  res.send(req.user);
});

router.get('/users/:id', async (req, res) => {
  const _id = req.params.id;

  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).send();
    }
    res.send(user);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.post('/users', async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'age', 'password'];
  const isValidOperation = updates.every(update => {
    return allowedUpdates.includes(update);
  });

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid update operation' });
  }

  try {
    // const user = await User.findById(req.user._id);

    updates.forEach(update => {
      req.user[update] = req.body[update];
    });
    // to use middleware
    await req.user.save();

    // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    // if (!user) {
    //   return res.status(404).send();
    // }
    res.send(req.user);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.delete('/users/me', auth, async (req, res) => {
  try {
    // const user = await User.findByIdAndDelete(req.user._id);
    // if (!user) {
    //   return res.status(404).send();
    // }

    // return res.send(user);
    await req.user.remove();
    return res.send(req.user);
  } catch (err) {
    res.status(500).send(err);
  }
});

const upload = multer({
  limits: {
    fileSize: 2000000,
  },
  fileFilter(req, file, callback) {
    // regex101.com
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return callback(new Error('Please upload an image file.'));
    }

    callback(undefined, true);
  },
});

router.post(
  '/users/me/avatar',
  auth,
  upload.single('avatar'),
  async (req, res) => {
    try {
      const buffer = await sharp(req.file.buffer)
        .resize({ height: 250, width: 250 })
        .png()
        .toBuffer();
      req.user.avatar = buffer;
      await req.user.save();
      res.send();
    } catch (err) {
      res.status(500).send(err);
    }
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.delete('/users/me/avatar', auth, async (req, res) => {
  try {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error('Image not found');
    }

    res.set('Content-Type', 'image/png');
    res.send(user.avatar);
  } catch (err) {
    res.status(404).send();
  }
});

module.exports = router;
