'use strict'

const net = require('net')
const xmlJs = require('xml-js')

module.exports.xmlMap = (jsObject) => {
  const mapped = {
    isomsg: {
    }
  }
  if (jsObject.header) {
    mapped.isomsg.header = {
      _text: jsObject.header
    }
  }

  if (jsObject.field) {
    mapped.isomsg.field = []
    Object.keys(jsObject.field).forEach(id => {
      const attributes = {
        id: String(id),
        value: String(jsObject.field[id])
      }
      if (jsObject.fieldAttr && jsObject.fieldAttr[id]) {
        attributes.encoding = jsObject.fieldAttr[id].encoding
        attributes.type = jsObject.fieldAttr[id].type
      }
      mapped.isomsg.field.push({
        _attributes: attributes
      })
    })
  }

  return mapped
}

module.exports.xmlUnmap = (xmlObject) => {
  const mapped = {}
  if (xmlObject.isomsg) {
    if (xmlObject.isomsg.header && xmlObject.isomsg.header._text) {
      mapped.header = xmlObject.isomsg.header._text
    }
    if (Array.isArray(xmlObject.isomsg.field)) {
      mapped.field = {}
      mapped.fieldAttr = {}
      xmlObject.isomsg.field.forEach(field => {
        mapped.field[field._attributes.id] = field._attributes.value
        if (field._attributes.type || field._attributes.encoding) {
          mapped.fieldAttr[field._attributes.id] = {}
          if (field._attributes.type) {
            mapped.fieldAttr[field._attributes.id].type = field._attributes.type
          }
          if (field._attributes.encoding) {
            mapped.fieldAttr[field._attributes.id].encoding = field._attributes.encoding
          }
        }
      })
    }
  }
  return mapped
}

module.exports.request = (host, port, jsObject, options = {}) => {
  return new Promise((resolve, reject) => {
    options = Object.assign(
      {
        timeout: 25000
      }, options
    )

    let dataResp = ''
    const xmlObject = exports.xmlMap(jsObject)
    let jsObjectResp
    const clientSocket = new net.Socket()

    clientSocket.setEncoding('utf8')
    clientSocket.setTimeout(options.timeout)

    clientSocket.on('data', (data) => {
      dataResp += data
      try {
        if (dataResp.includes('</isomsg>\n')) {
          clientSocket.end()
          jsObjectResp = exports.xmlUnmap(xmlJs.xml2js(dataResp, { compact: true }))
          resolve(jsObjectResp)
        }
      } catch (err) {
        clientSocket.destroy()
        reject(err)
      }
    })

    clientSocket.on('timeout', () => {
      if (!jsObjectResp) {
        clientSocket.end()
        resolve()
      }
    })

    clientSocket.on('end', () => resolve())

    clientSocket.on('error', (err) => reject(err))

    clientSocket.connect({ port, host }, () => {
      clientSocket.write(xmlJs.js2xml(xmlObject, { compact: true }))
      clientSocket.write('\n')
    })
  })
}
