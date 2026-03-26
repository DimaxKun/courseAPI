const User = require('../models/User');
const bcrypt = require('bcrypt');
const auth = require("../auth"); 
const { errorHandler } = require("../auth");


module.exports.checkEmailExists = (req, res) => {

    if (req.body.email.includes("@")) {

        return User.find({ email : req.body.email })
        .then(result => {
            if (result.length > 0) {

                return res.status(409).send({ message: "Duplicate email found" });
            } else {
                return res.status(200).send({ message: "No duplicate email found" });
            };
        })
        .catch(error => errorHandler(error, req, res));

    } else {

        res.status(400).send({ message: "Invalid email format"});
    }
};


module.exports.registerUser = (req, res) => {

    if (!req.body.email.includes("@")){
        return res.status(400).send({ message: 'Invalid email format' });
    }

    else if (req.body.mobileNo.length !== 11){
        return res.status(400).send({ message: 'Mobile number is invalid' });
    }
    
    else if (req.body.password.length < 8) {
        return res.status(400).send({ message: 'Password must be atleast 8 characters long' });
    
    } else {

        let newUser = new User({
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            email : req.body.email,
            mobileNo : req.body.mobileNo,
            password : bcrypt.hashSync(req.body.password, 10)
        })

        return newUser.save()
        .then((result) => res.status(201).send({
            message: 'User registered successfully',
            user: result
        }))
        .catch(error => errorHandler(error, req, res));

    }
};


module.exports.loginUser = (req, res) => {

    if (req.body.email.includes("@")) {

        return User.findOne({ email : req.body.email })
        .then(result => {

            if(result == null){

                return res.status(404).send({ message: 'No email found' });

            } else {

                const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);

                if (isPasswordCorrect) {

                    return res.status(200).send({ 
                        message: 'User logged in successfully',
                        access : auth.createAccessToken(result)
                    })

                } else {

                    return res.status(401).send({ message: 'Incorrect email or password' });
                }
            }
        })
        .catch(error => errorHandler(error, req, res));

    } else {

        return res.status(400).send({ message: 'Invalid email format' });
    }
}


module.exports.getProfile = (req,res) => {

    return User.findById(req.user.id)
    .then(user => {
        if(!user){
            
            return res.status(403).send({ message: 'User not found' });

        } else {

            user.password = "";
            return res.status(200).send(user);
        }  
    })
    .catch(error => errorHandler(error, req, res));

};


module.exports.resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const { id } = req.user; // Extracting user ID from the authorization header

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    // Hashing the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Updating the user's password in the database
    await User.findByIdAndUpdate(id, { password: hashedPassword });

    // Sending a success response
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



module.exports.updateProfile = async (req, res) => {
  try {
    // Get the user ID from the authenticated token
    const userId = req.user.id;

    // Retrieve the updated profile information from the request body
    const { firstName, lastName, mobileNo } = req.body;

    // Update the user's profile in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, mobileNo },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send({ message: "User not found" });
    }

    updatedUser.password = "";
    res.send(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Failed to update profile' });
  }
}

