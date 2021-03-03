<template>
  <div class="com-container">
      <div class="com-chart" ref='stock_ref'>
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
            currentIndex:0,
            timerID:null
        }
    },
    created(){
        this.$socket.registerCallback('stockData',this.getData)
    },
    mounted(){
        this.initChart()
        /* this.getData() */
        this.$socket.send({
            action:'getData',
            socketType:'stockData',
            chartName:'stock',
            value:''
        })
        window.addEventListener('resize',this.screenAdapter)
        this.screenAdapter()
        
    },
    destroyed(){    
        window.removeEventListener('resize',this.screenAdapter)
        clearInterval(this.timerID)
        this.$socket.unRegisterCallback('stockData')
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
            this.chartInstance = this.$echarts.init(this.$refs.stock_ref,this.theme)
            const initOption = {
                title:{
                    text:'▎ 库存和销量分析',
                    left:20,
                    top:20
                }
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
            /* const {data:ret} = await this.$http.get(`stock`) */
            console.log(ret);
            this.allData = ret
            this.updateChart()
            this.startInterval()
        },
        updateChart(){
            const centerArr = [
                ['18%', '40%'],
                ['50%', '40%'],
                ['82%', '40%'],
                ['34%', '75%'],
                ['66%', '75%']
            ]
            const colorArr = [
                ['#4FF778', '#0BA82C'],
                ['#E5DD45', '#E8B11C'],
                ['#E8821C', '#E55445'],
                ['#5052EE', '#AB6EE5'],
                ['#23E5E5', '#2E72BF']
            ]
            const start = this.currentIndex * 5
            const end = (this.currentIndex + 1) * 5
            const showData = this.allData.slice(start,end)
            const seriesArr= showData.map((item,index)=>{
                return {
                    type:'pie',
                    center:centerArr[index],
                    hoverAnimation:false,//移入动画效果
                    labelLine:{
                        show:false
                    },
                    label:{
                        position:'center', //居中
                        color:colorArr[index][0]
                    },
                    data:[
                        {
                            value:item.sales,
                            name:item.name + '\n\n' + '已售出' + item.sales,
                            itemStyle:{
                                color:new this.$echarts.graphic.LinearGradient(0,1,0,0,[
                                    {offset:0,color:colorArr[index][0]},
                                    {offset:1,color:colorArr[index][1]}
                                ])
                            }
                        },
                        {
                            value:item.stock,
                            itemStyle:{
                                color:'#ccc'
                            }
                        }
                    ]
                }
            })
            const dataOption = {
                series:seriesArr
            }
            this.chartInstance.setOption(dataOption)

    
        },
        screenAdapter(){
            const titleFontSize = this.$refs.stock_ref.offsetWidth / 100 * 3.6
            const innerRadius = titleFontSize * 2.5
            const outterRadius = innerRadius * 1.3
            const adapterOption = {
                title:{
                    textStyle:{
                        fontSize:titleFontSize
                    },
                },
                series:[
                    {   
                        type:'pie',
                        radius:[outterRadius,innerRadius],
                        label:{
                            fontSize:titleFontSize / 1.5
                        }
                    },
                    {
                        type:'pie',
                        radius:[outterRadius,innerRadius],
                        label:{
                            fontSize:titleFontSize / 1.5
                        }
                    },
                    {
                        type:'pie',
                        radius:[outterRadius,innerRadius],
                        label:{
                            fontSize:titleFontSize /  1.5
                        }
                    },
                    {
                        type:'pie',
                        radius:[outterRadius,innerRadius],
                        label:{
                            fontSize:titleFontSize /  1.5
                        }
                    },
                    {
                        type:'pie',
                        radius:[outterRadius,innerRadius],
                        label:{
                            fontSize:titleFontSize /  1.5
                        }
                    },
                ]
            }
            this.chartInstance.setOption(adapterOption)
            this.chartInstance.resize()
        },
        startInterval(){
            if(this.timerID){
                clearInterval(this.timerID)
            }
            this.timerID = setInterval(() => {
                this.currentIndex++
                if(this.currentIndex > 1){//一共10项数据
                    this.currentIndex = 0
                }
                this.updateChart()
            }, 2000);
        }
    }
}
</script>

<style>

</style>