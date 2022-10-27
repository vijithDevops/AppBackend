const moment = require('moment');

export const EditFileName = (req, file, callback) => {
  callback(
    null,
    `${req.user.id}_${moment().format('YYYY-MM-DDTHH:mm:ss')}_${
      file.originalname
    }`,
  );
};
