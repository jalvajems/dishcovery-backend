import { Router } from "express";
import container from "../DI/inversify.config";
import { FollowController } from "../controllers/implementation/follow.controller";
import TYPES from "../DI/types";
import { verifyAccess } from "../middlewares/verifyAccess";

const router = Router();
const followController = container.get<FollowController>(TYPES.IFollowController);

router.post("/follow", verifyAccess, followController.follow.bind(followController));
router.post("/unfollow", verifyAccess, followController.unfollow.bind(followController));
router.get("/is-following/:followingId", verifyAccess, followController.isFollowing.bind(followController));
router.get("/followers", verifyAccess, followController.getFollowerList.bind(followController));
router.get("/following", verifyAccess, followController.getFollowingList.bind(followController));
router.get("/stats/:userId", verifyAccess, followController.getStats.bind(followController));
router.get("/foodie-profile/:foodieId", verifyAccess, followController.getFoodieProfile.bind(followController));

export default router;
