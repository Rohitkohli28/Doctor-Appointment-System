const express = require('express');
const router = express.Router();
const {
  getMyHistory,
  upsertMyHistory,
  uploadDocument,
  removeDocument,
  getPatientHistory,
  getMyHistoryRecords
} = require('../controllers/medicalHistoryController');
const { protect } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

router.get('/my', protect, roleCheck('patient'), getMyHistoryRecords);

router.route('/me')
  .get(protect, roleCheck('patient'), getMyHistory)
  .post(protect, roleCheck('patient'), upsertMyHistory);

router.post('/me/documents', protect, roleCheck('patient'), upload.single('file'), uploadDocument);
router.delete('/me/documents/:docId', protect, roleCheck('patient'), removeDocument);

router.get('/patient/:patientId', protect, roleCheck('doctor'), getPatientHistory);

module.exports = router;
