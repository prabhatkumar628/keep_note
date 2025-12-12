import multer from "multer";

const uploader = (folderName) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/temp/" + folderName);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix);
    },
  });

  return multer({ storage });
};

const avatarUploader = uploader("avatar");
const coverUploader = uploader("cover");

export { avatarUploader, coverUploader };
