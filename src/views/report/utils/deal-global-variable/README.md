## 全局变量处理  

这里全局变量处理会有几个问题
如果存在localstorage 里面，如果有人吧列表存进去，那缓存可能会爆炸（最大5M），好处是开发简单，调试方便
如果存内存，需要一套完善的同步机制，调试有一定困难