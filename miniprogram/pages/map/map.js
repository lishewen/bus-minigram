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
  flag: false,
  //mapCtx,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (!this.mapCtx || this.mapCtx == "undefined")
      this.mapCtx = wx.createMapContext('map');

    wx.setNavigationBarTitle({
      title: options.name
    })
    var stops = [];
    var currentStop;
    this.routeId = options["routeId"];

    wx.request({
      url: "https://jbwx.lishewen.com/api/bus/GetBusMap?amapId=" + this.routeId,
      success: function (res) {
        for (let item of res.data) {
          let iconPath = '/resources/bus.png';
          stops.push({
            id: Number(item.onBoardid),
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
              color: '#000000',
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
        if (getCurrentPages().pop() == self) {
          self.timeout = setInterval(self.loadBusData, self.interval * 1000);
        }
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

    for (let item of app.stops) {
      let size = 16;
      let iconPath = '/resources/stop.png';
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
        id: Number(10000 + item.stopId),
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
          color: '#000000',
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
        for (let item of busline.polyline.split(";")) {
          let latlng = item.split(',')
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
        wx.stopPullDownRefresh();
      }
    });
  },

  loadBusData: function () {
    //if (!this.mapCtx)
    //this.mapCtx = wx.createMapContext('map');
    let self = this;

    console.log('loadBusData:' + self.mapCtx);

    if (!self.mapCtx || self.mapCtx == "undefined") {
      //console.log(true);
      if (self.timeout) {
        clearInterval(self.timeout)
      }
      if (getCurrentPages().pop() == self) {
        self.timeout = setInterval(self.loadBusData, self.interval * 1000);
      }
      return;
    }

    //wx.showLoading();
    wx.request({
      url: "https://jbwx.lishewen.com/api/bus/GetBusMap?amapId=" + this.routeId,
      success: function (res) {
        for (let m of res.data) {
          self.moveMarker(m.onBoardid, m.纬度, m.经度);
        }
      },
      complete: function () {
        //wx.hideLoading();
        if (self.timeout) {
          clearInterval(self.timeout)
        }
        if (getCurrentPages().pop() == self) {
          self.timeout = setInterval(self.loadBusData, self.interval * 1000);
        }
      }
    });
  },

  moveMarker: function (markerId, latitude, longitude) {
    let self = this;
    if (self.flag)
      return;

    console.log('moveMarker:' + markerId);

    if (!self.mapCtx || self.mapCtx == "undefined") {
      return;
    }
    
    self.flag = true;
    //let mapCtx = wx.createMapContext('map');
    self.mapCtx.translateMarker({
      markerId: Number(markerId),
      autoRotate: false,
      rotate: 1,
      duration: 1000,
      destination: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      },
      fail: function (res) {
        console.log(res);
      },
      animationEnd: function () {
        console.log('animation end:' + markerId);
        self.flag = false;
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    //console.log(this.mapCtx);
    this.mapCtx = wx.createMapContext('map');
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.loadBusData();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    if (this.timeout) {
      clearInterval(this.timeout)
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    if (this.timeout) {
      clearInterval(this.timeout)
    }
  },

  regionchange(e) {
    this.loadBusData();
  },
  markertap(e) {
    console.log(e.markerId);
  },
  controltap(e) {
    if (e.controlId == 1)
      this.loadBusData();
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