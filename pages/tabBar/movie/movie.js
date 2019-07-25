const app = getApp();
Page({
  data:{
    city: '正在定位...',
    switchItem: 0,
    // 正在上映数据
    movieList0: [],
    movieIds0: [],
    loadComplete0: false, ////‘正在上映’数据是否加载完 默认false
    // 即将上映数据
    expectList1: [],
    movieList1: [],
    movieIds1: [],
    loadComplete1: false, ////‘即将上映’数据是否加载到最后一条 默认false
    loadComplete2: false //表示水平加载
  },
  onLoad(){
    this.initPage();
  },
  onReady(){
    
  },
  initPage(){
    //https://www.jianshu.com/p/aaf65625fc9d   解释的很好
    if (app.globalData.userLocation && app.globalData.userLocation.length>0) {
      this.setData({
        city: app.globalData.selectCity ? app.globalData.selectCity.cityName : '定位失败'
      })
    } else {
      app.userLocationReadyCallback = () => {
        this.setData({
          city: app.globalData.selectCity ? app.globalData.selectCity.cityName : '定位失败'
        })
      }
    };
    this.firstLoad();
  },
  firstLoad(){
    const _this = this;
    wx.showLoading({
      title: '正在加载...',
    });
    wx.request({
      url: 'https://m.maoyan.com/ajax/comingList?token=&limit=10',
      success(res){
        _this.setData({
          movieList0: _this.formatImgUrl(res.data.coming, true),
          movieIds0: res.data.movieIds
        })
        if (res.data.coming.length >= res.data.movieIds.length+10){
          _this.setData({loadComplete0: true});
        }
        wx.hideLoading();
      },
      complete: () => {

      }
    })
  },
  // 监听用户上拉触底事件
  onReachBottom(){
    const {switchItem, movieList0, movieList1, movieIds0, movieIds1, loadComplete0, loadComplete1} = this.data;
    if (switchItem === 0){
      this.ReachBottom(movieList0, movieIds0, loadComplete0, 0);
    }else{
      this.ReachBottom(movieList1, movieIds1, loadComplete1, 1);
    }
  },

  //处理图片url的方法
  formatImgUrl(arr, cutTitle = false) {
    //先判断是否有返回值
    if(!Array.isArray(arr)){
      return; //直接退出该方法
    };
    let newArr = [];
    // 遍历数组，改变有的属性
    arr.forEach(item => {
      let title = item.comingTitle;
      if(cutTitle){
        // item.comingTitle.split(' ')[0]
        title = item.comingTitle.split(' ')[0];
      };
      let imgUrl = item.img.replace('w.h', '128.180');
      newArr.push({
        ...item,
        comingTitle: title,
        img: imgUrl
      });
    })
  return newArr;
  },

  // 切换
  switchHot(e){
    wx.showLoading({
      title: '正在加载...',
    })
    const _this = this;
    const item = e.target.dataset.item;
    _this.setData({switchItem: item});
    wx.request({
      url: 'https://m.maoyan.com/ajax/mostExpected?limit=10&offset=0&token=',
      success(res) {
        wx.hideLoading();//隐藏 loading 提示框
        _this.setData({
          expectList1: _this.formatImgUrl(res.data.coming, true)
        })
      }
    })
    wx.request({
      url: 'https://m.maoyan.com/ajax/comingList?token=&limit=10',
      success(res) {
        wx.hideLoading();// 隐藏loading提示框
        _this.setData({
          movieIds1: res.data.movieIds, //[]形式
          movieList1: _this.formatImgUrl(res.data.coming)
        })
      }
    })
  },

  lower(){
    const _this = this;
    const {expectList1, loadComplete2} = this.data;
    if (loadComplete2){
      return;
    }
    const length = expectList1.length;
    wx.request({
      url: `https://m.maoyan.com/ajax/mostExpected?limit=10&offset=${length}&token=`,
      success(res){
        _this.setData({
          expectList1: expectList1.concat(_this.formatImgUrl(res.data.coming, true)),
          loadComplete2: !res.data.coming.length || !res.data.paging.hasMore
        })
      }
    })
  },

  // 上拉触底刷新的加载函数
  ReachBottom(list, ids, load, item){
    const _this = this;
    if(load){
      return;
    };
    const length = list.length;
    if(length+10>=ids.length){
      _this.setData({[`loadComplete${item}`]: true});
    }
    let query = ids.slice(length, length+10).join('%2C');
    const url = `https://m.maoyan.com/ajax/moreComingList?token=&movieIds=${query}`
    wx.request({
      url,
      success(res){
        const arr = list.concat(_this.formatImgUrl(res.data.coming));
        _this.setData({[`movieList${item}`]: arr})
      }
    })
  },

  onShareAppMessage(){
    return {
      title: '快看看附近的电影院',
      path: 'pages/tabBar/movie/movie'
    }
  }
})