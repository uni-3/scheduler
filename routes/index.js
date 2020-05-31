const express = require("express");
const router = express.Router();
const Schedule = require("../models/schedule");

/* GET home page. */
router.get("/", function (req, res, next) {
  const title = "予定調整";
  if (req.user) {
    // 自分が作った予定を作成日順に並び替えて取得
    Schedule.findAll({
      where: {
        createdBy: req.user.id,
      },
      order: [["updatedAt", "DESC"]],
    }).then((schedules) => {
      res.render(
        "index",
        {
          title: title,
          user: req.user,
          schedules: schedules,
        },
      );
    });
  } else {
    res.render("index", { title: title, user: req.user });
  }
});

module.exports = router;
