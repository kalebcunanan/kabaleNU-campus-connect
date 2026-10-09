// server/utils/hotness.js
const calculateHotness = (reacts, comments, createdAt) => {
  const ageInMs = Date.now() - new Date(createdAt).getTime();
  const ageInHours = ageInMs / (1000 * 60 * 60);
  // Formula: (bulldogReacts + 2 * commentCount) / (ageInHours + 2) ^ 1.5
  return (reacts + 2 * comments) / Math.pow(ageInHours + 2, 1.5);
};

module.exports = calculateHotness;