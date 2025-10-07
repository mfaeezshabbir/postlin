module.exports = function mockNextAuth(sessionValue?: any) {
  const mod = require('next-auth');
  mod.getServerSession = jest.fn().mockResolvedValue(sessionValue);
  return mod;
};
