import mongoose, { Document, Schema } from "mongoose";

export interface IGlobalSettings {
  userAuth: {
    passkeys: boolean;
    passwordLoginEnabled: boolean;
    emailUser: boolean;
    smsUser: boolean;
  };
  mfa: {
    totp: boolean;
    emailMfa: boolean;
    smsMfa: boolean;
  };
}

export interface ITeam extends Document {
  name: string;
  email: string;
  password: string; // actual hashed password
  isDeleted: boolean;
  globalSettings: IGlobalSettings;
}

const globalSettingsSchema = new Schema<IGlobalSettings>(
  {
    userAuth: {
      passkeys: { type: Boolean, default: false },
      passwordLoginEnabled: { type: Boolean, default: false },
      emailUser: { type: Boolean, default: false },
      smsUser: { type: Boolean, default: false },
    },
    mfa: {
      totp: { type: Boolean, default: false },
      emailMfa: { type: Boolean, default: false },
      smsMfa: { type: Boolean, default: false },
    },
  },
  { _id: false }
);

const teamSchema = new Schema<ITeam>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    globalSettings: {
      type: globalSettingsSchema,
      default: () => ({
        userAuth: {
          passkeys: false,
          passwordLoginEnabled: false,
          emailUser: false,
          smsUser: false,
        },
        mfa: {
          totp: false,
          emailMfa: false,
          smsMfa: false,
        },
      }),
    },
  },
  { timestamps: true }
);

const Team = mongoose.model<ITeam>("Team", teamSchema);

export default Team;