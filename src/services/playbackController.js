const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const { getMe } = require("../services/spotify");
let activeHosts = [];

const prisma = new PrismaClient();

exports.addHost = async (accessToken, refreshToken, userId) => {
  const hash = crypto.randomBytes(10).toString("hex");
  const user = await getMe(accessToken);

  await prisma.session.create({
    data: {
      id: hash,
      user: userId,
      name: user.display_name,
      imageUrl: user.images.length > 0 ? user.images[0].url : null,
      accessToken,
      refreshToken,
    },
  });
  return hash;
};

exports.deleteHost = async (session) => {
  await prisma.session.delete({
    where: {
      id: session.id,
    },
  });
};

exports.getHosts = () => activeHosts;

exports.getHostByHash = async (hash) => {
  if (activeHosts.find((host) => host.hash === hash)) {
    return activeHosts.find((host) => host.hash === hash);
  }
  const session = await prisma.session.findFirst({
    select: {
      id: true,
      user: true,
      name: true,
      imageUrl: true,
    },
    where: {
      id: hash,
    },
  });
  if (session) {
    return session;
  }
  return null;
};

exports.getHostByUserId = async (userId) => {
  if (activeHosts.find((host) => host.owner.id === userId)) {
    return activeHosts.find((host) => host.owner.id === userId);
  }
  const session = await prisma.session.findFirst({
    select: {
      id: true,
      user: true,
      name: true,
      imageUrl: true,
    },
    where: {
      user: userId,
    },
  });
  console.log(session);

  if (session) {
    return session;
  }
  return null;
};
