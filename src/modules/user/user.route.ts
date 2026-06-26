import { Router, type Request, type Response } from "express";
import { userController } from "./user.controller";
import { auth } from "../../middleware/auth";
import { USER_ROLES } from "../../types/index.role";

const router = Router()

router.post('/', userController.createUser)

router.get('/', auth(USER_ROLES.maintainer), userController.getAllUsers)

router.get('/:id', userController.getSingleUser)

router.put('/:id', userController.updateUser)

router.delete('/:id', userController.deleteUser )



export const userRoute = router