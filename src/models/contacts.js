import mongoose from "../config/makeConnection.js"

const contactSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        name: String,
        phone: String,
        email: String,
    },
    {
      collection: "contacts",
      versionKey: false,
    }
  );

  const contactSchemaExport = mongoose.model("contacts", contactSchema);
export default contactSchemaExport;