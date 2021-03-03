<template>
  <div class="screen-container" ref="screen" :style='containerStyle'>
      <section class="screen-img">
          <div class="screen-header">
            <span class="screen-img-left">{{ timer | dateFormat }}</span>
            <span class="screen-img-center">电商平台实时监控系统</span>
            <span class="screen-img-right">
                <img :src="themeSrc" alt="" @click="handleChangeTheme" class="themeStyle">
            </span>
          </div>
          <img :src='headerSrc' alt="" class="img">
      </section>
        <div class="body">
            <section class="screen-left">
                <div class="screen-box">
                    <div class="trend" :class='[fullScreenStatus.trend? "fullScreen" : ""]'>
                        <trend ref="trend"></trend>
                        <div class="resize">
                            <span :class="[fullScreenStatus.trend?'iconfont icon-expand-alt':'iconfont icon-expand-alt']" @click="changeSize('trend')"></span>
                        </div>
                    </div>
                    <div class="seller" :class='[fullScreenStatus.seller? "fullScreen" : ""]'>
                        <seller ref="seller"></seller>
                        <div class="resize">
                            <span :class="[fullScreenStatus.seller?'iconfont icon-expand-alt':'iconfont icon-expand-alt']" @click="changeSize('seller')"></span>
                        </div>
                    </div>
                </div>
            </section>
            <section class="screen-center">
                <div class="screen-box">
                    <div class="map" :class='[fullScreenStatus.map? "fullScreen" : ""]'>
                        <single-map ref="map"></single-map>
                        <div class="resize">
                            <span :class="[fullScreenStatus.map?'iconfont icon-expand-alt':'iconfont icon-expand-alt']" @click="changeSize('map')"></span>
                        </div>
                    </div>
                    <div class="rank" :class='[fullScreenStatus.rank? "fullScreen" : ""]'>
                        <rank ref="rank"></rank>
                        <div class="resize">
                            <span :class="[fullScreenStatus.rank?'iconfont icon-expand-alt':'iconfont icon-expand-alt']" @click="changeSize('rank')"></span>
                        </div>
                    </div>
                </div>
            </section>
            <section class="screen-right">
                <div class="screen-box">
                    <div class="hot" :class='[fullScreenStatus.hot? "fullScreen" : ""]'>
                        <hot ref="hot"></hot>
                        <div class="resize">
                            <span :class="[fullScreenStatus.hot?'iconfont icon-expand-alt':'iconfont icon-expand-alt']" @click="changeSize('hot')"></span>
                        </div>
                    </div>
                    <div class="stock" :class='[fullScreenStatus.stock? "fullScreen" : ""]'>
                        <stock ref="stock"></stock>
                        <div class="resize">
                            <span :class="[fullScreenStatus.stock?'iconfont icon-expand-alt':'iconfont icon-expand-alt']" @click="changeSize('stock')"></span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
      
  </div>
</template>

<script>
import Hot from '@/components/Hot.vue'
import SingleMap from '@/components/Map.vue'
import Rank from '@/components/Rank.vue'
import Seller from '@/components/Seller.vue'
import Stock from '@/components/Stock.vue'
import Trend from '@/components/Trend.vue'
import { getThemeValue } from '@/utils/theme_utils.js'
import { mapState } from 'vuex'

export default {
    created(){
        /* 注册回调函数recvData */
        this.$socket.registerCallback('fullScreen',this.recvData)
        this.$socket.registerCallback('themeChange',this.recvThemeChange)
        setInterval(()=>{
            this.nowTime = Date.now()
        },1000)
    },
    destroyed() {
        this.$socket.unRegisterCallback('fullScreen')
    },
    components:{
        Hot,
        SingleMap,
        Rank,
        Seller,
        Stock,
        Trend
    },
    data(){
        return {
            fullScreenStatus:{
                trend:false,
                seller:false,
                map:false,
                rank:false,
                hot:false,
                stock:false
            },
            nowTime:Date.now()
        }
    },
    computed:{
        ...mapState(['theme']),
        headerSrc () {
            return '/static/img/' + getThemeValue(this.theme).headerBorderSrc
        },
        themeSrc () {
            return '/static/img/' + getThemeValue(this.theme).themeSrc
        },
        containerStyle () {
            return {
                backgroundColor: getThemeValue(this.theme).backgroundColor,
                color: getThemeValue(this.theme).titleColor
            }
        },
        timer(){
            return this.nowTime
        }
    },
    methods:{
        changeSize(chartName){
            /* 改变fullScreenStatus状态值 */
            /* this.fullScreenStatus[chartName] = !this.fullScreenStatus[chartName] */
            const targetValue = !this.fullScreenStatus[chartName]
            this.$socket.send({
                action:'fullScreen',
                socketType:'fullScreen',
                chartName,
                value:targetValue
            })
        },
        recvData(data){
            /* 取出哪一个图表需要切换 */
            const chartName = data.chartName
            /* 取出切换的状态 */
            const targetValue = data.value
            this.fullScreenStatus[chartName] = targetValue
            this.$nextTick(()=>{
                this.$refs[chartName].screenAdapter()
            })
        },
        handleChangeTheme(){
/*             console.log(1);
            this.$store.commit('changeTheme') */
            this.$socket.send({
                action:'themeChange',
                socketType:'themeChange',
                chartName:'',
                value:''
            })
        },
        recvThemeChange(){
            this.$store.commit('changeTheme')
        }
    }
}
</script>

<style scoped lang='less'>
.screen-container{
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    background-color:#161522;
    color:#fff;
    font-size: 20px;
    .screen-img{
        width: 100%;
        .screen-header{
            min-width: 500px;
            /* width: 100%; */
            display: flex;
            .screen-img-left{
                width:40%;
                margin: 5px 0 0 10px
            }
            .screen-img-center{
                width: 60%;
                text-align: center;
                position: relative;
                top: 15px;
                font-weight: bold;
            }
            .screen-img-right{
                width: 40%;
                text-align: right;
                margin: 8px  10px 0 0;
                .themeStyle{
                    width: 30px;
                    z-index: 999;
                    cursor: pointer;
                    position: relative;
                }
            }            
        }
        .img{
            width: 100%;
            margin-top: -50px;
        }

    }
    .body{
        box-sizing: border-box;
        padding: 0 10px 10px 10px;
        width: 100%;
        height: 90%;
        display: flex;
        flex-wrap: nowrap;
        justify-content: space-evenly;
        section{
            width: 100%;
            height: 100%;
            /* flex: 1; */
        }
        .screen-center{
            /* flex:1.25; */
            margin:0 20px
        }
        .screen-box{
            width: 100%;
            height: 100%;
        }
        .screen-left{
            width: 27.6%;
            .trend{
                width: 100%;
                height: 50%;
                position: relative;
            }
            .seller{
                width: 100%;
                height: 47%;
                margin-top: 25px;
                position: relative;
            }                        
        }
        .screen-center{
            width:41.5%;
            .map{
                width: 100%;
                height: 60%;
                position: relative;
            }
            .rank{
                width: 100%;
                height: 37%;
                margin-top: 25px;
                position: relative;
            }
        }
        .screen-right{
            width:27.6%;
            .hot{
                width: 100%;
                height: 50%;
                position: relative;
            }
            .stock{
                width: 100%;
                height: 47%;
                margin-top: 25px;
                position: relative;
            }
        }

    }
.resize{
    position: absolute;
    right: 20px;
    top: 20px;
    cursor: pointer;
}
/* 全屏状态样式 */
.fullScreen{
    position: fixed!important;
    top: 0!important;
    left: 0!important;
    width: 100%!important;
    height: 100%!important;
    margin: 0!important;
    z-index: 999!important;
}
    
}
</style>