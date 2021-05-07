module.exports = {
    outputDir: __dirname + '/../ko2/web',
    publicPath:process.env.NODE_ENV === 'production'?'/':'/',
    devServer: {
        port: 8999, //端口配置
        open:true //自动打开浏览器
        
    }
}