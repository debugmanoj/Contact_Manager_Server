import expres from "express"
import userController from "../../controllers/userController.js"

const router=expres.Router()

router.post("/signUp",userController.signup)
router.post("/signIn",userController.signin)
router.post("/forgotPassword",userController.forgotPassword)
router.post("/resetPassword",userController.resetPassword)
router.post("/resetPassword",userController.resetPassword)

export default router;