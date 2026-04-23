import mongoose, { Document, Schema, Types } from "mongoose";

export interface IUser extends Document {
  teamId: Types.ObjectId;
  organizationId: Types.ObjectId;
  subOrganizationId?: Types.ObjectId | null;

  vorname: string;
  nachname: string;
  benutzername: string;
  email: string;
  telefonnummer: string;

  systemAdministrator: boolean;
  globalUserAdministrator: boolean;
  globalThirdLevelUser: boolean;

  isDeleted: boolean;
}

const userSchema = new Schema<IUser>(
  {
    teamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      index: true,
    },

    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    subOrganizationId: {
      type: Schema.Types.ObjectId,
      default: null,
      index: true,
    },

    vorname: {
      type: String,
      trim: true,
      required: true,
    },

    nachname: {
      type: String,
      trim: true,
      default: "",
    },

    benutzername: {
      type: String,
      trim: true,
      default: "",
    },

    email: {
      type: String,
      trim: true,
      required: true,
      lowercase: true,
      index: true,
    },

    telefonnummer: {
      type: String,
      trim: true,
      default: "",
    },

    systemAdministrator: {
      type: Boolean,
      default: false,
    },

    globalUserAdministrator: {
      type: Boolean,
      default: false,
    },

    globalThirdLevelUser: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

userSchema.index({ teamId: 1, organizationId: 1 });
userSchema.index({ teamId: 1, subOrganizationId: 1 });
userSchema.index({ teamId: 1, email: 1 });

const User = mongoose.model<IUser>("User", userSchema);

export default User;