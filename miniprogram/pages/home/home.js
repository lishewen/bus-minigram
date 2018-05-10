//home.js
const util = require('../../utils/util.js')
const app = getApp()

Page({
  data: {
    imgUrls: [
      'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg',
      'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg',
      'http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg'
    ],
    focused: false,
    bgtype: 2
  },
  bgBtn: function () {
    switch (this.data.bgtype) {
      //默认蓝
      case 1:
        wx.setNavigationBarColor({
          frontColor: "#ffffff",
          backgroundColor: "#1E82D2"
        });
        this.data.bgtype++;
        break;
      //姨妈红
      case 2:
        wx.setNavigationBarColor({
          frontColor: "#ffffff",
          backgroundColor: "#ff0304"
        });
        this.data.bgtype++;
        break;
      //珍宝黄
      case 3:
        wx.setNavigationBarColor({
          frontColor: "#000000",
          backgroundColor: "#FFED8F"
        });
        this.data.bgtype++;
        break;
      //原谅色
      case 4:
        wx.setNavigationBarColor({
          frontColor: "#ffffff",
          backgroundColor: "#56C83C"
        });
        this.data.bgtype++;
        break;
      default:
        wx.setNavigationBarColor({
          frontColor: "#ffffff",
          backgroundColor: "#1E82D2"
        });
        this.data.bgtype = 1;
        break;
    }
  },
  searchFocus: function () {
    this.setData({
      focused: true
    })
    this.searchInit();
  },
  tapCancel: function () {
    this.routes = null;
    this.stops = null;
    this.setData({
      focused: false,
      history: null,
      searchText: '',
      searchStops: null,
      searchRoutes: null
    })
  },
  searchConfirm: function (event) {
    var searchText = event.detail.value;
    this.setData({
      searchText: searchText
    })
    this.search(searchText)
  },
  searchInput: function (event) {
    var searchText = event.detail.value;
    this.setData({
      searchText: searchText
    })
    this.search(searchText)
  },
  searchClear: function (event) {
    this.setData({
      focused: true,
      searchText: '',
      searchStops: null,
      searchRoutes: null
    })
    this.searchInit();
  },
  searchInit: function () {
    var history = util.loadHistory();
    this.setData({
      history: history ? history : []
    })
  },
  search: function (word) {
    var self = this;
    let foldCount = 4;
    wx.request({
      url: app.baseurl + "/api/bus/findRouteByName?routeName=" + encodeURIComponent(word),
      success: function (res) {
        if (res.data.result != 0) {
          wx.showToast({
            image: "/resources/error-empty.png",
            title: res.data.message
          })
          return;
        }
        var items = res.data.items;
        var routes = [];
        for (var i in items) {
          var item = items[i];
          routes.push(item.routes[0]);
        }
        self.routes = routes;
        self.setData({
          searchRoutes: routes.slice(0, foldCount),
          routeFold: routes.length > foldCount
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

    wx.request({
      url: app.baseurl + "/api/bus/findStopByName?stopName=" + encodeURIComponent(word),
      success: function (res) {
        if (res.data.result != 0) {
          wx.showToast({
            image: "/resources/error-empty.png",
            title: res.data.message
          })
          return;
        }
        var items = res.data.items;
        var stops = [];
        for (var i in items) {
          var item = items[i];
          stops.push(item.stops[0]);
        }
        self.stops = stops;
        self.setData({
          searchStops: stops.slice(0, foldCount),
          stopFold: stops.length > foldCount
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
  routeMore: function () {
    this.setData({
      searchRoutes: this.routes,
      routeFold: false
    })
  },
  stopMore: function () {
    this.setData({
      searchStops: this.stops,
      stopFold: false
    })
  },
  tapSearchRoute: function (e) {
    var ds = e.currentTarget.dataset;
    util.saveHistory({
      type: "route",
      routeId: ds.routeid,
      routeName: ds.routename
    })
  },
  tapSearchStop: function (e) {
    var ds = e.currentTarget.dataset;
    util.saveHistory({
      type: "stop",
      stopId: ds.stopid,
      stopName: ds.stopname
    })
  },
  isLoad: false,
  onLoad: function () {
    this.isLoad = true;
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
          url: app.baseurl + "/api/bus/findNearbyStop?lat=" + latitude + "&lng=" + longitude,
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
                direction: item.direction,
                origin: item.origin,
                terminal: item.terminal,
                firstBus: util.formatBusTime(item.firstBus || "--"),
                lastBus: util.formatBusTime(item.lastBus || "--"),
                airPrice: item.airPrice
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
            wx.stopPullDownRefresh();
            self.isLoad = false;
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
  },
  onShow: function () {
    if (!this.isLoad)
      this.reloadData();
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
