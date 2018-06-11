//app.js
App({
  baseurl: "https://wx.wzjbbus.com",
  debug: false,
  onLaunch: function () {
    // 展示本地存储能力
    //var logs = wx.getStorageSync('logs') || []
    //logs.unshift(Date.now())
    //wx.setStorageSync('logs', logs);
    //指示时候为企业微信
    var systemres = wx.getSystemInfoSync();
    //console.log(systemres.environment)
    if (systemres.environment == 'wxwork') {
      this.globalData.iswork = true;
    }
  },
  globalData: {
    userInfo: null,
    iswork: false
  }
})