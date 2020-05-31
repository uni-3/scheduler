var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var helmet = require("helmet");
var session = require("express-session");
var passport = require("passport");

// load model
var User = require("./models/user");
var Schedule = require("./models/schedule");
var Availability = require("./models/availability");
var Candidate = require("./models/candidate");
var Comment = require("./models/comment");

User.sync().then(() => {
  Schedule.belongsTo(User, { foreignKey: "creadtedBy" });
  Schedule.sync();
  Comment.belongsTo(User, { foreignKey: "userId" });
  Comment.sync();
  Availability.belongsTo(User, { foreignKey: "userId" });
  Candidate.sync().then(() => {
    Availability.belongsTo(Candidate, { foreignKey: "candidateId" });
    Availability.sync();
  });
});

var GitHubStrategy = require("passport-github2").Strategy;
var GITHUB_CLIENT_ID = "ee11f3fe56b392c2f4d9";
var GITHUB_CLIENT_SECRET = "3ea659a9b3e1dfde660764426255fd0d32e6ba53";

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(
  new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:8000/auth/github/callback",
  }, function (accessToken, refreshToken, profile, done) {
    process.nextTick(() => {
      //return done(null, profile);
      User.upsert({
        userId: profile.id,
        username: profile.username,
      }).then(() => {
        done(null, profile);
      });
    });
  }),
);

var indexRouter = require("./routes/index");
var loginRouter = require("./routes/login");
var logoutRouter = require("./routes/logout");
var schedulesRouter = require("./routes/schedules");
var availabilitiesRouter = require("./routes/availabilities");
var commentsRouter = require("./routes/comments");

var app = express();
app.use(helmet());

app.use(session({
  secret: "963db459d21c2eed", //生成した文字列
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/login", loginRouter);
app.use("/logout", logoutRouter);
app.use("/schedules", schedulesRouter);
app.use("/schedules", availabilitiesRouter);
app.use("/schedules", commentsRouter);

app.get(
  "/auth/github",
  passport.authenticate("github", {
    scope: ["user:email"],
  }),
  (req, res) => {
  },
);

app.get(
  "/auth/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/login",
  }),
  (req, res) => {
    var loginFrom = req.cookies.loginFrom;

    // loginFromが内部URLとしてセットされていたら
    if (
      loginFrom && !loginFrom.includes("http://") &&
      !loginFrom.includes("https://")
    ) {
      res.clearCookie("loginFrom");
      res.redirect(loginFrom);
    } else {
      res.redirect("/");
    }
  },
);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
