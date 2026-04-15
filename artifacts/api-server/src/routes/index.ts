import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import walletRouter from "./wallet";
import productsRouter from "./products";
import ordersRouter from "./orders";
import paymentsRouter from "./payments";
import notificationsRouter from "./notifications";
import adminRouter from "./admin";
import settingsRouter from "./settings";
import categoriesRouter from "./categories";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(walletRouter);
router.use(productsRouter);
router.use(ordersRouter);
router.use(paymentsRouter);
router.use(notificationsRouter);
router.use(adminRouter);
router.use(settingsRouter);
router.use(categoriesRouter);

export default router;
