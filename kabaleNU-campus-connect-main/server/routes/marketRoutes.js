// server/routes/marketRoutes.js
const express = require('express');
const { protect } = require('../middlewares/auth');
const { uploadMarketImage } = require('../middlewares/upload');
const {
  createItem, getItems, getItem,
  updateItem, deleteItem, searchItems, updateItemStatus
} = require('../controllers/marketController');

const router = express.Router();

router.use(protect);

// PROCESSING 3: search must be before /:id
router.route('/search').get(searchItems);

router.route('/')
  .get(getItems)
  .post(uploadMarketImage, createItem);

router.route('/:id')
  .get(getItem)
  .put(uploadMarketImage, updateItem)
  .delete(deleteItem);

// PROCESSING 4: rule-based status transition
router.route('/:id/status').put(updateItemStatus);

module.exports = router;
