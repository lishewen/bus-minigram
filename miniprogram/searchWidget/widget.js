import render from 'template.compile';
import classObj from 'class';
import WidgetDom from 'WidgetDom/index';

// 模拟数据
const mockDataStr = '{"hk00700":["100","腾讯控股","00700","230.40","250.80","252.00","29585623.0","0","0","253.40","0","0","0","0","0","0","0","0","0","230.40","0","0","0","0","0","0","0","0","0","29585623.0","2017/05/10 16:10:01","-0.40","-0.16","255.40","249.20","230.40","29585623.0","7479275426.92","0","51.41","","0","0","2.47","23731.03","23731.03","TENCENT","0.24","255.40","153.70","0",""],"err_code":0, "err_msg": "" }';

Widget({
  onLoad(options) {
    const ctx = this.getContext();
    const { width, height } = options;
    let widgetData = options.query.widgetData;

    // 模拟后台返回数据
    widgetData = mockDataStr;

    widgetData = decodeURIComponent(widgetData);

    // 初始绘制
    WidgetDom.init({
      windowWidth: width,
      windowHeight: height,
      render,
      classObj,
      ctx,
      // layoutDebug: true,
      // imageDebug: 'images/design.png'
    });
    // 启用高度自适应
    WidgetDom.useDynamicHeight();
    // 有数据
    if (widgetData) {
      let data = this.processData(widgetData);
      // 返回正常
      if (data.err_code == 0) {
        WidgetDom.setData(data);
      } else {
        // 异常处理
      }
    }
  },
  onDataPush(options) {
    // 模拟后台返回数据
    options.data = mockDataStr;
    let data;
    // 有数据
    if (options.data) {
      data = this.processData(options.data);
      if (data.err_code == 0) {
        WidgetDom.setData(data);
      } else {
        // 异常处理
      }
    }
  },
  onTap(options) {
    return WidgetDom.handleTap(options);
  },
  processData(data) {
    data = JSON.parse(data);
    let self = this;
    let n = 'hk00700';
    let info = data[n];
    let unit;
    let dateTime = info[30] + '';
    if (n.indexOf('sh') === 0 || n.indexOf('sz') === 0) {
      unit = 'CNY'
    } else if (n.indexOf('hk') === 0 || n.indexOf('r_hk') === 0) {
      unit = 'HKD'
    } else if (n.indexOf('us') === 0) {
      unit = 'USD';
    }

    return {
      name: info[1],
      code: info[2],
      dateTime: dateTime,
      price: info[9],
      gains: Number(info[31]).toFixed(2),
      gainsPercent: info[32],
      unit: unit,
      err_code: 0
    };
  }
})