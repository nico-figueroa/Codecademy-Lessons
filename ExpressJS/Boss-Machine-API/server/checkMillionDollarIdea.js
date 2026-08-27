const checkMillionDollarIdea = (req, res, next) => {
  const idea = req.body;
  const numWeeks = Number(idea.numWeeks);
  const weeklyRevenue = Number(idea.weeklyRevenue);
  if (isNaN(numWeeks) || isNaN(weeklyRevenue)) {
    res.status(400).send();
    return;
  } 
  if (numWeeks * weeklyRevenue >= 1000000) {
    next();
  } else {
    res.status(400).send();
  }
};

// Leave this exports assignment so that the function can be used elsewhere
module.exports = checkMillionDollarIdea;
