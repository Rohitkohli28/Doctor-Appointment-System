const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctorById,
  getMyDoctorProfile,
  updateDoctorProfile,
  getAvailableSlots,
  getSpecializations,
  addReview,
  getReviews,
  approveDoctor
} = require('../controllers/doctorController');
const { protect } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { doctorCheck } = require('../middleware/doctorAuth');

router.get('/specializations', getSpecializations);
router.get('/profile/me', protect, doctorCheck, getMyDoctorProfile);

router.route('/')
  .get(getDoctors);

router.route('/:id')
  .get(getDoctorById)
  .put(protect, doctorCheck, updateDoctorProfile);

router.get('/:id/available-slots', getAvailableSlots);

router.route('/:id/reviews')
  .post(protect, roleCheck('patient'), addReview)
  .get(getReviews);

router.put('/admin/approve/:id', protect, roleCheck('admin'), approveDoctor);

module.exports = router;
