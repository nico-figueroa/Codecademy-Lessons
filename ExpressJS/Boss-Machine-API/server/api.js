const express = require('express');
const apiRouter = express.Router();
const {
  createMeeting,
  getAllFromDatabase,
  getFromDatabaseById,
  addToDatabase,
  updateInstanceInDatabase,
  deleteFromDatabasebyId,
  deleteAllFromDatabase,
} = require('./db');
const checkMillionDollarIdea = require('./checkMillionDollarIdea');

apiRouter.use(express.json());

const handleApiParam = (req, res, next, id, name) => {
  if (isNaN(id)) {
    return res.status(404).send();
  }
  const modelMap = {
    minionId: 'minions',
    ideaId: 'ideas',
    meetingId: 'meetings',
    workId: 'work',
  };
  const resourceMap = {
    minionId: 'minion',
    ideaId: 'idea',
    meetingId: 'meeting',
    workId: 'work',
  };
  const modelType = modelMap[name];
  const instance = getFromDatabaseById(modelType, id);
  if (!instance) {
    return res.status(404).send();
  }
  req.params[name] = id;
  req.body = req.body || {};
  req.body.id = id;
  req[resourceMap[name]] = instance;
  next();
};

['minionId', 'ideaId', 'meetingId', 'workId'].forEach((paramName) => {
  apiRouter.param(paramName, handleApiParam);
});

/* Minions routes */

apiRouter.get('/minions', (req, res, next) => {
  try {
    const allMinions = getAllFromDatabase('minions');
    res.send(allMinions);
  } catch (error) {
    next(error);
  }
});

apiRouter.get('/minions/:minionId', (req, res, next) => {
  try {
    const minion = getFromDatabaseById('minions', req.params.minionId);
    if (minion) {
      res.send(minion);
    } else {
      res.status(404).send();
    }
  } catch (error) {
    next(error);
  }
});

apiRouter.post('/minions', (req, res, next) => {
  try {
    const newMinion = addToDatabase('minions', req.body);
    res.status(201).send(newMinion);
  } catch (error) {
    next(error);
  }
});

apiRouter.put('/minions/:minionId', (req, res, next) => {
  try {
    const updatedMinion = updateInstanceInDatabase('minions', req.body);
    if (updatedMinion) {
      res.send(updatedMinion);
    } else {
      res.status(404).send();
    }
  } catch (error) {
    next(error);
  }
});

apiRouter.delete('/minions/:minionId', (req, res, next) => {
  try {
    const deletedMinion = deleteFromDatabasebyId('minions', req.params.minionId);
    if (deletedMinion) {
      res.status(204).send();
    } else {
      res.status(404).send();
    }
  } catch (error) {
    next(error);
  }
});

/* Ideas routes */

apiRouter.get('/ideas', (req, res, next) => {
  try {
    const allIdeas = getAllFromDatabase('ideas');
    res.send(allIdeas);
  } catch (error) {
    next(error);
  }
});

apiRouter.post('/ideas', checkMillionDollarIdea, (req, res, next) => {
  try {
    const newIdea = addToDatabase('ideas', req.body);
    res.status(201).send(newIdea);
  } catch (error) {
    next(error);
  }
});

apiRouter.get('/ideas/:ideaId', (req, res, next) => {
  try {
    const idea = getFromDatabaseById('ideas', req.params.ideaId);
    if (idea) {
      res.send(idea);
    } else {
      res.status(404).send();
    }
  } catch (error) {
    next(error);
  }
});

apiRouter.put('/ideas/:ideaId', (req, res, next) => {
  try {
    const updatedIdea = updateInstanceInDatabase('ideas', req.body);
    if (updatedIdea) {
      res.send(updatedIdea);
    } else {
      res.status(404).send();
    }
  } catch (error) {
    next(error);
  }
});

apiRouter.delete('/ideas/:ideaId', (req, res, next) => {
  try {
    const deletedIdea = deleteFromDatabasebyId('ideas', req.params.ideaId);
    if (deletedIdea) {
      res.status(204).send();
    } else {
      res.status(404).send();
    }
  } catch (error) {
    next(error);
  }
});

/* Meetings routes */

apiRouter.get('/meetings', (req, res, next) => {
  try {
    const allMeetings = getAllFromDatabase('meetings');
    res.send(allMeetings);
  } catch (error) {
    next(error);
  }
});

apiRouter.post('/meetings', (req, res, next) => {
  try {
    const newMeeting = createMeeting();
    const savedMeeting = addToDatabase('meetings', newMeeting);
    res.status(201).send(savedMeeting);
  } catch (error) {
    next(error);
  }
});
apiRouter.delete('/meetings/:meetingId', (req, res, next) => {
  try {
    const deletedMeeting = deleteFromDatabasebyId('meetings', req.params.meetingId);
    if (deletedMeeting) {
      res.status(204).send();
    } else {
      res.status(404).send();
    }
  } catch (error) {
    next(error);
  }
});
apiRouter.delete('/meetings', (req, res, next) => {
  try {
    deleteAllFromDatabase('meetings');  
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

apiRouter.get('/meetings/:meetingId', (req, res, next) => {
  try {
    const meeting = getFromDatabaseById('meetings', req.params.meetingId);
    if (meeting) {
      res.send(meeting);
    } else {
      res.status(404).send();
    }
  } catch (error) {
    next(error);
  }
});
apiRouter.put('/meetings/:meetingId', (req, res, next) => {
  try {
    const updatedMeeting = updateInstanceInDatabase('meetings', req.body);
    if (updatedMeeting) {
      res.send(updatedMeeting);
    } else {
      res.status(404).send();
    }
  } catch (error) {
    next(error);
  }
});

/* Work routes */

apiRouter.get('/minions/:minionId/work', (req, res, next) => {
  try {
    const allWork = getAllFromDatabase('work').filter(
      (work) => work.minionId === req.params.minionId
    );
    res.send(allWork);
  } catch (error) {
    next(error);
  }
});

apiRouter.post('/minions/:minionId/work', (req, res, next) => {
  try {
    const newWork = addToDatabase('work', { ...req.body, minionId: req.params.minionId });
    res.status(201).send(newWork);
  } catch (error) {
    next(error);
  }
});

apiRouter.put('/minions/:minionId/work/:workId', (req, res, next) => {
  if (req.work.minionId !== req.params.minionId) {
    return res.status(400).send();
  }
  try {
    const updatedWork = updateInstanceInDatabase('work', { ...req.body, minionId: req.params.minionId });
    if (updatedWork) {
      res.send(updatedWork);
    } else {
      res.status(404).send();
    }
  } catch (error) {
    next(error);
  }
});

apiRouter.delete('/minions/:minionId/work/:workId', (req, res, next) => {
  try {
    const deletedWork = deleteFromDatabasebyId('work', req.params.workId);
    if (deletedWork) {
      res.status(204).send();
    } else {
      res.status(404).send();
    }
  } catch (error) {
    next(error);
  }
});

/* Error handling middleware */
apiRouter.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send({ error: err.message });
});

module.exports = apiRouter;
