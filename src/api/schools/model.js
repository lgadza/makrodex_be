import { DataTypes } from "sequelize";
import sequelize from "../../db.js";
import createHttpError from "http-errors";

const SchoolModel = sequelize.define("school", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {
        msg: "Name is mandatory and cannot be null.",
      },
      notEmpty: {
        msg: "Name is mandatory and cannot be empty.",
      },
    },
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {
        msg: "Address is mandatory and cannot be null.",
      },
      notEmpty: {
        msg: "Address is mandatory and cannot be empty.",
      },
    },
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {
        msg: "City is mandatory and cannot be null.",
      },
      notEmpty: {
        msg: "City is mandatory and cannot be empty.",
      },
    },
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {
        msg: "Email is mandatory and cannot be null.",
      },
      notEmpty: {
        msg: "Email is mandatory and cannot be empty.",
      },
      isEmail: {
        msg: "Email must be a valid email address.",
      },
    },
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {
        msg: "Phone number is mandatory and cannot be null.",
      },
      notEmpty: {
        msg: "Phone number is mandatory and cannot be empty.",
      },
    },
  },
  instagram: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  school_type: {
    type: DataTypes.ENUM("private", "public"),
    allowNull: false,
    validate: {
      isIn: {
        args: [["private", "public"]],
        msg: "School type must be 'private' or 'public'.",
      },
    },
  },
  boarding_school: {
    type: DataTypes.ENUM("boarding", "day"),
    allowNull: false,
    validate: {
      isIn: {
        args: [["boarding", "day"]],
        msg: "Boarding school must be 'boarding' or 'day'.",
      },
    },
  },
  principal: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {
        msg: "Principal is mandatory and cannot be null.",
      },
      notEmpty: {
        msg: "Principal is mandatory and cannot be empty.",
      },
    },
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {
        msg: "Description is mandatory and cannot be null.",
      },
      notEmpty: {
        msg: "Description is mandatory and cannot be empty.",
      },
    },
  },
  logoUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

export default SchoolModel;
