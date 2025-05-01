import mongoose from "../config/makeConnection.js";

const userSchema = new mongoose.Schema(
    {
        name:String,
        email:{type:String},
        password:String,
    },
    {
      collection: "users",
      versionKey: false,
    }
  );

  const userSchemaExport = mongoose.model("users", userSchema);
export default userSchemaExport;