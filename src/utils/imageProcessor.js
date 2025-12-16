import sharp from "sharp";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export const processAvatar = async (file, userId) => {
  const dir = `public/uploads/users/avatars/${userId}`;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const version = crypto.randomUUID();

  await sharp(file.path)
    .resize(256, 256)
    .webp({ quality: 80 })
    .toFile(`${dir}/original_${version}.webp`);

  await sharp(file.path)
    .resize(64, 64)
    .webp({ quality: 60 })
    .toFile(`${dir}/thumb_${version}.webp`);

  await sharp(file.path)
    .resize(512, 512)
    .webp({ quality: 85 })
    .toFile(`${dir}/large_${version}.webp`);

  fs.unlinkSync(file.path);

  return {
    original: `/uploads/users/avatars/${userId}/original_${version}.webp`,
    thumb: `/uploads/users/avatars/${userId}/thumb_${version}.webp`,
    large: `/uploads/users/avatars/${userId}/large_${version}.webp`,
  };
};
