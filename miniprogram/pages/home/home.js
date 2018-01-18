//home.js
const util = require('../../utils/util.js')
const app = getApp()

Page({
  data: {

  },
  onLoad: function () {
    this.reloadData();
    // if (app.debug) {
    //   wx.navigateTo({
    //     // url: "/pages/route/route?routeId=732&stopId=41491"
    //     url: "/pages/route/route?routeId=518&stopId=51634"
    //   })
    // }
  },
  reloadData: function () {
    var self = this
    wx.getLocation({
      type: 'wgs84',//'gcj02', //返回可以用于wx.openLocation的经纬度
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        //console.log(res.latitude);
        //console.log(res.longitude);
        // debug
        if (app.debug) {
          //市政府
          //latitude = 30.128741;
          latitude = 23.476963
          //longitude = 120.085117;
          longitude = 111.279115;
        }

        app.latitude = latitude;
        app.longitude = longitude;

        console.log("latitude：" + latitude);
        console.log("longitude：" + longitude);

        wx.request({
          url: "https://jbwx.lishewen.com/api/bus/findNearbyStop?lat=" + latitude + "&lng=" + longitude,
          success: function (res) {
            var stops = [];
            for (var i in res.data) {
              var item = res.data[i];

              var stop = {
                stopId: item.stopId,
                amapId: item.amapId,
                stopName: item.stopName,
                userDistance: util.formatDistance(item.userDistance),
                routeName: item.routeName,
                routeId: item.routeId,
                nextStation: item.nextStation ? item.nextStation : "终点站",
                targetDistance: util.formatDistance(item.targetDistance || undefined),
                direction: item.direction
              };
              stops.push(stop)
            }
            self.setData({
              stops: stops
            })
          },
          fail: function () {
            wx.showToast({
              image: "/resources/error-network.png",
              title: '请求失败请重试',
            })
          },
          complete: function () {
            wx.stopPullDownRefresh()
          }
        })
      },
      fail: function (res) {
        wx.showToast({
          image: "/resources/error-location.png",
          title: '定位失败请重试'
        })
        wx.stopPullDownRefresh()
      }
    })
  },
  onPullDownRefresh: function () {
    this.reloadData();
  }
})
