const {RtcTokenBuilder, RtmTokenBuilder, RtcRole, RtmRole} = require('./index');

const generateRtcToken = (req, resp) => {
  const appID = '8c37a2fb3050462c93069532561a8cf7';
  const appCertificate = '4a0d71b8bef94c32a0e1c2ead4240b2b';
  const channelName = req.query.channel || 'default_channel';
  const uid = req.query.uid || 2882341273;
  const role = RtcRole.PUBLISHER;

  const expirationTimeInSeconds = 360000;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  const tokenA = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, uid, role, privilegeExpiredTs);
  const tokenB = RtcTokenBuilder.buildTokenWithUserAccount(appID, appCertificate, channelName, uid.toString(), role, privilegeExpiredTs);

  resp.json({
    tokenWithUid: tokenA,
    tokenWithUserAccount: tokenB
  });
};

const generateRtmToken = (req, resp) => {
  const appID = "970CA35de60c44645bbae8a215061b33";
  const appCertificate = "5CFd2fd1755d40ecb72977518be15d3b";
  const account = req.query.account || "test_user_id";

  const expirationTimeInSeconds = 360000;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  const token = RtmTokenBuilder.buildToken(appID, appCertificate, account, RtmRole, privilegeExpiredTs);

  resp.json({
    rtmToken: token
  });
};

var express = require('express');
var {AccessToken} = require('agora-access-token');
var {Token, Privileges} = AccessToken;

var PORT = process.env.PORT || 8080;

var APP_ID = "aed0f686a9db428795280a1487bb53d5";
var APP_CERTIFICATE = "737f0fef179543f69a454b20e5965009";

var app = express();

function nocache(req, res, next) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
}

var generateAccessToken = function (req, resp) {
  resp.header('Access-Control-Allow-Origin', "*");

  var channel = req.query.channel;
  if (!channel) {
    return resp.status(500).json({ 'error': 'channel name is required' });
  }

  var uid = req.query.uid;
  if (!uid) {
    uid = 0;
  }

  var expiredTs = req.query.expiredTs;
  if (!expiredTs) {
    expiredTs = 3600;
  }

  var currentTs = Math.floor(Date.now() / 1000); // Current timestamp in seconds
  var expireTimestamp = currentTs + expiredTs; // Expiration timestamp

  var token = new Token(APP_ID, APP_CERTIFICATE, channel, uid);
  token.addPrivilege(Privileges.kJoinChannel, expireTimestamp);

  return resp.json({ 'token': token.build() });
};

app.get('/rtc_token', nocache, generateRtcToken);
app.get('/rtm_token', nocache, generateRtmToken);
app.get('/access_token', nocache, generateAccessToken);

app.listen(PORT, function () {
  console.log('Service URL http://127.0.0.1:' + PORT + "/");
  console.log('Channel Key request, /access_token?uid=[user id]&channel=[channel name]');
  console.log('Channel Key with expiring time request, /access_token?uid=[user id]&channel=[channel name]&expiredTs=[expire ts]');
});
