# 安全内容自动化协议(SCAP)

- **SCAP简介**
	- **Standards**
	- **Contents**
	- **Tools**
- **SCAP应用场景**
	- **资产漏洞评估(OVAL)**
	- **系统安全合规(XCCDF)**
- **OpenSCAP** 
	
	- **openscap简介**
	
	- **资产漏洞评估示例**
	
	- **系统安全合规示例**
-  **参考链接**

## SCAP简介

SCAP - Security Content Automation Protocol, 即 “安全内容自动化协议”.

SCAP 是由美国国家标准与技术研究院(NIST)制定的一套安全规范, 旨在解决以下三个问题:

- 信息系统安全等保落地
- 资产漏洞评估
- 信息系统安全合规(自动化)

**SCAP官网:**

​	[Security Content Automation Protocol](https://csrc.nist.gov/Projects/Security-Content-Automation-Protocol)

官网上是这样介绍SCAP

> ​	The Security Content Automation Protocol (SCAP) is a synthesis of interoperable specifications derived from community ideas

简单翻译为: SCAP是结合社区可协作规范的产物. 因此SCAP不仅仅一套安全规范, 而且是一套可以实现安全落地的规范.

![OSCAP](https://raw.githubusercontent.com/Sep0lkit/Blog/master/posts/_static/imgs/1567836508520.png)

------

### Standards

Standards即SCAP标准, 也成为协议(SCAP Protocol).   Standards由一系列已有的公开标准构成, 用于表达/交换/处理Centent.  这些公开的标准被称为SCAP Element(SCAP元素), SCAP主要包含以下元素:  OVAL / XCCDF / OCIL / CPE / CVSS / ARF . 

有关这些元素在后续的文章中会详细说明, 完整的元素可以见SCAP官网.

### Contents

Contents即内容, 也成为策略(Security Policies).  Contents描述了要采集的端点状态信息, 符合标准状态信息以及对应的检测方式和修复脚本.

通俗的解释就是Contents是遵守SCAP Standard撰写的一系列检测规则和修复脚本, 其实体是一个或者多个xml文件.

### Tools

Tools即工具, 也成为扫描器(SCAP Scanner). Tools根据Contents的内容, 按照Standards标准收集系统信息, 对系统进行安全评估, 识别系统上的软件漏洞和不合规的配置.

目前使用比较广泛的是由OpenSCAP提供的扫描器:

​		[**oscap**](https://www.open-scap.org/tools/openscap-base/): OpenSCAP提供的命令行模式的扫描器

​		[**scap-workbench**](https://www.open-scap.org/tools/scap-workbench/): OpenSCAP提供的图形化的扫描器

## SCAP应用场景		

SCAP主要用于以下两个场景:

- **资产漏洞评估(OVAL)**
- **系统安全合规(XCCDF)**

**资产漏洞评估**

资产漏洞评估即识别目标系统的软件服务, 标识是否存在已知的安全漏洞.  漏洞资产评估主要使用OVAL定义, OVAL全称为*Open Vulnerability and Assessment Language*, 即开放漏洞评估语言. 

很多系统软发行商会提供对应的漏洞OVAL漏洞定义, 用于SCAP进行漏洞进行资产漏洞评估. 如:

- [Redhat](https://www.redhat.com/security/data/oval/)
- [Ubuntu](https://people.canonical.com/~ubuntu-security/oval/)
- [Debian](https://www.debian.org/security/oval/)
- [SUSE](http://ftp.suse.com/pub/projects/security/oval/)
- **...**

**系统安全合规**

系统安全合规即检测目标系统安全策略配置, 是否符合等级保护或者企业自身的安全基线要求. 系统安全评估主要使用XCCDF定义, XCCDF全称Extensible Configuration Checklist Description Format, 即可扩展配置清单描述格式.

目前使用比较广泛的是OpenSCAP提供的ssg-content:

- [ssg-content ](https://github.com/ComplianceAsCode/content): OpenSCAP开源项目提供的一些列安全策略, 包括(redhat/ubuntu/opensuse/windows等)

> 注: 有关上述的SCAP元素, OVAL/XCCDF会在后续的文章中说明, 这里仅仅了解即可.
>

## OpenSCAP

上面介绍了SCAP以及SCAP的应用场景, 那么下面我们通过实际的示例来更加了解SCAP, 这里需要介绍另一个开源项目OpenSCAP.

### OpenSCAP简介

OpenSCAP是一个开源的SCAP实现, 包括扫描器(oscap/scap-workbench), 以及SCAP Contents(ssg-content).

**官网:** [OpenSCAP](https://www.open-scap.org/)	

**Github:** [https://github.com/OpenSCAP](https://github.com/OpenSCAP)

下面我们将使用OpenSCAP对我们的系统进行资产漏洞评估以及系统安全合规检查,  OpenSCAP是跨平台的,  下面我们以Redhat 7系统为例.

**OpenSCAP安装**

```bash
#安装openscap
yum install openscap openscap-scanner
oscap --version
```

### 资产漏洞评估示例

首先我们需要从redhat security官方下载对应系统的OVAL漏洞定义, 然后对系统进行资产漏洞评估.

```bash
#下载redhat oval
wget https://www.redhat.com/security/data/oval/com.redhat.rhsa-RHEL7.xml

#使用oscap进行漏洞扫描
oscap info com.redhat.rhsa-RHEL7.xml 
oscap oval eval --report redhat7-oval.html com.redhat.rhsa-RHEL7.xml
```

**Console输出:**

![1567868259299](https://raw.githubusercontent.com/Sep0lkit/Blog/master/posts/_static/imgs/1567868259299.png)

**HTML报表:**

![1567868494515](https://raw.githubusercontent.com/Sep0lkit/Blog/master/posts/_static/imgs/1567868494515.png)

Class=path AND Result=true的表示系统上存在此漏洞, 以及漏洞对应的CVE和Title. 可以快速获取系统上存在漏洞的资产.

### 系统安全合规示例

在我们对系统进行安全合规检查之前, 我们需要scap content, 我们采用openscap提供的ssg-content.

```bash
#下载ssg-content
#可以通过yum安装也可以通过git获取最新的ssg-content
yum install scap-security-guide

#使用oscap进行配置合规检查
oscap info /usr/share/xml/scap/ssg/content/ssg-rhel7-ds.xml
oscap xccdf eval --profile  xccdf_org.ssgproject.content_profile_stig-rhel7-disa \
--report redhat7-xccdf.html  /usr/share/xml/scap/ssg/content/ssg-rhel7-ds.xml
```

oscap info查看content文件, 我们可以选择不同的profile,  比如STIG规范或者PCI安全规范. 

**Console输出:**

![1567870993083](https://raw.githubusercontent.com/Sep0lkit/Blog/master/posts/_static/imgs/1567870993083.png)

**HTML报表:**

![1567870887010](https://raw.githubusercontent.com/Sep0lkit/Blog/master/posts/_static/imgs/1567870887010.png)

Result=pass 表示此检测项通过, fail表示检测不通过, 如上面的"Disable SSH Access via Empty Passwords", 表示禁止空密码登陆SSH的检测未通过.  通过OSCAP可以快速检测系统是否符合安全基线标准.



***以上完整的检测报告已上传, 下载地址:***

[scap-introduce.zip](https://raw.githubusercontent.com/Sep0lkit/Blog/master/posts/_assets/scap/scap-introduce.zip)

### **未完待续**

本文仅仅对SCAP做了简单介绍, 限于篇幅有限所以SCAP的其他功能特性无法一一说明, 其实SCAP能做的还有很多:

- 自动化修复
- 自定义content
- 初始化安全配置

## 参考链接:

> - https://www.open-scap.org/getting-started/
> - https://blog.csdn.net/langkew/article/details/8795530
> - https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/security_guide/chap-compliance_and_vulnerability_scanning
>


