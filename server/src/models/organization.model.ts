import mongoose, { Schema, Types } from "mongoose";

export interface IEmail {
  _id?: Types.ObjectId;
  email: string;
}

const emailSchema = new Schema<IEmail>(
  {
    email: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: true }
);

export interface ISubOrganization {
  _id?: Types.ObjectId;
  name: string;
  emails: IEmail[];
}

const subOrganizationSchema = new Schema<ISubOrganization>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    emails: [emailSchema],
  },
  { _id: true }
);

export interface IOrganization {
  teamId: Types.ObjectId;
  name: string;
  emails: IEmail[];
  subOrganizations: ISubOrganization[];
  isDeleted: boolean;
}

const organizationSchema = new Schema<IOrganization>(
  {
    teamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    emails: [emailSchema],
    subOrganizations: [subOrganizationSchema],
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

organizationSchema.index({ teamId: 1, name: 1, isDeleted: 1 });

const Organization = mongoose.model<IOrganization>(
  "Organization",
  organizationSchema
);

export default Organization;