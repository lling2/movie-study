// //app.js
const QQMapWX = require('./assets/libs/qqmap-wx-jssdk.min.js');
let qqmapsdk;
// DJABZ-SZ6RF-4XOJQ-NPZOC-E35X7-73BPW
qqmapsdk = new QQMapWX({
  // key: 'MH2BZ-4WTK3-2D63K-YZRHP-HM537-HHBD3' 作者的密钥
  key: 'DJABZ-SZ6RF-4XOJQ-NPZOC-E35X7-73BPW' //我的密钥
});

App({
  onLaunch: function () {
    this.initPage()
  },
  initPage(){
    // 获取用户授权信息信息,防止重复出现授权弹框
    wx.getSetting({
      success: res => {
        // 已有权限直接获得信息，否则出现授权弹框
        res.authSetting['scope.userLocation'] ? this.getUserLocation() : this.getUserLocation();
      }
    })
  },
  //获取用户的位置信息
  getUserLocation() {
    const that = this;
    wx.getLocation({
      //成功授权
      success: (res) => {
        const latitude = res.latitude; //经度
        const longitude = res.longitude; //纬度
        // qqmapsdk.reverseGeocoder 提供由坐标到坐标所在位置的文字描述的转换。输入坐标返回地理位置信息和附近poi列表
        // 使用腾讯地图接口将位置坐标转出成名称（为什么弹框出出现两次？）
        qqmapsdk.reverseGeocoder({
          location:{
            //文档说location默认为当前位置可以省略，但是还是要手动加上，否则弹框会出现两次，手机端则出现问题
            latitude,
            longitude
          },
          success: function (res) {
            const cityFullname = res.result.address_component.city;
            const cityInfo = {
              latitude,
              longitude,
              cityName: cityFullname.substring(0, cityFullname.length-1),
              status: 1
            };
            that.globalData.userLocation = {...cityInfo} //浅拷贝对象
            that.globalData.selectCity = {...cityInfo} //浅拷贝对象
            console.log(that.globalData, 'that.globalData');
            if(this.userLocationReadyCallback){
              this.userLocationReadyCallback();
            }
          },
          fail: () => {
            this.globalData.userLocation = { status: 0 }
            //防止当弹框出现后，用户长时间不选择，
            if (this.userLocationReadyCallback) {
              this.userLocationReadyCallback()
            }
          }
        })
      }
    }) 
  },
  globalData: {
    userLocation: null, //用户的位置信息
    selectCity: null //用户切换的城市
  }
})