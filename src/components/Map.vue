<template>
  <div class="com-container" @dblclick='revertMap'>
      <div class="com-chart" ref="map_ref">
          
      </div>
  </div>
</template>

<script>
import {mapState} from 'vuex'
import axios from 'axios'
import {getProvinceMapInfo} from '@/utils/map_utils.js'
export default {
    data(){
        return {
            chartInstance:null,
            allData:[],
            /* 地图缓存 */
            mapData:{}
        }
    },
    created(){
        this.$socket.registerCallback('mapData',this.getData)
    },
    mounted(){
        this.initChart()
        /* this.getData() */
        this.$socket.send({
            action:'getData',
            socketType:'mapData',
            chartName:'map',
            value:''
        })
        window.addEventListener('resize',this.screenAdapter)
        this.screenAdapter()
    },
    destroyed() {
        window.removeEventListener('resize',this.screenAdapter)
        this.$socket.unRegisterCallback('mapData')
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
        async initChart(){
            this.chartInstance = this.$echarts.init(this.$refs.map_ref,this.theme)
            /* 获取中国矢量图数据 */
            const {data:ret} = await axios.get(`http://47.243.97.66/static/map/china.json`)
            this.$echarts.registerMap('china',ret)
            const initOption = {
                title:{
                    text:'▍商家分布',
                    left:20,
                    top:20,
                },
                geo:{
                    type:'map',
                    map:'china',
                    top:'5%',
                    bottom:'5%',
                    itemStyle:{
                        areaColor:'#2E72BF',
                        borderColor:'#333'
                    }
                },
                legend:{
                    left:'5%',
                    bottom:'5%',
                    orient:'vertical'//排列方式
                }
            }
            this.chartInstance.setOption(initOption)

            /* 监听地图点击 */
            this.chartInstance.on('click',async (arg)=>{
                /* arg.name获取到省份中文名字，然后将中文转换成拼音,通过map_utils工具转换 */
                const provinceInfo = getProvinceMapInfo(arg.name)//包含key,path

                /* 获取省份地图矢量数据,对地图缓存，防止多次发起请求 */
                if(!this.mapData[provinceInfo.key]){
                    const {data:ret} = await axios.get(`47.243.97.66`+ provinceInfo.path)
                    this.mapData[provinceInfo.key] = ret
                    this.$echarts.registerMap(provinceInfo.key,ret)
                }


                const changeOption = {
                    geo:{
                        map:provinceInfo.key,
                    }
                }
                this.chartInstance.setOption(changeOption)
            })
        },
        /* async */ getData(ret){
            /* const {data:ret} = await this.$http.get(`map`) */
            console.log(ret);
            this.allData = ret
            this.updateChart()
        },
        updateChart(){
            /* 图例的数据 */
            const legendArr = this.allData.map(item=>{
                return item.name
            })
            const seriesArr = this.allData.map(item=>{
                return {
                    /* 一个类别下的所有散点数据 */
                    type:"effectScatter",
                    rippleEffect:{
                        scale:7,
                        period:2,
                        brushType:'stroke',
                        
                    },
                    name:item.name,
                    data:item.children,
                    coordinateSystem:'geo'/* 将会使用坐标系统 */
                }
            })
            const dataOption = {
                series:seriesArr,
                legend:{
                    data:legendArr
                }
            }   
            this.chartInstance.setOption(dataOption)
        },
        screenAdapter(){
            const titleFontSize = this.$refs.map_ref.offsetWidth / 100 * 3.6
            const adapterOption = {
                title:{
                    textStyle:{
                        fontSize:titleFontSize
                    },
                },
                legend:{
                    itemWidth:titleFontSize / 2,
                    itemHeight:titleFontSize / 2,
                    itemGap:titleFontSize / 2,
                    textStyle:{
                        fontSize:titleFontSize / 2
                    }
                } 
            }
            this.chartInstance.setOption(adapterOption)
            this.chartInstance.resize()
        },
        /* 返回中国地图 */
        revertMap(){
            const revertOption ={
                geo:{
                    map:'china'
                }
            }
            this.chartInstance.setOption(revertOption)
        },



    }
}
</script>

<style>

</style>