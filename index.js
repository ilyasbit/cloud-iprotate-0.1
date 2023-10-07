require('dotenv').config()
const express = require('express')
const app = express()
//const cronJobs = require('./cron')
const mongoose = require('mongoose')
const morgan = require('morgan')
const momentTimezone = require('moment-timezone')
const serveIndex = require('serve-index')
const path = require('path')
const fs = require('fs')
var rfs = require('rotating-file-stream')
const helmet = require('helmet')
const mainFunc = require('./func.js')
const parseConfig = mainFunc.parseConfig
const axios = require('axios')
const { spawn } = require('child_process')
const { performance } = require('perf_hooks')
const { SocksProxyAgent } = require('socks-proxy-agent')
const tencentcloud = require('tencentcloud-sdk-nodejs')
const { DefaultAzureCredential } = require('@azure/identity')
const { NetworkManagementClient } = require('@azure/arm-network')
const {
  EC2Client,
  AllocateAddressCommand,
  DisassociateAddressCommand,
  AssociateAddressCommand,
  DescribeAddressesCommand,
  ReleaseAddressCommand,
  DescribeInstancesCommand,
} = require('@aws-sdk/client-ec2')
const ConfigParser = require('configparser')
const { exec } = require('child_process')

const config = new ConfigParser()

app.use(helmet())
app.use(express.json())
app.use(express.json({ extended: true }))

const generateLogFileName = () => {
  const currentDate = new Date()
  const year = currentDate.getFullYear()
  const month = String(currentDate.getMonth() + 1).padStart(2, '0')
  const day = String(currentDate.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}.log`
}

morgan.token('date', (req, res) => {
  return momentTimezone()
    .tz('Asia/Jakarta')
    .format('DD MMM YYYY HH:mm:ss [GMT+7]')
})

const accessLogStream = rfs.createStream(generateLogFileName, {
  path: path.join(__dirname, 'logs'),
  compress: 'gzip',
})

const morganFormat =
  '[:date[web]] :remote-addr :method ":url" ":status" :response-time MS :res[content-length] bytes - :user-agent'
app.use(
  morgan(morganFormat, {
    stream: accessLogStream,
  })
)
app.use(morgan(morganFormat))
app.enable('trust proxy')

app.use(express.static('public'))
app.use(
  '/files',
  express.static('public/files'),
  serveIndex('public/files', { icons: true })
)

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`)
})

app.get('/checkConfig', async (req, res) => {
  const { configs } = await parseConfig(req)
  res.send(configs)
})
