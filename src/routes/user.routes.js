import { Router } from "express";
import { changeUserPassword, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateCoverImage, updateUserAvatar } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser);

router.route("/login").post(loginUser)

// secured routes

router.route("/logout").post(verifyJwt, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/updateAccountDetails").post(verifyJwt, updateAccountDetails)
router.route("/changeUserPassword").post(verifyJwt, changeUserPassword)
router.route("/getCurrentUser").post(verifyJwt, getCurrentUser)
router.route("/updateUserAvatar").post(verifyJwt,
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
    ]), 
    updateUserAvatar)
router.route("/updateCoverImage").post(verifyJwt,
    upload.fields([
        {
            name: "coverImage",
            maxCount: 1
        },
    ]),
    updateCoverImage)

export default router