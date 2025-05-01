import express from "express";
import userControllerRoute from "./userController/userController.js"
import contactsControllerRoute from "./contactsController/contacts.js"
const router=express.Router();


router.use("/user",userControllerRoute)

router.use("/contacts",contactsControllerRoute)

export default router