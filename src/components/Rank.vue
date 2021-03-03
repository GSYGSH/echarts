<template>
  <div class="com-container">
      <div class="com-chart" ref="rank_ref">

      </div>
  </div>
</template>

<script>
import {mapState} from 'vuex'
export default {
    data(){
        return {
            chartInstance:null,
            allData:[],
            startValue:0,
            endValue:9,
            timerID:null
        }
    },
    created(){
        this.$socket.registerCallback('rankData',this.getData)
    },
    mounted(){
        this.initChart(),
        /* this.getData(), */
        this.$socket.send({
            action:'getData',
            socketType:'rankData',
            chartName:'rank',
            value:''
        })
        window.addEventListener('resize',this.screenAdapter)
        this.screenAdapter()
    },
    destroyed(){
        window.removeEventListener('resize',this.screenAdapter)
        clearInterval(this.timerID)
        this.$socket.unRegisterCallback('rankData')
    },
    computed:{
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
            this.chartInstance = this.$echarts.init(this.$refs.rank_ref,this.theme)

            const initOption = {
                title:{
                    text:'▍地区销售排行',
                    left:20,
                    top:20
                },
                grid:{
                    top:'40%',
                    left:'5%',
                    right:'5%',
                    bottom:'5%',
                    containLabel:true
                },
                tooltip:{
                    show:true
                },
                xAxis:{
                    type:'category'
                },
                yAxis:{
                    type:'value'
                },
                series:[
                    {
                        type:'bar',
                        label:{
                            show:true,
                            position:'top',
                            textStyle:{
                                color:'#fff'
                            }
                        }
                    }
                ]
            }
            this.chartInstance.setOption(initOption)

            this.chartInstance.on('mouseover',()=>{
                clearInterval(this.timerID)
            })
            this.chartInstance.on('mouseout',()=>{
                this.startInterval()
            })
        },
        /* async  */getData(ret){
            /* const {data:ret} = await this.$http.get(`rank`) */
            this.allData = ret
            /* 进行排序 大到小 */
            this.allData.sort((a,b)=>{
                return b.value-a.value
            })
            console.log(ret);
            this.updateChart()
            this.startInterval()
        },
        updateChart(){
            /* 颜色渐变 */
            const colorArr = [
                ['#0BA82C', '#4FF778'],
                ['#2E72BF', '#23E5E5'],
                ['#5052EE', '#AB6EE5']
            ]
            /* x轴数据 */
            const provinceArr = this.allData.map(item=>{
                return item.name
            })
            /* y轴数据 */
            const valueArr = this.allData.map(item=>{
                return item.value
            })
            const dataOption = {
                xAxis:{
                    data:provinceArr
                },
                series:[
                    {
                        data:valueArr,
                        itemStyle:{
                            color:(arg)=>{
                                let targetColorArr = null

                                if(arg.value > 300){
                                    targetColorArr = colorArr[0]
                                }else if(arg.value > 200){
                                    targetColorArr = colorArr[1]
                                }else{
                                    targetColorArr = colorArr[2]
                                }
                                return new this.$echarts.graphic.LinearGradient(0,0,0,1,[
                                    {offset:0,color:targetColorArr[0]},
                                    {offset:1,color:targetColorArr[1]}
                                ])
                            }
                        }
                    }
                ],
                dataZoom:{
                    show:false,
                    startValue:this.startValue,
                    endValue:this.endValue,
                }
            }
            this.chartInstance.setOption(dataOption)
        },
        screenAdapter(){
            const titleFontSize = this.$refs.rank_ref.offsetWidth /100 * 3.6
            const adapterOption = {
                title:{
                    textStyle:{
                        fontSize:titleFontSize
                    },
                },
            series:[
                {
                    barWidth:titleFontSize,
                    itemStyle:{
                        barBorderRadius:[titleFontSize / 2,titleFontSize / 2,0,0]
                    }
                }
            ]
            }
            this.chartInstance.setOption(adapterOption)
            this.chartInstance.resize()
        },
        /* 自动移动 */
        startInterval(){
            if(this.timerID){
                clearInterval(this.timerID)
            }
            this.timerID = setInterval(()=>{
                this.startValue++
                this.endValue++
                if(this.endValue > this.allData.length - 1){
                    this.startValue = 0
                    this.endValue = 9
                }
                this.updateChart()
            },2000)
        }
    }
}
</script>

<style>

</style>