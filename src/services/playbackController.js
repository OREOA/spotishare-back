const { Playback } = require("./playback");
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
let activeHosts = [];

const prisma = new PrismaClient();

exports.addHost = async (accessToken, refreshToken, userId) => {
  const hash = crypto.randomBytes(10).toString("hex");
  const playback = new Playback(accessToken, refreshToken, hash, userId);
  activeHosts.push(playback);
  await prisma.session.create({
    data: {
      id: hash,
      user: userId,
      accessToken,
      refreshToken,
    },
  });
  await playback.initOwner();
  return hash;
};

exports.deleteHost = async (host) => {
  host.terminate();
  activeHosts = activeHosts.filter((activeHost) => activeHost !== host);
  await prisma.song.deleteMany({
    where: {
      sessionId: host.hash,
    },
  });
  await prisma.artist.deleteMany({
    where: {
      sessionId: host.hash,
    },
  });
  await prisma.session.delete({
    where: {
      id: host.hash,
    },
  });
};

exports.getHosts = () => activeHosts;

exports.getHostByHash = async (hash) => {
  if (activeHosts.find((host) => host.hash === hash)) {
    return activeHosts.find((host) => host.hash === hash);
  }
  const session = await prisma.session.findUnique({
    where: {
      id: hash,
    },
  });
  if (session) {
    const playback = new Playback(
      session.accessToken,
      session.refreshToken,
      session.id,
      session.userId
    );
    activeHosts.push(playback);
    await playback.initOwner();
    return playback;
  }
  return null;
};

exports.getHostByUserId = async (userId) => {
  if (activeHosts.find((host) => host.owner.id === userId)) {
    return activeHosts.find((host) => host.owner.id === userId);
  }
  const session = await prisma.session.findFirst({
    where: {
      user: userId,
    },
  });
  if (session) {
    const playback = new Playback(
      session.accessToken,
      session.refreshToken,
      session.id,
      session.userId
    );
    activeHosts.push(playback);
    await playback.initOwner();
    return playback;
  }
  return null;
};
