import { Router } from "express";
import { issueController } from "./issue.controller";
import { auth } from "../../middleware/auth";

const router = Router()

router.post('/', auth("contributor", "maintainer"), issueController.createIssue)
router.get('/', auth("contributor", "maintainer"), issueController.getAllIssues)
router.get('/user', auth("contributor", "maintainer"), issueController.getAllIssuesCreatedByAnUser)
router.get('/:id', issueController.getSingleIssue)
router.put('/:id', auth("contributor", "maintainer"), issueController.updateIssue)
router.delete('/:id', auth("maintainer"), issueController.deleteIssue)
export const issueRoute = router