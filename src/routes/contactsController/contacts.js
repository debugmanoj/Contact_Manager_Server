import expres from "express"
import contact from "../../controllers/contactController.js"

const router=expres.Router()

router.post("/:id",contact.createContact)
router.get("/:id",contact.getUserContacts)
router.delete("/:userId/:contactId",contact.deleteContact)
router.put("/:userId/:contactId",contact.updateContact)

export default router;