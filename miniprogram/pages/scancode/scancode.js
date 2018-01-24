const app = getApp()
const util = require('../../utils/util.js')

Page({
  scancode: function () {
    // 只允许从相机扫码
    wx.scanCode({
      onlyFromCamera: true,
      scanType: ['qrCode'],
      success: (res) => {
        wx.navigateTo({
          url: res.result,
        });
      },
      fail: (res) => {
        wx.navigateTo({
          url: '/pages/home/home',
        })
      }
    });
  },
  onLoad: function (options) {
    this.scancode();
  }
});