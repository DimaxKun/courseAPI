const express = require("express");
const enrollmentController = require("../controllers/enrollment");
const auth = require("../auth");

const { verify } = auth;

const router = express.Router();



router.post('/enroll', verify, enrollmentController.enroll);

router.get('/get-enrollments', verify, enrollmentController.getEnrollments);

router.patch('/:enrollmentId/cancel', verify, enrollmentController.cancelEnrollment);


module.exports = router;