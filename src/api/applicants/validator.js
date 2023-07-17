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
  date_of_birth: {
    in: ["body"],
    isString: {
      errorMessage: "date of birth is mandatory field!",
    },
  },
  citizenship: {
    in: ["body"],
    isString: {
      errorMessage: "citizenship is mandatory field and needs to be a string!",
    },
  },

  phone_number: {
    in: ["body"],
    isString: {
      errorMessage: "phone_number is mandatory field !",
    },
  },
};

export const checkApplicantSchema = checkSchema(applicantSchema);
export const triggerBadRequest = (req, res, next) => {
  const errors = validationResult(req);
  console.log(errors);
  if (!errors.isEmpty()) {
    next(
      createHttpError(400, "Errors during applicant validation", {
        errorsList: errors.array(),
      })
    );
  } else {
    next();
  }
};
