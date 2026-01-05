const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getCategories,
    addCategory,
    updateCategory,
    deleteCategory,
} = require('../controllers/categoryController');

router.route('/')
    .get(protect, getCategories)
    .post(protect, addCategory);

router.route('/:id')
    .put(protect, updateCategory)
    .delete(protect, deleteCategory);

module.exports = router;
