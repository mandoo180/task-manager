const express = require('express');
const router = new express.Router();
const Task = require('../models/task');
const auth = require('../middleware/authentication');

// filter: GET /tasks?completed=true
// pagination: GET /tasks?limit=10&skip=20
// sort: GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
  try {
    // const owner = req.user._id;
    // const tasks = await Task.find({ owner });

    // two ways of doing this

    const match = {};
    const sort = {};

    if (req.query.completed) {
      match.completed = req.query.completed === 'true';
    }

    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    await req.user
      .populate({
        path: 'tasks',
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort,
        },
      })
      .execPopulate();
    res.send(req.user.tasks);
    if (tasks.length === 0) {
      return res.status(400).send();
    }
    res.send(tasks);
  } catch (err) {
    res.status(500).send(err);
  }

  // Task.find({})
  //   .then(tasks => {
  //     if (!tasks) {
  //       return res.status(404).send('Not Found Any');
  //     }
  //     res.status(200).send(tasks);
  //   })
  //   .catch(error => {
  //     res.status(500).send(error);
  //   });
});

router.get('/tasks/:id', auth, async (req, res) => {
  try {
    const _id = req.params.id;
    const owner = req.user._id;
    const task = await Task.findOne({ _id, owner });
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (err) {
    res.status(500).send(err);
  }

  // Task.findById(_id)
  //   .then(task => {
  //     if (!task) {
  //       return res.status(404).send('Not Found');
  //     }
  //     res.status(200).send(task);
  //   })
  //   .catch(error => {
  //     res.status(500).send(error);
  //   });
});

router.post('/tasks', auth, async (req, res) => {
  try {
    const task = new Task({
      ...req.body,
      owner: req.user._id,
    });
    await task.save();
    res.status(201).send(task);
  } catch (err) {
    res.status(400).send(err);
  }

  // task
  //   .save()
  //   .then(() => {
  //     res.status(201).send(task);
  //   })
  //   .catch(error => {
  //     res.status(400).send(error);
  //   });
});

router.patch('/tasks/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['description', 'completed'];
  const isValidOperation = updates.every(update => {
    return allowedUpdates.includes(update);
  });

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid update operation' });
  }

  try {
    const _id = req.params.id;
    const owner = req.user._id;
    const task = await Task.findOne({ _id, owner });

    if (!task) {
      return res.status(404).send();
    }

    updates.forEach(update => {
      task[update] = req.body[update];
    });

    await task.save();

    // const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.send(task);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const _id = req.params.id;
    const owner = req.user._id;
    // const task = await Task.findByIdAndDelete({ _id, owner });
    const task = await Task.findOneAndDelete({ _id, owner });

    if (!task) {
      return res.status(404).send();
    }

    res.send(task);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
