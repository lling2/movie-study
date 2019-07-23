Page({
  data:{
    placeholder: '',
    movies: [],
    cinemas: [],
    value: '',
    stype: ''
  },
  onLoad(query){
    this.initPage(query);
  },
  initPage(query){
    console.log(query, 'aa');
    const _this = this;
    const stype = query['stype']; 
    stype === '-1' ? _this.setData({ stype, placeholder: '搜电影、搜影院' }) : _this.setData({ stype, placeholder: '搜影院' });
  },
  goBack(){
    wx.navigateBack({
      delta: 1
    })
  },
  search(e){
    const _this = this;
    const value = e.detail.value;
    const {stype} = this.data;
    _this.setData({value});
    wx.request({
      url: `https://m.maoyan.com/ajax/search?kw=${value}&cityId=57&stype=${stype}`, 
      success(res){
        console.log(res.data.movies);
        let movies = res.data.movies ? res.data.movies.list : [];
        movies = movies.map(item => {
          item.img = item.img.replace('w.h','128.180');
          return item;
        });
        _this.setData({ movies, cinemas: res.data.cinemas ? res.data.cinemas.list : []})
      }
    })
  }
})