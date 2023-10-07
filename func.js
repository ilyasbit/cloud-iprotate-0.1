const ConfigParser = require('configparser')
const config = new ConfigParser()

async function parseConfig(req) {
  config.read('config.conf')
  const confList = config.sections()
  let tencentConfigList = []
  let civoConfigList = []
  let azureConfigList = []
  let awsConfigList = []
  let cloudflareConfig = {}
  let apiConfig = {}
  apiConfig.apiHostName = config.get('api', 'apiHostName')
  apiConfig.prefix = config.get('api', 'prefix')
  apiConfig.port = config.get('api', 'port')
  apiConfig.hostLocalIp = config.get('api', 'hostLocalIp')
  apiConfig.hostPublicIp = config.get('api', 'hostPublicIp')
  apiConfig.apiHostName = config.get('api', 'apiHostName')

  for (let i = 0; i < confList.length; i++) {
    const configName = confList[i]
    const configType = config.get(confList[i], 'type')
    const socks5Port = config.get(confList[i], 'socks5Port')
    const httpPort = config.get(confList[i], 'httpPort')
    const socks5User = config.get(confList[i], 'socks5User')
    const socks5Pass = config.get(confList[i], 'socks5Pass')
    let configration = {}
    configration.configName = confList[i]
    configration.socks5Port = socks5Port
    configration.httpPort = httpPort
    const hostUrl = req.protocol + '://' + req.get('host')
    const changeIpUrl = new URL(hostUrl)
    if (configType == 'civo') {
      changeIpUrl.pathname = `${apiConfig.prefix}/civo/newip`
    } else {
      changeIpUrl.pathname = `${apiConfig.prefix}/newip`
    }

    changeIpUrl.searchParams.append('configName', configName)
    configration.changeIpUrl = changeIpUrl
    if ((configType != 'api') | (configType != 'cloudflare')) {
      if (socks5User && socks5Pass) {
        configration.socks5User = socks5User
        configration.socks5Pass = socks5Pass
      }
    }
    if (configType == 'api') {
      continue
    } else if (configType == 'tencent') {
      const secretId = config.get(confList[i], 'secretId')
      const secretKey = config.get(confList[i], 'secretKey')
      const region = config.get(confList[i], 'region')
      const instanceId = config.get(confList[i], 'instanceId')
      configration = {
        ...configration,
        configName: configName,
        secretId: secretId,
        secretKey: secretKey,
        region: region,
        instanceId: instanceId,
      }

      tencentConfigList.push(configration)
    } else if (configType == 'cloudflare') {
      const email = config.get(confList[i], 'email')
      const token = config.get(confList[i], 'token')
      const domain = config.get(confList[i], 'domain')
      let zoneId = config.get(confList[i], 'zoneId')
      const configName = confList[i]
      cloudflareConfig.email = email
      cloudflareConfig.token = token
      cloudflareConfig.domain = domain
      cloudflareConfig.configName = configName
      if (zoneId) {
        cloudflareConfig.zoneId = zoneId
      }
    } else if (configType == 'azure') {
      const clientId = config.get(confList[i], 'clientId')
      const clientSecret = config.get(confList[i], 'clientSecret')
      const tenantId = config.get(confList[i], 'tenantId')
      const subscriptionId = config.get(confList[i], 'subscriptionId')
      const resourceGroupName = config.get(confList[i], 'resourceGroupName')
      const publicIpName = config.get(confList[i], 'publicIpName')
      const ipConfigName = config.get(confList[i], 'ipConfigName')
      const nicName = config.get(confList[i], 'nicName')
      const vmName = config.get(confList[i], 'vmName')
      configration = {
        ...configration,
        clientId: clientId,
        clientSecret: clientSecret,
        tenantId: tenantId,
        subscriptionId: subscriptionId,
        resourceGroupName: resourceGroupName,
        publicIpName: publicIpName,
        ipConfigName: ipConfigName,
        nicName: nicName,
        vmName: vmName,
      }
      azureConfigList.push(configration)
    } else if (configType == 'aws') {
      const accessKey = config.get(confList[i], 'accessKey')
      const secretKey = config.get(confList[i], 'secretKey')
      const instanceId = config.get(confList[i], 'instanceId')
      const region = config.get(confList[i], 'region')
      const socks5Port = config.get(confList[i], 'socks5Port')
      const httpPort = config.get(confList[i], 'httpPort')
      configration = {
        ...configration,
        configName: confList[i],
        accessKey: accessKey,
        secretKey: secretKey,
        instanceId: instanceId,
        region: region,
        socks5Port: socks5Port,
        httpPort: httpPort,
      }
      awsConfigList.push(configration)
    } else if (configType == 'civo') {
      const token = config.get(confList[i], 'token')
      const cookie = config.get(confList[i], 'cookie')
      const instanceId = config.get(confList[i], 'instanceId')
      const region = config.get(confList[i], 'region')
      configration = {
        ...configration,
        token: token,
        cookie: cookie,
        region: region,
        instanceId: instanceId,
      }
      civoConfigList.push(configration)
    }
  }
  return {
    configs: {
      api: apiConfig,
      cloudflare: cloudflareConfig,
      civo: civoConfigList,
      tencent: tencentConfigList,
      azure: azureConfigList,
      aws: awsConfigList,
    },
  }
}

exports.parseConfig = parseConfig
