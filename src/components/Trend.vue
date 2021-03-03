<template>
  <div class="com-container">
    <div class="title" :style='comStyle'>
        <span :style="comStyle">{{'▍'+ showTitle}}</span>
        <span class="iconfont title-icon" :style='comStyle' @click="showChoice = !showChoice">&#xe6eb;</span>
        <div class="select-com" v-show="showChoice" :style="marginStyle">
            <div class="select-item" v-for="item in selectTypes" :key="item.key" @click="handleSelect(item.key)" :style='comStyle'>
                {{item.text}}
            </div>
        </div>
    </div>
      <div class="com-chart" ref="trend_ref">

      </div>
  </div>
</template>

<script>
import { getThemeValue } from '@/utils/theme_utils.js'
import {mapState} from 'vuex'
export default {
    data(){
        return{
            chartInstance:null,
            allData:null,
            showChoice:false,//显示可选项
            choiceType:'map',
            titleFontSize:null
        }
    },
    created(){
        /* 注册回调函数 */
        this.$socket.registerCallback('trendData',this.getData)
    },
    mounted(){
        this.initChart()
        /* this.getData() */
        this.$socket.send({
        action: 'getData',
        socketType: 'trendData',
        chartName: 'trend',
        value: ''
        })
        window.addEventListener('resize',this.screenAdapter)
        this.screenAdapter()
    },
    destroyed(){
        window.removeEventListener('resize',this.screenAdapter)
        this.$socket.unRegisterCallback('trendData')
    },
    computed:{
        selectTypes(){
            if(!this.allData){
                return []
            }else{
                return this.allData.type.filter(item =>{
                    return item.key !== this.choiceType
                })
            }
        },
        showTitle(){
            if(!this.allData){
                return ''
            }else{
                return this.allData[this.choiceType].title
            }
        },
        /* 关联标题字体大小,做响应式 */
        comStyle(){
            return {
                fontSize:this.titleFontSize + 'px',
                color:getThemeValue(this.theme).titleColor
            }
        },
        marginStyle(){
            return {
                marginLeft:this.titleFontSize/2 + 'px',
                backgroundColor:getThemeValue(this.theme).backgroundColor
            }
        },
        ...mapState(['theme'])
    },
    watch:{
        theme(){
            this.chartInstance.dispose()
            this.initChart()
            this.screenAdapter()
            this.updateChart()
        }
    },
    methods:{
        initChart(){
            this.chartInstance = this.$echarts.init(this.$refs.trend_ref,this.theme)
            const initOption = {
                xAxis:{
                    type:'category',
                    boundaryGap:false
                },
                yAxis:{
                    type:"value",
                },
                grid:{
                    left:'3%',
                    top:'35%',
                    right:'4%',
                    bottom:'1%',
                    containLabel:true
                },
                tooltip:{
                    /* trigger:'axis', */
                    axisPointer:{
                        type:'cross'
                    }
                },
                legend:{
                    left:20,
                    top:'15%',
                    icon:'circle'
                }
            }
            this.chartInstance.setOption(initOption)
        },
        /* async */ getData(ret){
            /* const {data:ret} = await this.$http.get(`trend`) */
            this.allData = ret
            console.log(ret);
            this.updateChart()
        },
        updateChart(){
            // 半透明的颜色值
            const colorArr1 = [
                'rgba(11, 168, 44, 0.5)',
                'rgba(44, 110, 255, 0.5)',
                'rgba(22, 242, 217, 0.5)',
                'rgba(254, 33, 30, 0.5)',
                'rgba(250, 105, 0, 0.5)'
            ]
            // 全透明的颜色值
            const colorArr2 = [
                'rgba(11, 168, 44, 0)',
                'rgba(44, 110, 255, 0)',
                'rgba(22, 242, 217, 0)',
                'rgba(254, 33, 30, 0)',
                'rgba(250, 105, 0, 0)'
            ]
            /* 类目轴数据 */
            const timeArr = this.allData.common.month
            /* y轴数据 */
            const valueArr = this.allData[this.choiceType].data
            const seriesArr = valueArr.map((item,index)=>{
                return {
                    name:item.name,
                    type:'line',
                    data:item.data,
                    stack:this.choiceType,
                    areaStyle:{
                        color:new this.$echarts.graphic.LinearGradient(0,0,0,1,[
                            {offset:0,color:colorArr1[index]},
                            {offset:1,color:colorArr2[index]}
                        ])
                    }
                }
            })

            /* 获取legend 的name */
            const legendArr = valueArr.map(item=>{
                return item.name
            })

            const dataOption = {
                xAxis:{
                    data:timeArr,
                },
                legend:{
                    data:legendArr
                },
                series:seriesArr,
            }
            this.chartInstance.setOption(dataOption)
        },
        screenAdapter(){
            this.titleFontSize = this.$refs.trend_ref.offsetWidth / 100 * 3.6
            const adapterOption = {
                legend:{
                    itemWidth:this.titleFontSize,
                    itemHeight:this.titleFontSize,
                    itemGap:this.titleFontSize,
                    textStyle:{
                        fontSize:this.titleFontSize / 1.25,
                        
                    },
                }
            }
            this.chartInstance.setOption(adapterOption)
            this.chartInstance.resize()
        },
        handleSelect(currentType){
            this.choiceType = currentType
            this.updateChart()
            this.showChoice = false
        }
    }
}
</script>

<style scoped lang='less'>
.title{
    position: absolute;
    left: 20px;
    top: 20px;
    z-index: 10;
    color:#fff;
    .select-com{
        background-color: #222733;
    }
    .title-icon{
        margin-left: 10px;
        cursor: pointer;
    }
}

</style>