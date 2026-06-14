import { Router } from 'express';
import { FonnteController } from '@/controllers/fonnte.controller';
import { asyncHandler } from '@/utils/async-handler';

const router = Router();

// Endpoint untuk me-request OTP (Reverse OTP flow)
router.post('/request-otp', asyncHandler(FonnteController.requestOtp));

// Endpoint untuk di-poll oleh Frontend untuk cek status verifikasi OTP
router.get('/check-otp-status/:code', asyncHandler(FonnteController.checkOtpStatus));

// Fonnte webhook usually sends POST requests
router.post('/webhook', asyncHandler(FonnteController.handleWebhook));

export const fonnteRouter = router;
