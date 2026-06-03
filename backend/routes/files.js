const express = require('express');
const router = express.Router();
const {
  uploadFile,
  getFilesByGroup,
  downloadFile,
  deleteFile
} = require('../controllers/fileController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.post('/upload', protect, upload.single('file'), uploadFile);
router.get('/group/:groupId', protect, getFilesByGroup);
router.get('/download/:id', protect, downloadFile);
router.delete('/:id', protect, deleteFile);

module.exports = router;

