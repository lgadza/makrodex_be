import { checkSchema, validationResult } from "express-validator";
import createHttpError from "http-errors";

const applicantSchema = {
  first_name: {
    in: ["body"],
    isString: {
      errorMessage: "first-name is mandatory field and needs to be a string!",
    },
  },
  last_name: {
    in: ["body"],
    isString: {
      errorMessage: "last-name is mandatory field and needs to be a string!",
    },
  
  },
  email: {
    in: ["body"],
    isString: {
      errorMessage: "Email is mandatory field and needs to be a string!",
    },
  },
  gender: {
    in: ["body"],
    isString: {
      errorMessage: "gender is mandatory field and needs to be a string!",
    },
  },

  citizenship: {
    in: ["body"],
    isString: {
      errorMessage: "citizenship is mandatory field and needs to be a string!",
    },
  },
  date_of_birth: {
    in: ["body"],
    isDate:{
      errorMessage: "date_of_birth is mandatory field and needs to be a valid date!",
    },
    toDate: true,
  },
  gender: {
    in: ["body"],
    isString: {
      errorMessage: "gender is mandatory field and needs to be a string!",
    },
    isIn: {
      options: [["male", "female"]],
      errorMessage: "gender must be either 'male' or 'female'",
    },
  },
  phone_number: {
    in: ["body"],
    isString: {
      errorMessage: "phone_number is mandatory field !",
    },
  },
  password: {
    in: ["body"],
    isString: {
      errorMessage: "password is mandatory field!",
    },
  },
  data_process_acceptance: {
    in: ["body"],
    isBoolean: {
      errorMessage: "data_process_acceptance must be a valid boolean value (true or false)",
    },
  },
};

export const checkApplicantSchema = checkSchema(applicantSchema);

export const triggerBadRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);

    const errorResponse = {
      success: false,
      message: "Errors during applicant validation",
      errorsList: errorMessages,
    };
    return res.status(400).json(errorResponse);
  }
  next();
};
