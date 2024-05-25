const { Schema } = require('mongoose');

const Model = new Schema(
  {
    code: {
      type: String,
      required: true,
      comment: 'code',
    },
    name: {
      type: String,
      required: true,
      comment: 'Name',
    },
    createdAt: {
      type: Date,
      required: false,
      comment: 'created At',
    },
    updatedAt: {
      type: Date,
      required: false,
      comment: 'updated At',
    },
  },
  { timestamps: true }
);

module.exports = (db) => {
  return db.model('basics', Model);
};
