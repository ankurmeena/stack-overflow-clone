import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  about: { type: String },
  tags: { type: [String] },
  joinedOn: { type: Date, default: Date.now },
  noOfAnswers: { type: Number, default: 0 },
  rewardPoints: { type: Number, default: 0 },
  badges: { type: Number, default: 0 },
  badge5to30: { type: Boolean, default: false }, 
  badge31to100: { type: Boolean, default: false }, 
  badge100Plus: { type: Boolean, default: false },
  loginInformation: [{
    Browser: String,
    Operating_System: String,
    Type_Of_System: String,
    IP_Address: String,
    Timing: { type: Date, default: Date.now },
  },]
});

export default mongoose.model("User", userSchema);
