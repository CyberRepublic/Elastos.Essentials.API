import log4js from "log4js";

log4js.configure({
  appenders: {
    stdout: { type: 'stdout' },
    essentialsApi: { type: 'dateFile', filename: 'logs/essentials-api.log', pattern: ".yyyy-MM-dd.log", compress: true, }
  },
  categories: { default: { appenders: ['stdout', 'essentialsApi'], level: 'info' } },
  pm2: true,
  pm2InstanceVar: 'INSTANCE_ID'
});

const logger = log4js.getLogger('essentialsApi');
export default logger;