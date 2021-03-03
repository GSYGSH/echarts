<template>
<div class="com-container">
    <div class="com-chart" ref="seller_ref">

    </div>
</div>
</template>

<script>
import {mapState} from 'vuex'
export default {
    data(){
        return {
            chartInstance:null,
            allData:null, //服务器返回的数据
            currentPage:1,
            totalPage:0,
            timerID:null//定时器
        }
    },
    created(){
        this.$socket.registerCallback('sellerData',this.getData)  
    },
    mounted(){
        this.initChart()
        /* this.getData() */
        this.$socket.send({
            action:'getData',
            socketType:'sellerData',
            chartName:'seller',
            value:''
        })
        window.addEventListener('resize',this.screenAdapter)
        this.screenAdapter()
    },
    destroyed(){
        clearInterval(this.timerID)
        window.removeEventListener('resize',this.screenAdapter)
        this.$socket.unRegisterCallback('sellerData')
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
        /* 初始化echartInstance对象 */
        initChart(){
            /* 初始化配置 */

            const initOption = {
                title:{
                    text:'▍商家销售统计',
                    textStyle:{
                        fontSize:60
                    },
                    left:20,
                    top:20
                },
                grid:{
                    top:'20%',
                    left:'3%',
                    right:'6%',
                    bottom:'3%',
                    containLabel:true
                },
                xAxis:{
                    type:'value'
                },
                yAxis:{
                    type:'category',
                },
                tooltip:{
                    trigger:'axis',
                    axisPointer:{
                        z:0,
                        type:'line',
                        lineStyle:{
                            width:66,
                            color:'#2D3443'
                        }
                    }
                },
                series:[
                    {
                        type:'bar',
                        barWidth:66,
                        label:{
                            show:true,
                            position:'right',                        
                            textStyle:{
                                color:'white'
                            },
                        },
                        itemStyle:{
                            barBorderRadius:[0,33,33,0],
                            /* x1,y1,x2,y2 */
                            color:new this.$echarts.graphic.LinearGradient(0,0,1,0,[
                                {/* 百分0状态下颜色值 */
                                    offset:0,
                                    color:'#5052EE'
                                },{
                                    /* 百分100状态下 */
                                    offset:1,
                                    color:'#AB6EE5'
                                }
                            ])
                        }
                    }
                ]  
            }
            this.chartInstance = this.$echarts.init(this.$refs.seller_ref,this.theme)
            
            this.chartInstance.setOption(initOption)
            /* 对图表鼠标对象监听 */
            this.chartInstance.on('mouseover',()=>{
                clearInterval(this.timerID)
            })
            this.chartInstance.on('mouseout',()=>{
                this.startInterval()
            })
        },
        /* 获取数据 */
        /* async  */getData(ret){
            /* const {data:ret} = await this.$http.get(`seller`) */
            this.allData = ret

            this.allData.sort((a,b)=>{
                return a.value - b.value //从小到大
            })
            console.log(ret);
            /* 五个元素展示一页 */
            this.totalPage = Math.ceil(this.allData.length / 5)
            this.updateChart()
            /* 启动定时器 */
            this.startInterval()
        },
        /* 更新图表 */
        updateChart(){
            const start = (this.currentPage - 1) * 5
            const end = (this.currentPage) * 5
            const showData = this.allData.slice(start,end)

            const sellerNames = showData.map((item)=>{
                return item.name
            })
            const sellerValue = showData.map((item)=>{
                return item.value
            })

            const dataoption = {
                yAxis:{
                    data:sellerNames
                },
                series:[
                    {
                        data:sellerValue,
                    }
                ]
            }
            this.chartInstance.setOption(dataoption)
        },
        startInterval(){
            if(this.timerID){
                clearInterval(this.timerID)
            }
            this.timerID = setInterval(()=>{
                this.currentPage++
                if(this.currentPage > this.totalPage){
                    this.currentPage = 1
                }
                this.updateChart()
            },3000)
        },
        /* 分辨率变化时进行更新 */
        screenAdapter(){
            console.log(this.$refs.seller_ref.offsetWidth);
            const titleFontSize = this.$refs.seller_ref.offsetWidth / 100 *3.6
            const adapterOption ={
                title:{
                    text:'▍商家销售统计',
                    textStyle:{
                        fontSize:titleFontSize
                    },
                    left:20,
                    top:20
                },
                tooltip:{
                    trigger:'axis',
                    axisPointer:{
                        z:0,
                        type:'line',
                        lineStyle:{
                            width:titleFontSize,
                            color:'#2D3443'
                        }
                    }
                },
                series:[
                    {
                        barWidth:titleFontSize,
                        itemStyle:{
                            barBorderRadius:[0,titleFontSize / 2,titleFontSize / 2,0],
                        }
                    }
                ]    
            }
            this.chartInstance.setOption(adapterOption)
            this.chartInstance.resize()
        }

    },
}
</script>

<style>

</style>