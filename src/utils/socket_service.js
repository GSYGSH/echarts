export default class SocketService {
  /* 
    单例
  */
  static instance = null
  static get Instance() {
    if (!this.instance) {
      /* 初始化了一个实例 */
      this.instance = new SocketService()
    }
    return this.instance
  }
  /* 和服务器端连接的socket对象 */
  ws = null
  // 存储回调函数
  callBackMapping = {}

  //判断连接
  connected = false

  //重试发送次数
  sendRetryCount = 0

  // 重新连接尝试的次数
  connectRetryCount = 0

  /* 定义连接服务器方法 */
  connect() {
    if (!window.WebSocket) {
      return console.log('您的浏览器不支持Websocket');
    } else {
      this.ws = new WebSocket('ws://localhost:9998')

      /* 连接成功 */
      this.ws.onopen = () => {
        console.log('连接服务端成功');
        this.connected = true
        this.connectRetryCount = 0
      }
      /* 连接服务端失败 */
      this.ws.onclose = () => {
        console.log('连接服务端失败');
        this.connected = false
        this.connectRetryCount++
        setTimeout(() => {
          this.connect()
        },500 * this.connectRetryCount)
      }
      /* 得到服务端发送过来的数据 */
      this.ws.onmessage = (msg) => {
        console.log('从服务端获取到了数据');
        let recvData = JSON.parse(msg.data)
        let action = recvData.action
        let socketType = recvData.socketType
        //服务端发送过来的数据
        if (this.callBackMapping[socketType]) {

          if (action === 'getData') {
            /* 注意：msg.data.data才是数据,且data里面包含是字符串形式 */
            let realData = JSON.parse(recvData.data)
            /* 
              1.利用对象中对应的回调函数，调用
              2.this.callBackMapping[scoketType] = callback.call(this,realData)
              3.组件中注册了 this.$socket.registerCallback('trendData',this.getData){
                this.callBackMapping['trendData'] = this.getData
              }
            */
            this.callBackMapping[socketType].call(this, realData)
          } else if (action === 'fullScreen') {
            this.callBackMapping[socketType].call(this, recvData)
          } else if (action === 'themeChange') {
            this.callBackMapping[socketType].call(this, recvData)
          }

        }
      }
    }
  }
  registerCallback(socketType,callback) {
    this.callBackMapping[socketType] = callback
  }
  unRegisterCallback(socketType) {
    this.callBackMapping[socketType] = null   
  }
  send(data) {
    if (this.connected) {
      this.sendRetryCount = 0
      this.ws.send(JSON.stringify(data))
    } else {
      this.sendRetryCount++
      setTimeout(() => {
        console.log(this);
        this.ws.send(JSON.stringify(data))
      },this.sendRetryCount*500)
    }
  }
}