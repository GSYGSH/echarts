<template>
  <div class="com-container">
      <div class="com-chart" ref="hot_ref">

      </div>
      <span class="iconfont arr-left" @click='toLeft' :style='comStyle'>&#xe6ef;</span>
      <span class="iconfont arr-right" @click="toRight" :style='comStyle'>&#xe6ed;</span>
      <span class="cat-name" :style='comStyle'>{{catName}}</span>
  </div>
</template>

<script>
import { getThemeValue } from '@/utils/theme_utils.js'
import {mapState} from 'vuex'
export default {
    data(){
        return {
            chartInstance:null,
            allData:[],
            currentIndex:0,//当前一级分类数据
            titleFontSize:0,
            a:this.$store.theme
        }
    },
    created(){
        this.$socket.registerCallback('hotData', this.getData)
    },
    mounted(){
        this.initChart()
        /* this.getData() */
        this.$socket.send({
            action: 'getData',
            socketType: 'hotData',
            chartName: 'hot',
            value: ''
        })
        window.addEventListener('resize',this.screenAdapter)
        this.screenAdapter()
    },
    destroyed(){
        window.removeEventListener('resize',this.screenAdapter)
        this.$socket.unRegisterCallback('hotData')
    },
    computed:{
        catName(){
            if(this.allData.length === 0){
                return ''
            }else{
                return this.allData[this.currentIndex].name
            }
        },
        comStyle(){
            return {
                fontSize:this.titleFontSize + 'px',
                color:getThemeValue(this.theme).titleColor
            }
        },
        ...mapState(['theme'])
    },
    watch:{
        theme(){
            /* 销毁当前图表 */
            this.chartInstance.dispose()
            /* 重新初始化 */
            this.initChart()
            this.screenAdapter()
            this.updateChart()
        }
    },
    methods:{
        initChart(){
            this.chartInstance = this.$echarts.init(this.$refs.hot_ref,this.theme)

            const initOption = {
                title:{
                    text:'▍热销商品的占比',
                    left:20,
                    top:20
                },
                legend:{
                    top:'15%',
                    icon:'circle'
                },
                tooltip:{
                    show:true,
                    formatter:(arg)=>{
                        const thirdCategory = arg.data.children
                        let total = 0
                        thirdCategory.forEach(item=>{
                            total += item.value
                        })
                        let retStr = ``
                        thirdCategory.forEach(item=>{
                            retStr += `${item.name}:${parseInt(item.value / total * 100) + '%'}<br/>`
                        })
                        return retStr
                    }
                },
                series:[
                    {
                        type:'pie',
/*                         label:{
                            show:false
                        }, */
                        emphasis:{
                            label:{
                                formatter:(arg)=>{
                                    return arg.name +'\n'+ arg.percent + '%'
                                },
                                fontWeight:'bold'
                            },
                            
                        },
/*                         labelLine:{
                            show:false
                        }, */
                    }
                ]
            }
            this.chartInstance.setOption(initOption)
        },
        /* async  */getData(ret){
            /* const {data:ret} = await this.$http.get('hotproduct') */
            this.allData = ret
            console.log(ret);
            this.updateChart()
        },
        updateChart(){
            const legendData = this.allData[this.currentIndex].children.map(item=>{
                return item.name
            })
            const seriesData = this.allData[this.currentIndex].children.map(item=>{
                return {
                    name:item.name,
                    value:item.value,
                    children:item.children
                }
            })
            const dataOption = {
                legend:{
                    data:legendData
                },
                series:[
                    {
                        data:seriesData
                    }
                ]
            }
            this.chartInstance.setOption(dataOption)
        },
        screenAdapter(){
            this.titleFontSize = this.$refs.hot_ref.offsetWidth / 100 * 3.6
            const adapterOption ={
                title:{
                    textStyle:{
                        fontSize:this.titleFontSize
                    }
                },
                series:[
                    {
                        radius:this.titleFontSize * 4.5,
                        center:['50%','60%'],
                        emphasis:{
                            label:{
                                fontSize:this.titleFontSize /1.5
                            },
                        },
                    }
                ],
                legend:{
                    itemWidth:this.titleFontSize ,
                    itemHeight:this.titleFontSize ,
                    itemGap:this.titleFontSize / 2,
                    textStyle:{
                        fontSize:this.titleFontSize / 1.25
                    }
                },
            }
            this.chartInstance.setOption(adapterOption)
            this.chartInstance.resize()
        },
        toLeft(){
            this.currentIndex--
            if(this.currentIndex < 0){
                this.currentIndex = this.allData.length - 1
            }
            this.updateChart()
        },
        toRight(){
            this.currentIndex++
            if(this.currentIndex > this.allData.length - 1){
                this.currentIndex = 0
            }
            this.updateChart()
        }
    },

}
</script>

<style scoped lang='less'>
.arr-left{
    position: absolute;
    left:10%;
    top:50%;
    transform: translateY(-50%);
    cursor: pointer;
    color: #fff;
}
.arr-right{
    position: absolute;
    right:10%;
    top:50%;
    transform: translateY(-50%);
    cursor: pointer;
    color: #fff;
}
.cat-name{
    position: absolute;
    left:80%;
    bottom:20px;
    color: #fff;
}
</style>