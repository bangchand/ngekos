import { Request, Response } from 'express';
import { prisma } from '@/config/database';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';

export class FonnteController {
  public static requestOtp = async (req: Request, res: Response): Promise<void> => {
    let { phone } = req.body;
    let { name } = req.body;
    
    if (!phone) {
      res.status(400).json({ status: false, message: 'Phone wajib diisi' });
      return;
    }

    // Standardize phone number (remove non-digits, replace leading 0 with 62)
    phone = phone.replace(/\\D/g, '');
    if (phone.startsWith('0')) {
      phone = '62' + phone.substring(1);
    }

    // Default name ke phone jika kosong, nanti akan diupdate oleh webhook WA
    if (!name) {
      name = phone;
    }

    const uniqueCode = `REG-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Simpan ke database dengan expired time 15 menit
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    await prisma.otpRegistration.create({
      data: {
        code: uniqueCode,
        name,
        phone,
        expiresAt
      }
    });
    
    console.log('Kode dibuat di DB:', uniqueCode, 'untuk:', name, phone);

    res.status(200).json({
      status: true,
      message: 'Kode berhasil dibuat',
      data: {
        code: uniqueCode,
        instruction: `Silakan kirimkan pesan WhatsApp berisi teks "${uniqueCode}" ke nomor bot kami untuk verifikasi.`
      }
    });
  };

  public static handleWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
      const { device, sender, message, name } = req.body;

      let autoReplyMessage = "";

      if (message && message.toString().startsWith('REG-')) {
        const pendingData = await prisma.otpRegistration.findUnique({
          where: { code: message.toString() }
        });
        
        if (pendingData) {
          // Cek apakah sudah expired
          if (new Date() > pendingData.expiresAt) {
            autoReplyMessage = `Maaf, kode pendaftaran "${message}" sudah kedaluwarsa. Silakan coba daftar ulang.`;
          } else {
            const finalName = name || sender;
            autoReplyMessage = `Selamat ${finalName}! Nomor WhatsApp kamu (${sender}) telah berhasil diverifikasi dan akunmu sudah aktif. Terima kasih sudah mendaftar.`;
            
            // Generate dummy token untuk login (di real app, kamu insert ke tabel User dulu)
            const token = jwt.sign(
              { phone: pendingData.phone, name: finalName }, 
              env.JWT_SECRET || 'supersecret', 
              { expiresIn: '1h' }
            );

            // Jangan hapus data, tapi update statusnya agar bisa dibaca oleh Polling FE
            await prisma.otpRegistration.update({
              where: { id: pendingData.id },
              data: { 
                status: 'VERIFIED',
                token: token,
                name: finalName
              }
            });
            console.log(`SUCCESS: ${message} verified for ${finalName} via DB`);
          }
        } else {
          autoReplyMessage = `Maaf, kode pendaftaran "${message}" tidak valid atau tidak ditemukan. Silakan coba daftar ulang.`;
          console.log(`FAILED: ${message} not found in database`);
        }
      } else {
        autoReplyMessage = `Halo ${name || sender}, pesan kamu "${message}" sudah kami terima. Untuk verifikasi pendaftaran, silakan kirimkan kode REG-XXXX yang Anda terima.`;
      }

      console.log('Sending reply via Fonnte API:', autoReplyMessage);
      
      const fonnteToken = process.env.FONNTE_TOKEN || 'x6DHb1bS1iBhK1VWrUxs'; 

      await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: {
          'Authorization': fonnteToken
        },
        body: new URLSearchParams({
          target: sender,
          message: autoReplyMessage
        })
      });
      res.status(200).send('OK');
      
    } catch (error) {
      console.error('Fonnte Webhook Error:', error);
      res.status(200).send('Maaf, terjadi kesalahan pada server. Silakan coba lagi nanti.');
    }
  };

  /**
   * Endpoint untuk di-poll oleh Frontend
   * Frontend memanggil ini setiap 3 detik untuk mengecek apakah user sudah verifikasi di WA
   */
  public static checkOtpStatus = async (req: Request, res: Response): Promise<void> => {
    const code = req.params.code as string;

    const data = await prisma.otpRegistration.findUnique({
      where: { code }
    });

    if (!data) {
      res.status(404).json({ 
        status: 404, 
        message: 'Kode pendaftaran tidak ditemukan atau sudah kedaluwarsa',
        data: null
      });
      return;
    }

    if (data.status === 'VERIFIED' && data.token) {
      // Jika berhasil verified, kembalikan response yang rapi
      res.status(200).json({ 
        status: 200,
        message: 'User logged in successfully',
        data: {
          user: {
            id: data.id,
            email: `${data.phone}@wa.me`, // Sementara gunakan nomor HP sebagai email
            name: data.name,
            role: "USER",
            createdAt: data.createdAt,
            updatedAt: new Date()
          },
          token: data.token
        }
      });

      // Boleh hapus OTP setelah token terambil agar aman
      await prisma.otpRegistration.delete({ where: { id: data.id } });
    } else {
      // Masih pending
      res.status(200).json({
        status: 202, // 202 Accepted (processing)
        message: 'Menunggu verifikasi WhatsApp...',
        data: null
      });
    }
  };
}