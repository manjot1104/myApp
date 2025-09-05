const Redis = require("ioredis");

const pub = new Redis();  // publish
const sub = new Redis();  // subscribe

sub.on("connect", () => console.log("Redis Subscriber Connected"));
pub.on("connect", () => console.log("Redis Publisher Connected"));

module.exports = { pub, sub };
