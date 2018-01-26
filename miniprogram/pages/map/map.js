// pages/map.js
const app = getApp()
const util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  interval: util.loadInterval(),
  markertap(e) {
    console.log(e.markerId);
  },
  controltap(e) {
    if (e.controlId == 1)
      this.loadBusData();
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: options.name
    })
    var stops = [];
    var currentStop;
    this.routeId = options["routeId"];

    wx.request({
      url: "https://jbwx.lishewen.com/api/bus/GetBusMap?amapId=" + this.routeId,
      success: function (res) {
        for (var item of res.data) {
          var iconPath = '/resources/bus.png';
          stops.push({
            id: 'bus_' + item.onBoardid,
            iconPath: iconPath,
            latitude: item.纬度,
            longitude: item.经度,
            color: "#1e82d2FF",
            fillColor: "#FFFFFFFF",
            width: 24,
            height: 12,
            anchor: {
              x: 0.5,
              y: 0.5
            },
            callout: {
              display: 'ALWAYS',
              content: item.onBoardid,
              fontSize: 14,
              borderRadius: 8,
              padding: 5,
              bgColor: '#FFF68F',
              textAlign: 'center'
            }
          });
        }
        self.setData({
          markers: stops
        });

        if (self.timeout) {
          clearInterval(self.timeout)
        }

        self.timeout = setInterval(self.loadBusData, self.interval * 1000);
      },
      fail: function (res) {
        wx.showToast({
          image: "/resources/error-network.png",
          title: '请求失败请重试',
        })
      },
      complete: function () {
        wx.stopPullDownRefresh()
      }
    });

    for (var item of app.stops) {
      var size = 16;
      var iconPath = '/resources/stop.png';
      if (item == app.stops[0]) {
        iconPath = '/resources/begin.png';
        size = 20;
      } else if (item == app.stops[app.stops.length - 1]) {
        iconPath = '/resources/end.png';
        size = 20;
      }
      if (item.stopId == options.stopId) {
        currentStop = item;
      }
      stops.push({
        id: item.stopId,
        iconPath: iconPath,
        latitude: item.latitude,
        longitude: item.longitude,
        color: "#1e82d2FF",
        fillColor: "#FFFFFFFF",
        width: size,
        height: size,
        anchor: {
          x: 0.5,
          y: 0.5
        },
        callout: {
          display: item.stopId == options.stopId ? 'ALWAYS' : 'BYCLICK',
          content: item.stopName,
          fontSize: 14,
          borderRadius: 8,
          bgColor: '#FFF68F',
          padding: 5,
          textAlign: 'center'
        }
      });
    }
    var self = this;
    self.setData({
      latitude: currentStop.latitude,
      longitude: currentStop.longitude
    });

    wx.request({
      url: 'https://jbwx.lishewen.com/json/route/' + this.routeId + '.json',
      success: function (res) {
        var busline = res.data.buslines[0];
        if (!busline) {
          wx.showToast({
            image: "/resources/error-empty.png",
            title: '未找到线路',
          })
          return;
        }
        var points = []
        for (var item of busline.polyline.split(";")) {
          var latlng = item.split(',')
          points.push({
            longitude: Number(latlng[0]),
            latitude: Number(latlng[1])
          })
        }
        self.setData({
          polyline: [{
            points: points,
            color: "#00ff00FF",
            width: 6,
            arrowLine: true
          }],
          markers: stops,
          controls: [{
            id: 1,
            iconPath: '/resources/refresh.png',
            position: {
              left: 0,
              top: 300 - 50,
              width: 48,
              height: 48
            },
            clickable: true
          }]
        })
      },
      fail: function (res) {
        wx.showToast({
          image: "/resources/error-network.png",
          title: '请求失败请重试',
        })
      },
      complete: function () {
        wx.stopPullDownRefresh()
      }
    });
  },

  loadBusData: function () {
    var self = this;
    wx.request({
      url: "https://jbwx.lishewen.com/api/bus/GetBusMap?amapId=" + this.routeId,
      success: function (res) {
        for (var item of res.data) {
          self.translateMarker('bus_' + item.onBoardid, item.纬度, item.经度);
        }
      }
    });
  },

  translateMarker: function (markerId, latitude, longitude) {
    //let mapCtx = wx.createMapContext('map');
    this.mapCtx.translateMarker({
      markerId: markerId,
      //autoRotate: true,
      duration: 1000,
      destination: {
        latitude: latitude,
        longitude: longitude,
      },
      animationEnd() {
        console.log('animation end');
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.mapCtx = wx.createMapContext('map');
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    if (this.timeout) {
      clearInterval(this.timeout)
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '梧州珍宝 智慧公交',
      path: '/pages/home/home',
      success: function (res) {
        // 转发成功
      },
    }
  }
})