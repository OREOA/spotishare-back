const express = require("express");
const playbackController = require("../services/playbackController");

const router = express.Router();

router.get("/", async (req, res) => {
  const session = await playbackController.getHostByUserId(
    req.spotishare.userId
  );
  
  res.json(
    session && {
      owner: session.owner,
      hash: session.hash,
    }
  );
});

router.get("/:hash", async (req, res) => {
  const session = await playbackController.getHostByHash(req.params.hash);
  res.json(
    session && {
      owner: session.owner,
      hash: session.hash,
    }
  );
});

router.post("/", async (req, res, next) => {
  const session = await playbackController.getHostByUserId(
    req.spotishare.userId
  );
  if (session) {
    return res.status(400).send("Active session already exists for host");
  } else {
    try {
      const hash = await playbackController.addHost(
        req.spotishare.accessToken,
        req.spotishare.refreshToken,
        req.spotishare.userId
      );
      return res.json({ hash });
    } catch (error) {
      console.log(error);
      next();
    }
  }
});

router.delete("/", async (req, res) => {
  const session = await playbackController.getHostByUserId(req.spotishare.userId);
  if (session) {
    playbackController.deleteHost(session);
    return res.sendStatus(200);
  }
  res.status(400).send("No active session");
});
module.exports = router;
