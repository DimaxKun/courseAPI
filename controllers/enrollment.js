const Enrollment = require("../models/enrollment");
const Course = require("../models/course");
const { errorHandler } = require("../auth");


module.exports.enroll = (req, res) => {

    console.log(req.user.id);
    console.log(req.body.enrolledCourses) ;

    if(req.user.isAdmin){
        
        return res.status(403).send({ message: 'Admin is forbidden' });
    }

    if (!Array.isArray(req.body.enrolledCourses) || req.body.enrolledCourses.length === 0) {
        return res.status(400).send({ success: false, message: "No course selected" });
    }

    const courseId = req.body.enrolledCourses[0]?.courseId;
    if (!courseId) {
        return res.status(400).send({ success: false, message: "Invalid course selection" });
    }

    return Course.findById(courseId)
        .then((course) => {
            if (!course) {
                return res.status(404).send({ success: false, message: "Course not found" });
            }

            if (!course.isActive) {
                return res.status(400).send({ success: false, message: "Course is currently unavailable" });
            }

            return Enrollment.findOne({
                userId: req.user.id,
                "enrolledCourses.courseId": courseId,
                status: "Enrolled",
            })
                .then((existingEnrollment) => {
                    if (existingEnrollment) {
                        return res.status(409).send({ success: false, message: "You are already enrolled in this course" });
                    }

                    let newEnrollment = new Enrollment({
                        userId: req.user.id,
                        enrolledCourses: [{ courseId }],
                        totalPrice: course.price
                    });

                    return newEnrollment.save()
                        .then(() => {
                            return res.status(201).send({
                                success: true,
                                message: "Enrolled successfully"
                            });
                        });
                });
        })
        .catch(error => errorHandler(error, req, res));
    
}


module.exports.getEnrollments = (req, res) => {
    return Enrollment.find({userId : req.user.id})
        .then(enrollments => {
            return res.status(200).send(enrollments);
        })
        .catch(error => errorHandler(error, req, res));
};


module.exports.cancelEnrollment = (req, res) => {
    const enrollmentId = req.params.enrollmentId;

    return Enrollment.findOne({ _id: enrollmentId, userId: req.user.id })
        .then((enrollment) => {
            if (!enrollment) {
                return res.status(404).send({ message: "Enrollment not found" });
            }

            if (enrollment.status === "Cancelled") {
                return res.status(400).send({ message: "Enrollment already cancelled" });
            }

            enrollment.status = "Cancelled";
            return enrollment.save().then(() =>
                res.status(200).send({ message: "Enrollment cancelled successfully" })
            );
        })
        .catch((error) => errorHandler(error, req, res));
};
