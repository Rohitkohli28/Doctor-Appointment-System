const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  cancelAppointment,
  completeAppointment,
  rescheduleAppointment,
  getAppointmentDetails
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.post('/', protect, roleCheck('patient'), createAppointment);
router.get('/my', protect, roleCheck('patient'), getMyAppointments);
router.get('/doctor', protect, roleCheck('doctor'), getDoctorAppointments);

router.route('/:id')
  .get(protect, getAppointmentDetails);

router.put('/:id/cancel', protect, cancelAppointment);
router.put('/:id/complete', protect, roleCheck('doctor'), completeAppointment);
router.put('/:id/reschedule', protect, roleCheck('patient'), rescheduleAppointment);

module.exports = router;
